import { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { ChatRecoveryManager } from '../lib/auth/chat/chatRecovery';
import { createLLMClient, LLMRequest } from '../lib/llm/llmClient';

interface AgentChatState {
  isLoading: boolean;
  error: string | null;
  content: string;
  suggestions: string[];
  autoFillData: any;
  isComplete: boolean;
  conversationId: string | null;
  historyMessages: ChatMessage[];
}

interface UseAgentChatOptions {
  stageId: string;
  currentStageData: any;
  allStageData: any;
  onAutoFill?: (data: any) => void;
  onStageComplete?: () => void;
  llmProvider?: 'openai' | 'anthropic';
  useDirectLLM?: boolean;
  // Add these to connect with AgentContextProvider
  memory?: any;
  recommendations?: any[];
}

export const useAgentChat = ({
  stageId,
  currentStageData,
  allStageData,
  onAutoFill,
  onStageComplete,
  llmProvider = 'openai',
  useDirectLLM = false,
  memory = {}, // Add this
  recommendations = [] // Add this
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
    historyMessages: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 4;
  const baseRetryDelay = 1000;

  // Initialize LLM client for direct usage
  const llmClientRef = useRef<ReturnType<typeof createLLMClient> | null>(null);

  const initializeLLMClient = useCallback(() => {
    if (!llmClientRef.current && useDirectLLM) {
      const apiKey = llmProvider === 'openai' 
        ? import.meta.env.VITE_OPENAI_API_KEY 
        : import.meta.env.VITE_ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        console.warn(`⚠️ ${llmProvider.toUpperCase()} API key not found, falling back to Edge Function`);
        return null;
      }

      llmClientRef.current = createLLMClient({
        provider: llmProvider,
        apiKey,
        model: llmProvider === 'openai' ? 'gpt-4o-mini' : 'claude-3-sonnet-20240229'
      });
    }
    return llmClientRef.current;
  }, [llmProvider, useDirectLLM]);

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
      console.log('🌐 Supabase URL:', supabaseUrl);
      console.log('🔑 Has anon key:', !!supabaseAnonKey);
      
      const requestBody = {
        stage_id: stageId,
        metadata: {
          currentStageData,
          allStageData,
          timestamp: new Date().toISOString(),
          llmProvider,
          useDirectLLM
        }
      };
      
      console.log('📦 Request body:', requestBody);

      const response = await fetch(`${supabaseUrl}/rest/v1/chat_conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Prefer': 'return=representation'  // Add this to get the created record back
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.log('❌ Error response text:', responseText);
        throw new Error(`Failed to create conversation: ${response.status} - ${responseText}`);
      }

      const responseText = await response.text();
      console.log('✅ Success response text:', responseText);
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(responseText);
      const conversation = Array.isArray(data) ? data[0] : data;
      
      if (!conversation?.id) {
        throw new Error('Invalid conversation response from server');
      }
      
      console.log('✅ Conversation created successfully:', conversation.id);
      
      // Load existing chat history for this conversation
      await loadChatHistory(conversation.id);
      
      return conversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }, [stageId, currentStageData, allStageData, user, session, llmProvider, useDirectLLM]);

  // Load chat history from database
  const loadChatHistory = useCallback(async (conversationId: string) => {
    try {
      console.log('📚 Loading chat history for conversation:', conversationId);
      const chatResponses = await ChatStorageManager.getChatResponsesForConversation(conversationId);
      
      const historyMessages: ChatMessage[] = [];
      
      chatResponses.forEach((response) => {
        // Add user message
        if (response.user_prompt) {
          historyMessages.push({
            id: `user-${response.id}`,
            content: response.user_prompt,
            timestamp: new Date(response.created_at),
            type: 'user',
          });
        }
        
        // Add assistant message
        if (response.full_content) {
          historyMessages.push({
            id: `assistant-${response.id}`,
            content: response.full_content,
            timestamp: new Date(response.updated_at || response.created_at),
            type: 'assistant',
            suggestions: response.suggestions || [],
            autoFillData: response.auto_fill_data || {},
            isComplete: response.is_complete || false,
          });
        }
      });
      
      console.log('✅ Loaded chat history:', historyMessages.length, 'messages');
      setState(prev => ({ ...prev, historyMessages }));
      
    } catch (error) {
      console.error('❌ Failed to load chat history:', error);
      // Don't throw - continue without history
    }
  }, []);
  // Direct LLM processing (client-side)
  const processWithDirectLLM = useCallback(async (
    userMessage: string,
    conversationId: string
  ): Promise<void> => {
    const llmClient = initializeLLMClient();
    if (!llmClient) {
      throw new Error('LLM client not available');
    }

    // Generate prompts (you'd need to implement this based on your stage logic)
    const systemPrompt = generateSystemPrompt(stageId, currentStageData, allStageData);
    const userPrompt = generateUserPrompt(userMessage, currentStageData);

    const request: LLMRequest = {
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 1500,
      stream: true
    };

    // Use streaming response
    const streamGenerator = llmClient.generateStreamingResponse(request);
    
    let fullContent = '';
    for await (const chunk of streamGenerator) {
      if (chunk.content) {
        fullContent += chunk.content;
        setState(prev => ({ ...prev, content: fullContent }));
      }
      
      if (chunk.done) {
        // Parse final response and extract suggestions, autoFillData, etc.
        const parsedResponse = parseAgentResponse(fullContent);
        setState(prev => ({
          ...prev,
          suggestions: parsedResponse.suggestions || [],
          autoFillData: parsedResponse.autoFillData || {},
          isComplete: parsedResponse.stageComplete || false
        }));

        // Trigger callbacks
        if (parsedResponse.autoFillData && onAutoFill) {
          onAutoFill(parsedResponse.autoFillData);
        }
        if (parsedResponse.stageComplete && onStageComplete) {
          onStageComplete();
        }
        break;
      }
    }
  }, [stageId, currentStageData, allStageData, initializeLLMClient, onAutoFill, onStageComplete]);

  // Edge Function processing (server-side)
  const processWithEdgeFunction = useCallback(async (
    conversationId: string,
    userMessage: string,
    signal: AbortSignal
  ): Promise<void> => {
    // Check authentication
    if (!session?.access_token) {
      throw new Error('Authentication required for agent requests');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('Missing Supabase configuration');
    }

    const requestBody = {
      stageId,
      currentStageData,
      allStageData,
      userMessage,
      conversationId,
      memory: {},
      conversationHistory: [],
      llmProvider // Pass the provider preference
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
        if (responseText.trim()) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || 'Server error';
          } catch (parseError) {
            errorMessage = responseText;
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (textError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(`Agent function failed: ${response.status} - ${errorMessage}`);
    }

    await processStreamResponse(response, conversationId);
  }, [stageId, currentStageData, allStageData, session]);

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
        
        if (done) {
          console.log('✅ Stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue; // Skip empty lines
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove 'data: '
              if (jsonStr.trim() === '') continue; // Skip empty data
              
              const data = JSON.parse(jsonStr);
              
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
              } else if (data.type === 'ping') {
                console.log('💓 Received heartbeat');
                // Just ignore ping messages
              }
            } catch (parseError) {
              console.warn('Failed to parse stream data:', parseError, 'Line:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Stream processing error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }, [onAutoFill, onStageComplete]);

  const attemptRecovery = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting conversation recovery...');
      
      const integrity = await ChatRecoveryManager.validateConversationIntegrity(conversationId);
      if (!integrity.canRecover) {
        console.log('❌ Conversation cannot be recovered:', integrity.issues);
        return false;
      }
      
      if (integrity.issues.length > 0) {
        console.warn('⚠️ Conversation has issues but may be recoverable:', integrity.issues);
      }
      
      const recovery = await ChatRecoveryManager.recoverConversation(conversationId);
      
      if (recovery.success && recovery.content) {
        setState(prev => ({
          ...prev,
          content: recovery.content || '',
          suggestions: recovery.suggestions || [],
          autoFillData: recovery.autoFillData || {},
          isComplete: recovery.isComplete || false
        }));
        
        if (recovery.isComplete) {
          if (recovery.autoFillData && onAutoFill) {
            onAutoFill(recovery.autoFillData);
          }
          if (recovery.stageComplete && onStageComplete) {
            onStageComplete();
          }
        }
        
        console.log('✅ Recovery successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Recovery failed:', error);
      return false;
    }
  }, [onAutoFill, onStageComplete]);

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

        if (!conversationId) {
          throw new Error('Failed to create or retrieve conversation ID');
        }

        // Try recovery first if this is a retry
        if (retryCountRef.current > 0) {
          const recovered = await attemptRecovery(conversationId);
          if (recovered) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
          }
        }

        // Choose processing method
        if (useDirectLLM) {
          console.log('🔄 Using direct LLM processing');
          await processWithDirectLLM(userMessage, conversationId);
        } else {
          console.log('🔄 Using Edge Function processing');
          await processWithEdgeFunction(conversationId, userMessage, controller.signal);
        }
        
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
  }, [state.conversationId, createConversation, attemptRecovery, processWithDirectLLM, processWithEdgeFunction, useDirectLLM, user, session]);

  const retry = useCallback(() => {
    if (state.error) {
      clearError();
    }
  }, [state.error, clearError]);

  return {
    ...state,
    sendMessage,
    retry,
    clearError,
    isStreaming: state.isLoading && !!state.content,
    // Expose configuration
    llmProvider,
    useDirectLLM
  };
};

// Helper functions for direct LLM usage
function generateSystemPrompt(stageId: string, currentStageData: any, allStageData: any): string {
  // This should match your Edge Function's prompt generation logic
  return `You are an AI assistant helping users with stage ${stageId}. 
Current stage data: ${JSON.stringify(currentStageData)}
All stage data: ${JSON.stringify(allStageData)}

Please provide helpful responses and suggest next steps. Format your response as JSON with:
{
  "content": "your response text",
  "suggestions": ["suggestion1", "suggestion2"],
  "autoFillData": {},
  "stageComplete": false
}`;
}

function generateUserPrompt(userMessage: string, currentStageData: any): string {
  return `User message: ${userMessage}
Current context: ${JSON.stringify(currentStageData)}`;
}

function parseAgentResponse(content: string): {
  suggestions: string[];
  autoFillData: any;
  stageComplete: boolean;
} {
  try {
    const parsed = JSON.parse(content);
    return {
      suggestions: parsed.suggestions || [],
      autoFillData: parsed.autoFillData || {},
      stageComplete: parsed.stageComplete || false
    };
  } catch (error) {
    console.warn('Failed to parse agent response as JSON:', error);
    return {
      suggestions: [],
      autoFillData: {},
      stageComplete: false
    };
  }
}
