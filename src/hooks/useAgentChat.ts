import { useState, useCallback, useRef } from 'react';
import { ChatStorageManager } from '../lib/auth/chat/chatStorage';
import { ChatRecoveryManager } from '../lib/auth/chat/chatRecovery';

interface AgentChatState {
  isLoading: boolean;
  error: string | null;
  content: string;
  suggestions: string[];
  autoFillData: any;
  isComplete: boolean;
  conversationId: string | null;
}

interface UseAgentChatOptions {
  stageId: string;
  currentStageData: any;
  allStageData: any;
  onAutoFill?: (data: any) => void;
  onStageComplete?: () => void;
}

export const useAgentChat = ({
  stageId,
  currentStageData,
  allStageData,
  onAutoFill,
  onStageComplete
}: UseAgentChatOptions) => {
  const [state, setState] = useState<AgentChatState>({
    isLoading: false,
    error: null,
    content: '',
    suggestions: [],
    autoFillData: {},
    isComplete: false,
    conversationId: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 4;
  const baseRetryDelay = 1000;

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const createConversation = useCallback(async () => {
    try {
      const conversation = await ChatStorageManager.createConversation(stageId, {
        currentStageData,
        allStageData,
        timestamp: new Date().toISOString()
      });
      return conversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to initialize conversation');
    }
  }, [stageId, currentStageData, allStageData]);

  const processStreamResponse = useCallback(async (
    response: Response,
    conversationId: string
  ): Promise<void> => {
    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let tokenIndex = 0;
    const tokens: Array<{ index: number; content: string; type: string }> = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                setState(prev => ({ ...prev, content: data.content }));
                tokens.push({
                  index: tokenIndex++,
                  content: data.content,
                  type: 'content'
                });
              } else if (data.type === 'complete') {
                setState(prev => ({
                  ...prev,
                  suggestions: data.suggestions || [],
                  autoFillData: data.autoFillData || {},
                  isComplete: true
                }));

                // Save complete response
                await ChatStorageManager.saveCompleteResponse(conversationId, {
                  full_content: data.content,
                  suggestions: data.suggestions || [],
                  auto_fill_data: data.autoFillData || {},
                  stage_complete: data.stageComplete || false,
                  context: data.context || {}
                });

                // Trigger callbacks
                if (data.autoFillData && onAutoFill) {
                  onAutoFill(data.autoFillData);
                }
                if (data.stageComplete && onStageComplete) {
                  onStageComplete();
                }

                // Update conversation status
                await ChatStorageManager.updateConversationStatus(conversationId, 'completed');
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Stream error occurred');
              }
            } catch (parseError) {
              console.warn('Failed to parse stream data:', parseError);
            }
          }
        }
      }

      // Save tokens if any were collected
      if (tokens.length > 0) {
        await ChatStorageManager.saveResponseTokens(conversationId, tokens);
      }

    } finally {
      reader.releaseLock();
    }
  }, [onAutoFill, onStageComplete]);

  const callAgentFunction = useCallback(async (
    conversationId: string,
    userMessage: string,
    signal: AbortSignal
  ): Promise<void> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const requestBody = {
      stageId,
      currentStageData,
      allStageData,
      userMessage,
      conversationId,
      memory: {},
      conversationHistory: []
    };

    const response = await fetch(`${supabaseUrl}/functions/v1/agent-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Agent function failed: ${response.status} - ${errorText}`);
    }

    await processStreamResponse(response, conversationId);
  }, [stageId, currentStageData, allStageData, processStreamResponse]);

  const attemptRecovery = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting conversation recovery...');
      
      // Check if conversation has any tokens to recover
      const lastTokenIndex = await ChatStorageManager.getLastTokenIndex(conversationId);
      if (lastTokenIndex < 0) {
        console.log('📝 No tokens to recover, starting fresh');
        return false;
      }

      const recovery = await ChatRecoveryManager.recoverConversation(conversationId, lastTokenIndex);
      
      if (recovery.success && recovery.content) {
        setState(prev => ({
          ...prev,
          content: recovery.content || '',
          suggestions: recovery.suggestions || [],
          autoFillData: recovery.autoFillData || {},
          isComplete: recovery.isComplete || false
        }));
        
        console.log('✅ Recovery successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Recovery failed:', error);
      return false;
    }
  }, []);

  const sendMessage = useCallback(async (userMessage: string): Promise<void> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      content: '',
      suggestions: [],
      autoFillData: {},
      isComplete: false
    }));

    retryCountRef.current = 0;

    const attemptRequest = async (): Promise<void> => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Get or create conversation
        let conversationId = state.conversationId;
        if (!conversationId) {
          conversationId = await createConversation();
          setState(prev => ({ ...prev, conversationId }));
        }

        // Try recovery first if this is a retry
        if (retryCountRef.current > 0) {
          const recovered = await attemptRecovery(conversationId);
          if (recovered) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
          }
        }

        // Make the request
        await callAgentFunction(conversationId, userMessage, controller.signal);
        
        // Success
        setState(prev => ({ ...prev, isLoading: false }));
        retryCountRef.current = 0;

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('🔌 Request aborted');
          return;
        }

        console.error(`❌ Agent request failed (attempt ${retryCountRef.current + 1}/${maxRetries}):`, error);

        // Check if we should retry
        const isRetryable = !error.message?.includes('401') && 
                           !error.message?.includes('403') &&
                           retryCountRef.current < maxRetries - 1;

        if (isRetryable) {
          retryCountRef.current++;
          const delay = baseRetryDelay * Math.pow(2, retryCountRef.current - 1);
          
          console.log(`⏳ Retrying in ${delay}ms...`);
          setTimeout(attemptRequest, delay);
        } else {
          console.error('❌ Max retries reached or non-retryable error');
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'Failed to get response from AI assistant'
          }));
        }
      }
    };

    await attemptRequest();
  }, [state.conversationId, createConversation, attemptRecovery, callAgentFunction]);

  const retry = useCallback(() => {
    if (state.error) {
      // Get the last user message from some state or re-prompt
      // For now, we'll just clear the error and let user send again
      clearError();
    }
  }, [state.error, clearError]);

  return {
    ...state,
    sendMessage,
    retry,
    clearError,
    isStreaming: state.isLoading && !!state.content
  };
};