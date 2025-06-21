/**
 * AgentMemoryStream.tsx
 * 
 * Core AI Agent component that handles:
 * - Real-time streaming responses from the AI agent
 * - Memory management per stage
 * - Interactive conversation flow
 * - Auto-filling form fields based on AI responses
 * - Stage completion detection and progression
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Loader2, 
  CheckCircle, 
  Edit3, 
  Save, 
  RefreshCw,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Wand2,
  Eye,
  EyeOff
} from 'lucide-react';

interface AgentMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  autoFillData?: { [key: string]: any };
  stageComplete?: boolean;
}

interface AgentMemory {
  stageId: string;
  messages: AgentMessage[];
  context: { [key: string]: any };
  suggestions: string[];
  autoFillData: { [key: string]: any };
  lastUpdated: Date;
}

interface AgentMemoryStreamProps {
  currentStageId: string;
  stageData: { [key: string]: any };
  onUpdateStageData: (stageId: string, data: any) => void;
  onStageComplete: (stageId: string) => void;
  onNextStage: () => void;
}

export const AgentMemoryStream: React.FC<AgentMemoryStreamProps> = ({
  currentStageId,
  stageData,
  onUpdateStageData,
  onStageComplete,
  onNextStage,
}) => {
  const [memory, setMemory] = useState<{ [stageId: string]: AgentMemory }>({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize memory for current stage
  useEffect(() => {
    if (!memory[currentStageId]) {
      setMemory(prev => ({
        ...prev,
        [currentStageId]: {
          stageId: currentStageId,
          messages: [],
          context: stageData[currentStageId] || {},
          suggestions: [],
          autoFillData: {},
          lastUpdated: new Date(),
        }
      }));
    }
  }, [currentStageId, stageData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [memory, streamingContent]);

  const getCurrentMemory = () => memory[currentStageId] || {
    stageId: currentStageId,
    messages: [],
    context: {},
    suggestions: [],
    autoFillData: {},
    lastUpdated: new Date(),
  };

  const updateMemory = (updates: Partial<AgentMemory>) => {
    setMemory(prev => ({
      ...prev,
      [currentStageId]: {
        ...getCurrentMemory(),
        ...updates,
        lastUpdated: new Date(),
      }
    }));
  };

  const sendToAgent = async (userMessage: string) => {
    if (!userMessage.trim() || isStreaming) return;

    const currentMemory = getCurrentMemory();
    
    // Add user message to memory
    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    updateMemory({
      messages: [...currentMemory.messages, userMsg],
    });

    setCurrentMessage('');
    setIsStreaming(true);
    setStreamingContent('');

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Prepare context for AI agent
      const agentContext = {
        stageId: currentStageId,
        currentStageData: stageData[currentStageId] || {},
        allStageData: stageData,
        conversationHistory: currentMemory.messages,
        userMessage: userMessage,
        memory: currentMemory.context,
      };

      // Call the edge function
      const response = await fetch('/api/agent-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentContext),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let fullContent = '';
      let agentResponse: any = {};

      // Stream the response
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
                fullContent += data.content;
                setStreamingContent(fullContent);
              } else if (data.type === 'complete') {
                agentResponse = data;
              }
            } catch (e) {
              // Ignore malformed JSON chunks
            }
          }
        }
      }

      // Create agent message
      const agentMsg: AgentMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: fullContent,
        timestamp: new Date(),
        suggestions: agentResponse.suggestions || [],
        autoFillData: agentResponse.autoFillData || {},
        stageComplete: agentResponse.stageComplete || false,
      };

      // Update memory with agent response
      updateMemory({
        messages: [...currentMemory.messages, userMsg, agentMsg],
        context: { ...currentMemory.context, ...agentResponse.context },
        suggestions: agentResponse.suggestions || [],
        autoFillData: agentResponse.autoFillData || {},
      });

      // Auto-fill stage data if provided
      if (agentResponse.autoFillData && Object.keys(agentResponse.autoFillData).length > 0) {
        onUpdateStageData(currentStageId, agentResponse.autoFillData);
      }

      // Handle stage completion
      if (agentResponse.stageComplete) {
        setTimeout(() => {
          onStageComplete(currentStageId);
          
          // Auto-advance to next stage after a delay
          setTimeout(() => {
            onNextStage();
          }, 2000);
        }, 1000);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }

      console.error('Agent error:', error);
      
      // Add error message
      const errorMsg: AgentMessage = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      updateMemory({
        messages: [...currentMemory.messages, userMsg, errorMsg],
      });
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendToAgent(currentMessage);
  };

  const applySuggestion = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const applyAutoFill = () => {
    const currentMemory = getCurrentMemory();
    if (Object.keys(currentMemory.autoFillData).length > 0) {
      onUpdateStageData(currentStageId, currentMemory.autoFillData);
    }
  };

  const currentMemory = getCurrentMemory();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          <Brain className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-purple-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-800">AI Agent</span>
          {isStreaming && <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />}
        </div>
        <div className="flex items-center gap-1">
          {Object.keys(currentMemory.autoFillData).length > 0 && (
            <button
              onClick={applyAutoFill}
              className="p-1 text-purple-600 hover:bg-purple-100 rounded"
              title="Apply auto-fill suggestions"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence>
          {currentMemory.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                message.type === 'user' ? 'bg-blue-100 text-blue-600' :
                message.type === 'agent' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {message.type === 'user' ? '👤' : message.type === 'agent' ? '🤖' : '⚠️'}
              </div>
              <div className={`flex-1 max-w-[80%] p-2 rounded-lg text-sm ${
                message.type === 'user' ? 'bg-blue-100 text-blue-800' :
                message.type === 'agent' ? 'bg-purple-50 text-purple-800' :
                'bg-gray-50 text-gray-700'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Stage completion indicator */}
                {message.stageComplete && (
                  <div className="mt-2 flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs">Stage completed!</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming content */}
        {isStreaming && streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
              🤖
            </div>
            <div className="flex-1 max-w-[80%] p-2 rounded-lg text-sm bg-purple-50 text-purple-800">
              <div className="whitespace-pre-wrap">{streamingContent}</div>
              <div className="mt-1 flex items-center gap-1 text-purple-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {currentMemory.suggestions.length > 0 && (
        <div className="p-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Suggestions:</div>
          <div className="flex flex-wrap gap-1">
            {currentMemory.suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion)}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                {suggestion.slice(0, 30)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask me anything about this stage..."
            disabled={isStreaming}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!currentMessage.trim() || isStreaming}
            className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};