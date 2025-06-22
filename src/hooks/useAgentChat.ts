import { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
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
  const { user, session } = useAuth();
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
      // Check authentication first
      if (!user || !session?.access_token) {
        throw new Error('Authentication required. Please sign in to start a conversation.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration');
      }

      console.log('🔐 Creating conversation with authenticated user:', user.id);
      const response = await fetch(`${supabaseUrl}/rest/v1/chat_conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          user_id: user.id,
          stage_id: stageId,
          status: 'active',
          metadata: {
            currentStageData,
            allStageData,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        let errorData: any = {};
        let errorMessage = 'Unknown error';
        
        try {
          const responseText = await response.text();
          console.log('📄 Raw response text:', responseText);
          
          if (responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorData.error || 'Server error';
            } catch (parseError) {
              console.warn('⚠️ Failed to parse error response as JSON, using text:', parseError);
              errorMessage = responseText;
            }
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (textError) {
          console.error('❌ Failed to read response text:', textError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error('❌ Conversation creation failed:', {
          status: response.status,
          error: errorMessage,
          userId: user.id,
          stageId
        });
        throw new Error(`Failed to create conversation: ${response.status} - ${errorMessage}`);
      }

      let data: any;
      try {
        const responseText = await response.text();
        if (!responseText.trim()) {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse successful response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      const conversation = Array.isArray(data) ? data[0] : data;
      
      if (!conversation?.id) {
        throw new Error('Invalid conversation response from server');
      }
      
      console.log('✅ Conversation created successfully:', conversation.id);
      return conversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error; // Re-throw the original error with its message
    }
  }, [stageId, currentStageData, allStageData, user, session]);

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
              } else if (data.type === 'complete') {
                setState(prev => ({
                  ...prev,
                  suggestions: data.suggestions || [],
                  autoFillData: data.autoFillData || {},
                  isComplete: true
                }));

                // Trigger callbacks
                if (data.autoFillData && onAutoFill) {
                  onAutoFill(data.autoFillData);
                }
                if (data.stageComplete && onStageComplete) {
                  onStageComplete();
                }
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Stream error occurred');
              }
            } catch (parseError) {
              console.warn('Failed to parse stream data:', parseError);
            }
          }
        }
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
    // Check authentication
    if (!session?.access_token) {
      throw new Error('Authentication required for agent requests');
    }

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
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      
      try {
        const responseText = await response.text();
        console.log('📄 Agent error response text:', responseText);
        
        if (responseText.trim()) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || 'Server error';
          } catch (parseError) {
            console.warn('⚠️ Failed to parse agent error response as JSON:', parseError);
            errorMessage = responseText;
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (textError) {
        console.error('❌ Failed to read agent error response:', textError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(`Agent function failed: ${response.status} - ${errorMessage}`);
    }

    await processStreamResponse(response, conversationId);
  }, [stageId, currentStageData, allStageData, processStreamResponse, session]);

  const attemptRecovery = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting conversation recovery...');
      
      const recovery = await ChatRecoveryManager.recoverConversation(conversationId);
      
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
    // Early authentication check
    if (!user || !session?.access_token) {
      setState(prev => ({
        ...prev,
        error: 'Please sign in to chat with the AI assistant'
      }));
      return;
    }

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
            error: error.message?.includes('Authentication required') 
              ? 'Please sign in to continue chatting'
              : error.message || 'Failed to get response from AI assistant'
          }));
        }
      }
    };

    await attemptRequest();
  }, [state.conversationId, createConversation, attemptRecovery, callAgentFunction, user, session]);

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