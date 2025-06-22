/**
 * Canvas.tsx
 * 
 * Main canvas component that integrates the AI Agent with the spatial canvas and user input.
 * Handles agent responses, auto-fill data, stage progression, and memory management.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Brain, Loader2, Wand2, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { CanvasHeader } from './CanvasHeader';
import { SpatialCanvas } from '../canvas/SpatialCanvas';
import { useAgent } from '../agent/AgentContextProvider';
import { ChatStorageManager } from '../../lib/auth/chat/chatStorage';
import { ChatRecoveryManager } from '../../lib/auth/chat/chatRecovery';
import { Stage } from '../../types';

interface CanvasProps {
  currentStage?: Stage;
  stageData: any;
  onSendMessage: (message: string) => void;
  onUpdateStageData?: (stageId: string, data: any) => void;
  onCompleteStage?: (stageId: string) => void;
  onGoToStage?: (stageId: string) => void;
  getNextStage?: () => Stage | null;
}

interface AgentMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  autoFillData?: any;
  stageComplete?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  currentStage, 
  stageData,
  onSendMessage,
  onUpdateStageData,
  onCompleteStage,
  onGoToStage,
  getNextStage
}) => {
  const [message, setMessage] = useState('');
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [pendingAutoFill, setPendingAutoFill] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [lastTokenIndex, setLastTokenIndex] = useState(-1);
  const [isRecovering, setIsRecovering] = useState(false);
  
  const { updateAgentMemory, getStageRecommendations } = useAgent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendToAgent(message.trim());
      setMessage('');
    }
  };

  const sendToAgent = async (userMessage: string) => {
    if (isAgentThinking) return;

    // Check if we need to recover from a previous conversation
    await checkAndRecoverPreviousConversation();

    // Add user message
    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setAgentMessages(prev => [...prev, userMsg]);
    setIsAgentThinking(true);
    setStreamingContent('');

    let conversationId = currentConversationId;
    
    try {
      // Create new conversation if we don't have one
      if (!conversationId) {
        const conversation = await ChatStorageManager.createConversation(
          currentStage?.id || 'ideation-discovery',
          {
            userMessage,
            stageData: stageData[currentStage?.id || 'ideation-discovery'] || {},
            allStageData: stageData
          }
        );
        conversationId = conversation.id;
        setCurrentConversationId(conversationId);
        setLastTokenIndex(-1);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Continue without persistence for this session
    }

    // Enhanced retry logic with exponential backoff
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount <= MAX_RETRIES) {
      // Create AbortController for timeout handling
      const abortController = new AbortController();
      let timeoutId: NodeJS.Timeout;
      
      // Set a generous timeout (5 minutes) for AI response
      const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
      
      try {
        // Get stage recommendations for cross-stage intelligence
        const recommendations = getStageRecommendations(currentStage?.id || 'ideation-discovery');
        
        // Prepare context for AI agent
        const agentContext = {
          stageId: currentStage?.id || 'ideation-discovery',
          currentStageData: stageData[currentStage?.id || 'ideation-discovery'] || {},
          allStageData: stageData,
          conversationHistory: agentMessages,
          userMessage: userMessage,
          memory: {},
          recommendations
        };

        // Set up timeout
        timeoutId = setTimeout(() => {
          console.log('⏰ Request timeout reached, aborting...');
          abortController.abort();
        }, TIMEOUT_DURATION);

        // Call the Supabase Edge Function
        const response = await callSupabaseEdgeFunction(agentContext, abortController.signal, conversationId);
        
        // Clear timeout if request completes successfully
        clearTimeout(timeoutId);
        
        // Handle streaming response
        if (response.body) {
          const reader = response.body.getReader();
          let fullContent = '';
          let tokenIndex = lastTokenIndex + 1;
          const tokensToSave: Array<{index: number; content: string; type: 'content' | 'suggestion' | 'autofill' | 'complete'}> = [];
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    // Handle ping messages to keep connection alive
                    if (data.type === 'ping') {
                      console.log('💓 Received heartbeat ping');
                      continue;
                    }
                    
                    if (data.type === 'content') {
                      setStreamingContent(data.content);
                      fullContent = data.content; // Use the full content from the server
                      console.log('📝 Token received:', {
                        tokenIndex,
                        contentLength: data.content.length,
                        fullContentLength: fullContent.length
                      });
                      
                      // Save token incrementally
                      tokensToSave.push({
                        index: tokenIndex++,
                        content: data.content,
                        type: 'content'
                      });
                      console.log('📦 Token added to batch:', {
                        batchSize: tokensToSave.length,
                        tokenIndex: tokenIndex - 1
                      });
                      
                      // Save tokens every 10 tokens
                      if (tokensToSave.length >= 10) {
                        console.log('💾 Saving token batch:', {
                          conversationId,
                          batchSize: tokensToSave.length,
                          lastTokenIndex: tokenIndex - 1
                        });
                        await saveTokensBatch(conversationId, tokensToSave);
                        console.log('✅ Token batch saved successfully');
                        setLastTokenIndex(tokenIndex - 1);
                      }
                      
                    } else if (data.type === 'complete') {
                      console.log('🏁 Completion received:', {
                        fullContentLength: fullContent.length,
                        remainingTokens: tokensToSave.length,
                        conversationId
                      });
                      
                      // Save any remaining tokens
                      if (tokensToSave.length > 0) {
                        console.log('💾 Saving final token batch:', {
                          conversationId,
                          finalBatchSize: tokensToSave.length
                        });
                        await saveTokensBatch(conversationId, tokensToSave);
                        console.log('✅ Final token batch saved successfully');
                      }
                      
                      // Save completion data
                      if (conversationId) {
                        try {
                          console.log('💾 Saving complete response:', {
                            conversationId,
                            fullContentLength: fullContent.length,
                            suggestionsCount: data.suggestions?.length || 0,
                            hasAutoFillData: !!(data.autoFillData && Object.keys(data.autoFillData).length > 0),
                            stageComplete: data.stageComplete
                          });
                          
                          await ChatStorageManager.saveCompleteResponse(conversationId, {
                            full_content: fullContent,
                            suggestions: data.suggestions || [],
                            auto_fill_data: data.autoFillData || {},
                            stage_complete: data.stageComplete || false,
                            context: data.context || {}
                          });
                          console.log('✅ Complete response saved successfully');
                          
                          await ChatStorageManager.updateConversationStatus(conversationId, 'completed');
                          console.log('✅ Conversation status updated to completed');
                        } catch (error) {
                          console.error('❌ Failed to save complete response:', {
                            error: error.message,
                            conversationId,
                            fullContentLength: fullContent.length
                          });
                        }
                      }
                      
                      // Create final agent message
                      const agentMsg: AgentMessage = {
                        id: (Date.now() + 1).toString(),
                        type: 'agent',
                        content: fullContent,
                        timestamp: new Date(),
                        suggestions: data.suggestions || [],
                        autoFillData: data.autoFillData || {},
                        stageComplete: data.stageComplete || false,
                      };

                      setAgentMessages(prev => [...prev, agentMsg]);
                      
                      // Handle auto-fill data
                      if (data.autoFillData && Object.keys(data.autoFillData).length > 0) {
                        handleAutoFillData(data.autoFillData);
                      }
                      
                      // Handle stage completion
                      if (data.stageComplete && onCompleteStage && onGoToStage && getNextStage) {
                        handleStageCompletion();
                      }
                      
                      // Update agent memory
                      updateAgentMemory(currentStage?.id || 'ideation-discovery', {
                        lastInteraction: userMessage,
                        response: fullContent,
                        autoFillApplied: data.autoFillData,
                        timestamp: new Date().toISOString()
                      });
                    } else if (data.type === 'error') {
                      console.error('❌ Server error:', data.error);
                      
                      // Mark conversation as failed
                      if (conversationId) {
                        try {
                          await ChatStorageManager.updateConversationStatus(conversationId, 'failed');
                        } catch (error) {
                          console.error('Failed to update conversation status:', error);
                        }
                      }
                      
                      throw new Error(data.error || 'Server error occurred');
                    }
                  } catch (e) {
                    console.error('❌ Failed to parse SSE data:', {
                      error: e.message,
                      line: line.substring(0, 100),
                      conversationId
                    });
                  }
                }
              }
            }
            
            // Save any remaining tokens
            if (tokensToSave.length > 0 && conversationId) {
              console.log('💾 Saving remaining tokens after stream end:', {
                conversationId,
                remainingTokens: tokensToSave.length
              });
              await saveTokensBatch(conversationId, tokensToSave);
              console.log('✅ Remaining tokens saved successfully');
              setLastTokenIndex(tokenIndex - 1);
            }
            
          } finally {
            // Always release the reader
            reader.releaseLock();
          }
        }

        // Success - break out of retry loop
        break;

      } catch (error) {
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        lastError = error as Error;
        retryCount++;
        
        console.error(`❌ Agent streaming error (attempt ${retryCount}/${MAX_RETRIES + 1}):`, {
          error: lastError.message,
          conversationId,
          errorType: lastError.name,
          retryCount
        });
        
        // Check if this is a retryable error
        const isRetryable = (
          lastError.name === 'TypeError' || // Network errors
          lastError.name === 'AbortError' || // Timeout errors
          lastError.message?.includes('Failed to fetch') ||
          lastError.message?.includes('network') ||
          lastError.message?.includes('timeout')
        );
        
        // If not retryable or max retries reached, break
        if (!isRetryable || retryCount > MAX_RETRIES) {
          console.error('❌ Max retries reached or non-retryable error, giving up');
          break;
        }
        
        // Exponential backoff before retry
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Max 10 seconds
        console.log(`⏳ Retrying in ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        // Try to recover conversation state before retry
        if (conversationId) {
          try {
            console.log('🔄 Attempting conversation recovery before retry...');
            const recoveryResult = await ChatRecoveryManager.recoverConversation(conversationId, lastTokenIndex);
            if (recoveryResult.success && recoveryResult.content) {
              console.log('✅ Recovered partial content, updating UI');
              setStreamingContent(recoveryResult.content);
            }
          } catch (recoveryError) {
            console.error('❌ Recovery attempt failed:', recoveryError);
          }
        }
      }
    }
    
    // Handle final error state if all retries failed
    if (retryCount > MAX_RETRIES && lastError) {
      // Mark conversation as failed on error
      if (conversationId) {
        try {
          await ChatStorageManager.updateConversationStatus(conversationId, 'failed');
        } catch (error) {
          console.error('Failed to update conversation status:', error);
        }
      }
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      // Handle specific error types
      if (lastError.name === 'AbortError') {
        console.log('⏰ Request was aborted due to timeout');
        errorMessage = 'The request took longer than expected. Please try again with a shorter message or check your connection.';
      } else if (lastError.message?.includes('Failed to fetch')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      } else if (lastError.message?.includes('Supabase environment variables')) {
        errorMessage = 'Configuration error. Please contact support.';
      }
      
      const errorMsg: AgentMessage = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: errorMessage,
        timestamp: new Date(),
      };
      setAgentMessages(prev => [...prev, errorMsg]);
    }
    
    // Always clean up
    setIsAgentThinking(false);
    setStreamingContent('');
  };

  // Helper function to save tokens in batches
  const saveTokensBatch = async (conversationId: string | null, tokens: Array<{index: number; content: string; type: 'content' | 'suggestion' | 'autofill' | 'complete'}>) => {
    if (!conversationId || tokens.length === 0) return;
    
    try {
      console.log('🔄 ChatStorageManager.saveResponseTokens called:', {
        conversationId,
        tokenCount: tokens.length,
        firstTokenIndex: tokens[0]?.index,
        lastTokenIndex: tokens[tokens.length - 1]?.index
      });
      await ChatStorageManager.saveResponseTokens(conversationId, tokens);
      console.log('✅ ChatStorageManager.saveResponseTokens completed successfully');
      tokens.length = 0; // Clear the array
    } catch (error) {
      console.error('❌ Failed to save token batch:', {
        error: error.message,
        conversationId,
        tokenCount: tokens.length,
        errorDetails: error
      });
    }
  };

  // Check for and recover from previous conversation
  const checkAndRecoverPreviousConversation = async () => {
    if (isRecovering || currentConversationId) return;
    
    setIsRecovering(true);
    console.log('🔄 Starting conversation recovery check...');
    
    try {
      // Check localStorage for conversation ID
      const savedConversationId = localStorage.getItem('current-conversation-id');
      if (!savedConversationId) {
        console.log('ℹ️ No saved conversation ID found in localStorage');
        setIsRecovering(false);
        return;
      }
      console.log('🔍 Found saved conversation ID:', savedConversationId);
      
      // Check if conversation exists and is active
      console.log('🔍 Attempting to retrieve conversation from database...');
      const conversation = await ChatStorageManager.getConversation(savedConversationId);
      console.log('📋 Conversation retrieval result:', {
        found: !!conversation,
        status: conversation?.status,
        conversationId: savedConversationId
      });
      
      if (!conversation || conversation.status !== 'active') {
        console.log('⚠️ Conversation not found or not active, cleaning up localStorage');
        localStorage.removeItem('current-conversation-id');
        setIsRecovering(false);
        return;
      }
      
      // Check if there's a complete response
      console.log('🔍 Attempting to retrieve complete response...');
      const completeResponse = await ChatStorageManager.getCompleteResponse(savedConversationId);
      console.log('📋 Complete response retrieval result:', {
        found: !!completeResponse,
        isComplete: completeResponse?.is_complete,
        hasContent: !!(completeResponse?.full_content),
        contentLength: completeResponse?.full_content?.length || 0
      });
      
      if (completeResponse && completeResponse.is_complete) {
        console.log('✅ Found complete response, displaying to user');
        // Display the complete response
        const agentMsg: AgentMessage = {
          id: Date.now().toString(),
          type: 'agent',
          content: completeResponse.full_content,
          timestamp: new Date(),
          suggestions: completeResponse.suggestions || [],
          autoFillData: completeResponse.auto_fill_data || {},
          stageComplete: completeResponse.stage_complete || false,
        };
        
        setAgentMessages(prev => [...prev, agentMsg]);
        
        // Handle auto-fill data if present
        if (completeResponse.auto_fill_data && Object.keys(completeResponse.auto_fill_data).length > 0) {
          handleAutoFillData(completeResponse.auto_fill_data);
        }
        
        // Clean up
        localStorage.removeItem('current-conversation-id');
        setCurrentConversationId(null);
      } else {
        console.log('🔄 No complete response found, attempting to recover from tokens...');
        // Recover partial content from tokens
        const reconstructedContent = await ChatStorageManager.reconstructContentFromTokens(savedConversationId);
        console.log('📋 Token reconstruction result:', {
          hasContent: !!reconstructedContent,
          contentLength: reconstructedContent?.length || 0
        });
        
        if (reconstructedContent) {
          console.log('✅ Recovered partial content from tokens');
          setStreamingContent(reconstructedContent);
          
          // Show recovery message
          const recoveryMsg: AgentMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: '🔄 Recovered partial response from previous session. The AI is continuing to process your request...',
            timestamp: new Date(),
          };
          setAgentMessages(prev => [...prev, recoveryMsg]);
        }
        
        // Set up for continuation
        setCurrentConversationId(savedConversationId);
        const lastIndex = await ChatStorageManager.getLastTokenIndex(savedConversationId);
        console.log('📋 Last token index retrieved:', lastIndex);
        setLastTokenIndex(lastIndex);
      }
    } catch (error) {
      console.error('❌ Failed to recover conversation:', {
        error: error.message,
        errorDetails: error
      });
      localStorage.removeItem('current-conversation-id');
    }
    
    console.log('✅ Conversation recovery check completed');
    setIsRecovering(false);
  };

  // Save conversation ID to localStorage when it changes
  React.useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('current-conversation-id', currentConversationId);
    } else {
      localStorage.removeItem('current-conversation-id');
    }
  }, [currentConversationId]);

  // Clean up conversation on successful completion
  const cleanupConversation = () => {
    setCurrentConversationId(null);
    setLastTokenIndex(-1);
    localStorage.removeItem('current-conversation-id');
  };

  const callSupabaseEdgeFunction = async (context: any, signal?: AbortSignal, conversationId?: string | null) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/agent-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        ...context,
        conversationId,
        lastTokenIndex
      }),
      signal, // Pass the abort signal to fetch
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Edge Function error: ${response.status} - ${errorData}`);
    }

    return response;
  };

  const handleAutoFillData = (autoFillData: any) => {
    if (!onUpdateStageData || !currentStage) return;
    
    setPendingAutoFill(autoFillData);
    setShowConfirmation(true);
  };

  const confirmAutoFill = () => {
    if (pendingAutoFill && onUpdateStageData && currentStage) {
      // Apply auto-fill data to current stage
      onUpdateStageData(currentStage.id, pendingAutoFill);
      
      // Show success message
      onSendMessage(`AI Agent auto-filled: ${Object.keys(pendingAutoFill).join(', ')}`);
      
      // Add system message
      const systemMsg: AgentMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `✅ Applied auto-fill suggestions: ${Object.keys(pendingAutoFill).join(', ')}`,
        timestamp: new Date(),
      };
      setAgentMessages(prev => [...prev, systemMsg]);
    }
    
    setPendingAutoFill(null);
    setShowConfirmation(false);
  };

  const rejectAutoFill = () => {
    setPendingAutoFill(null);
    setShowConfirmation(false);
  };

  const handleStageCompletion = () => {
    if (!onCompleteStage || !onGoToStage || !getNextStage || !currentStage) return;
    
    // Complete current stage
    onCompleteStage(currentStage.id);
    
    // Clean up conversation
    cleanupConversation();
    
    // Move to next stage
    const nextStage = getNextStage();
    if (nextStage && !nextStage.comingSoon) {
      setTimeout(() => {
        onGoToStage(nextStage.id);
        
        // Add transition message
        const transitionMsg: AgentMessage = {
          id: Date.now().toString(),
          type: 'system',
          content: `🎉 Stage completed! Moving to: ${nextStage.title}`,
          timestamp: new Date(),
        };
        setAgentMessages(prev => [...prev, transitionMsg]);
      }, 1000);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  const renderCanvasContent = () => {
    if (!currentStage) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 min-h-96"
        >
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Canvas</h3>
            <p className="text-gray-600">
              This is where the AI agent will dynamically place design elements, wireframes, and documentation as you work through each stage.
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 min-h-96"
      >
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{currentStage.completed ? '✅' : '⏳'}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {currentStage.completed ? 'Stage Completed' : 'Working on it...'}
          </h3>
          <p className="text-gray-600">
            {currentStage.completed 
              ? 'Great! Your content has been generated. Check the sidebar for options or move to the next stage.'
              : 'Complete the stage configuration in the sidebar to generate AI content here.'
            }
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <CanvasHeader currentStage={currentStage} />
      
      {/* Main Canvas Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Spatial Canvas - Always Available */}
          <div className="mb-6">
            <SpatialCanvas
              currentStage={currentStage}
              stageData={stageData}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Auto-Fill */}
      {showConfirmation && pendingAutoFill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wand2 className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">AI Suggestions Ready</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              The AI agent wants to auto-fill these fields:
            </p>
            
            <div className="bg-purple-50 rounded-lg p-3 mb-4">
              {Object.entries(pendingAutoFill).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-purple-800">{key}:</span>
                  <span className="text-purple-600 ml-2">{String(value).slice(0, 50)}...</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmAutoFill}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply Suggestions
              </button>
              <button
                onClick={rejectAutoFill}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200" style={{ height: '300px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="h-full flex">
            {/* Left Half - AI Agent Responses */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              {/* Agent Header */}
              <div className="p-3 bg-purple-50 border-b border-purple-200 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">AI Agent</span>
                {isAgentThinking && <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />}
                <div className="ml-auto">
                  <span className="text-xs text-purple-600">
                    {currentStage?.title || 'Ready to help'}
                  </span>
                </div>
              </div>

              {/* Agent Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {agentMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Hi! I'm your AI UX agent.</p>
                    <p className="text-xs mt-1">Tell me about your app idea to get started!</p>
                    {isRecovering && (
                      <p className="text-xs mt-2 text-blue-600">🔄 Checking for previous conversations...</p>
                    )}
                  </div>
                )}
                
                {agentMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      msg.type === 'user' ? 'bg-blue-100 text-blue-600' :
                      msg.type === 'agent' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {msg.type === 'user' ? '👤' : msg.type === 'agent' ? '🤖' : '⚠️'}
                    </div>
                    <div className={`flex-1 max-w-[85%] p-3 rounded-lg text-sm ${
                      msg.type === 'user' ? 'bg-blue-100 text-blue-800' :
                      msg.type === 'agent' ? 'bg-purple-50 text-purple-800' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      
                      {/* Stage completion indicator */}
                      {msg.stageComplete && (
                        <div className="mt-2 flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-xs">Stage ready for completion</span>
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs opacity-75">Quick actions:</div>
                          {msg.suggestions.slice(0, 3).map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => applySuggestion(suggestion)}
                              className="block text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Streaming content */}
                {isAgentThinking && streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                      🤖
                    </div>
                    <div className="flex-1 max-w-[85%] p-3 rounded-lg text-sm bg-purple-50 text-purple-800">
                      <div className="whitespace-pre-wrap">{streamingContent}</div>
                      <div className="mt-1 flex items-center gap-1 text-purple-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Half - User Input */}
            <div className="w-1/2 flex flex-col">
              {/* Input Header */}
              <div className="p-3 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Your Input</span>
                <div className="ml-auto">
                  <span className="text-xs text-blue-600">
                    {currentStage?.comingSoon ? 'Coming Soon' : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex-1 p-3">
                <form onSubmit={handleSubmit} className="h-full flex flex-col">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      currentStage?.comingSoon 
                        ? "This stage is coming soon..." 
                        : "Describe your app idea, ask questions, or tell me what you want to work on...\n\nTry: 'I want to build an app about task management'"
                    }
                    disabled={currentStage?.comingSoon || isAgentThinking}
                    className={`
                      flex-1 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${currentStage?.comingSoon || isAgentThinking ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
                    `}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {currentStage?.comingSoon ? 'Stage not available yet' : 'Cmd/Ctrl + Enter to send'}
                    </div>
                    <button
                      type="submit"
                      disabled={!message.trim() || currentStage?.comingSoon || isAgentThinking}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                        ${message.trim() && !currentStage?.comingSoon && !isAgentThinking
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {isAgentThinking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send to AI
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};