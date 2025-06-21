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
      const response = await callSupabaseEdgeFunction(agentContext, abortController.signal);
      
      // Clear timeout if request completes successfully
      clearTimeout(timeoutId);
      
      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        let fullContent = '';
        
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
                  
                  if (data.type === 'content') {
                    setStreamingContent(data.content);
                    fullContent = data.content;
                  } else if (data.type === 'complete') {
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
                    throw new Error(data.error || 'Server error occurred');
                  }
                } catch (e) {
                  console.warn('Failed to parse SSE data:', e);
                }
              }
            }
          }
        } finally {
          // Always release the reader
          reader.releaseLock();
        }
      }

    } catch (error) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.error('Agent error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        console.log('⏰ Request was aborted due to timeout');
        errorMessage = 'The request took longer than expected. Please try again with a shorter message or check your connection.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      } else if (error.message?.includes('Supabase environment variables')) {
        errorMessage = 'Configuration error. Please contact support.';
      }
      
      const errorMsg: AgentMessage = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: errorMessage,
        timestamp: new Date(),
      };
      setAgentMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAgentThinking(false);
      setStreamingContent('');
      
      // Ensure timeout is always cleared
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const callSupabaseEdgeFunction = async (context: any, signal?: AbortSignal) => {
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
      body: JSON.stringify(context),
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