/** 
 * The useAgentChat hook should focus only on:

      Managing chat state
      Calling Edge Functions
      Handling streaming responses
      Managing conversation lifecycle
*/

import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { ChatStorageManager } from '../lib/auth/chat/chatStorage';
import { createLLMClient, LLMRequest } from '../lib/llm/llmClient';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  suggestions?: string[];
  autoFillData?: any;
  isComplete?: boolean;
}

interface AgentChatState {
  isLoading: boolean;
  error: string | null;
  content: string;
  suggestions: string[];
  autoFillData: any;
  isComplete: boolean;
  conversationId: string | null;
  historyMessages: ChatMessage[];
  goToStageId: string | null;
}

interface UseAgentChatOptions {
  stageId: string;
  currentStageData: any;
  allStageData: any;
  projectId: string | null;
  onAutoFill?: (data: any) => void;
  onStageComplete?: () => void;
  onGoToStage?: (stageId: string) => void;
  llmProvider?: 'openai' | 'anthropic';
  useDirectLLM?: boolean; // Maybe rename this to 'useStreamingResponse' or similar
  memory?: any;
  recommendations?: any[];
}

export const useAgentChat = ({
  stageId,
  currentStageData,
  allStageData,
  projectId,
  onAutoFill,
  onStageComplete,
  onGoToStage,
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
    goToStageId: null
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

  // Reset chat state when projectId or stageId changes
  React.useEffect(() => {
    const loadExistingConversation = async () => {
      try {
        // Only proceed if we have all required data
        if (!projectId || !stageId || !user || !session?.access_token) {
          console.log('⚠️ Missing required data to load conversation:', { 
            hasProjectId: !!projectId, 
            hasStageId: !!stageId, 
            hasUser: !!user 
          });
          
          // Reset only conversation-specific state, not the entire state
          setState(prev => ({
            ...prev,
            conversationId: null,
            historyMessages: [],
            content: '',
            suggestions: [],
            autoFillData: {},
            isComplete: false,
            goToStageId: null
          }));
          return;
        }
        
        console.log('🔍 Looking for existing conversation for project:', projectId, 'and stage:', stageId);
        
        // Set loading state while we check for existing conversations
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase configuration');
        }

        // Query for existing conversation for this project and stage
        const response = await fetch(
          `${supabaseUrl}/rest/v1/chat_conversations?project_id=eq.${projectId}&stage_id=eq.${stageId}&user_id=eq.${user.id}&order=created_at.desc&limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': supabaseAnonKey,
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to query conversations: ${response.status}`);
        }

        const conversations = await response.json();
        console.log(`🔍 Found ${conversations.length} existing conversations`);
        
        if (conversations.length > 0) {
          const existingConversation = conversations[0];
          console.log('✅ Found existing conversation:', existingConversation.id);
          
          // Set the conversation ID in state
          setState(prev => ({ 
            ...prev, 
            conversationId: existingConversation.id,
            isLoading: false
          }));
          
          // Load chat history for this conversation
          await loadChatHistory(existingConversation.id);
          
          console.log('✅ Chat history loaded successfully');
        } else {
          console.log('ℹ️ No existing conversation found, will create new one on first message');
          setState(prev => ({ 
            ...prev, 
            conversationId: null,
            historyMessages: [],
            isLoading: false 
          }));
        }
      } catch (error) {
        console.error('❌ Error loading existing conversation:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to load conversation',
          isLoading: false 
        }));
      }
    };

    // Execute the async function
    if (user) {
      loadExistingConversation();
    } else {
      // Reset state if no user is logged in
      setState({
        isLoading: false,
        error: null,
        content: '',
        suggestions: [],
        autoFillData: {},
        isComplete: false,
        conversationId: null,
        historyMessages: [],
        goToStageId: null
      });
    }
  }, [projectId, stageId, user, session?.access_token]);

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
    
      
      const requestBody = {
        stage_id: stageId,
        project_id: projectId,
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
  }, [stageId, projectId, currentStageData, allStageData, user, session, llmProvider, useDirectLLM]);

  // Load chat history from database
  const loadChatHistory = useCallback(async (conversationId: string) => {
    try {
      console.log('📚 Loading chat history for conversation:', conversationId);
      if (!session?.access_token) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/chat_responses?conversation_id=eq.${conversationId}&order=created_at.asc`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
          }
        }
      );

      if (response.ok) {
        const responses = await response.json();
        console.log(`📚 Found ${responses.length} messages in history`);
        const historyMessages: ChatMessage[] = [];
        
        responses.forEach((resp: any) => {
          // Add user message
          if (resp.user_prompt) {
            historyMessages.push({
              id: `user-${resp.id}`,
              content: resp.user_prompt,
              timestamp: new Date(resp.created_at),
              type: 'user',
            });
          }
          
          // Add AI response
          if (resp.full_content && resp.is_complete) {
            historyMessages.push({
              id: `assistant-${resp.id}`,
              content: resp.full_content,
              timestamp: new Date(resp.created_at),
              type: 'assistant',
              suggestions: resp.suggestions || [],
              autoFillData: resp.auto_fill_data || {},
              isComplete: resp.is_complete,
            });
          }
        });
        
        console.log(`📚 Processed ${historyMessages.length} messages for history`);
        setState(prev => ({ ...prev, historyMessages }));
      } else {
        console.error('❌ Failed to load chat history:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Failed to load chat history:', error);
    }
  }, [session]);
  

  // REPLACE the entire processWithEdgeFunction with this:
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
    memory, // Pass memory to Edge Function
    conversationHistory: state.historyMessages, // Pass conversation history
    recommendations, // Pass recommendations to Edge Function
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

  // Process the streaming response
  await processStreamResponse(response, conversationId);
}, [stageId, currentStageData, allStageData, session, memory, recommendations, state.historyMessages, llmProvider]);


  const processStreamResponse = useCallback(async (
    response: Response,
    conversationId: string
  ): Promise<void> => {
    if (!response.body) {
      throw new Error('No response body received for: ' + response.url);
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
                  isComplete: true,
                  goToStageId: data.goToStageId
                }));  

                // Trigger callbacks
                if (data.autoFillData && Object.keys(data.autoFillData).length > 0 && onAutoFill) {
                  // Process multi-stage autoFillData
                  const processAutoFillData = (autoFillData: any) => {
                    // Check if it's multi-stage format (has stage IDs as keys)
                    const hasStageKeys = Object.keys(autoFillData).some(key => 
                      ['ideation-discovery', 'feature-planning', 'structure-flow', 
                       'interface-interaction', 'architecture-design', 'user-auth-flow',
                       'ux-review-check', 'auto-prompt-engine', 'export-handoff'].includes(key)
                    );
                    
                    if (hasStageKeys) {
                      // Process each stage's data
                      Object.entries(autoFillData).forEach(([stageId, stageData]) => {
                        if (stageId === stageId && Object.keys(stageData as object).length > 0) {
                          // Current stage data
                          onAutoFill(stageData);
                        } else if (stageId !== stageId && Object.keys(stageData as object).length > 0) {
                          // Other stage data - would need a callback for this
                          console.log(`Data for other stage (${stageId}) received:`, stageData);
                          // If we had a callback for other stages: onOtherStageData(stageId, stageData);
                        }
                      });
                    } else {
                      // Legacy format - just pass the whole object
                      onAutoFill(autoFillData);
                    }
                  };
                  
                  processAutoFillData(data.autoFillData);
                }
                
                if (data.stageComplete && onStageComplete) {
                  onStageComplete();
                }
                
                // Handle stage navigation if requested
                if (data.goToStageId && onGoToStage) {
                  console.log(`🔄 Navigating to stage: ${data.goToStageId}`);
                  onGoToStage(data.goToStageId);
                }
                
                // Handle stage navigation if requested
                if (data.goToStageId && onGoToStage) {
                  onGoToStage(data.goToStageId);
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
      
      // Get the last complete response from chat_responses table
      const lastResponse = await ChatStorageManager.getLastCompleteResponse(conversationId);
      
      if (lastResponse && lastResponse.full_content) {
        setState(prev => ({
          ...prev,
          content: lastResponse.full_content || '',
          suggestions: lastResponse.suggestions || [],
          autoFillData: lastResponse.auto_fill_data || {},
          isComplete: lastResponse.is_complete || false
        }));
        
        if (lastResponse.is_complete) {
          if (lastResponse.auto_fill_data && onAutoFill) {
            onAutoFill(lastResponse.auto_fill_data);
          }
          if (lastResponse.stage_complete && onStageComplete) {
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

    // If there's a completed response, add it to history before starting a new one
    if (state.isComplete && state.content) {
      const aiMsg: ChatMessage = {
        id: `assistant-${Date.now() - 100}`,
        content: state.content,
        timestamp: new Date(),
        type: 'assistant',
        suggestions: state.suggestions,
        autoFillData: state.autoFillData,
        isComplete: state.isComplete,
      };
      
      setState(prev => ({
        ...prev,
        historyMessages: [...prev.historyMessages, aiMsg]
      }));
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Add user message to history immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      content: userMessage.trim(),
      timestamp: new Date(),
      type: 'user',
    };
    
    // Update history messages first
    setState(prev => ({
      ...prev,
      historyMessages: [...prev.historyMessages, userMsg]
    }));
    
    // Then reset response state (React will batch these updates)
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      content: '',
      suggestions: [],
      autoFillData: {},
      isComplete: false,
      goToStageId: null
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

        // Always use Edge Function processing (since prompts are handled there)
        console.log('🔄 Using Edge Function processing');
        await processWithEdgeFunction(conversationId, userMessage, controller.signal);
        
        // Success - just mark as not loading
        setState(prev => ({
          ...prev,
          isLoading: false
        }));
        
        // Log debug info separately instead of storing in state
        console.log('🎉 Request completed successfully:', {
          conversationId,
          timestamp: new Date().toISOString()
        });
        
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
  }, [state.conversationId, createConversation, processWithEdgeFunction, user, session]);

  const retry = useCallback(() => {
    if (state.error) {
      clearError();
    }
  }, [state.error, clearError]);

  return {
    ...state,
    // Add debug info
    debug: {
      hasConversationId: !!state.conversationId,
      historyMessageCount: state.historyMessages.length,
      isAuthenticated: !!user,
      projectId,
      stageId
    },
    sendMessage,
    retry,
    clearError,
    isStreaming: state.isLoading && !!state.content,
    // Expose configuration
    llmProvider,
    useDirectLLM,
    goToStageId: state.goToStageId
  };
};

