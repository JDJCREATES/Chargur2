import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../../types';
import { Avatar } from './Avatar';
import { StreamingResponse } from '../chat/StreamingResponse';
import { Bot, User, Sparkles, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

// Ensure we have a proper type for ChatMessage
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatHistoryProps {
  messages: ChatMessageType[];
  currentResponse?: {
    content: string;
    isComplete: boolean;
    suggestions: string[];
    isStreaming: boolean;
    error?: string | null;
  };
  onSuggestionClick?: (suggestion: string) => void;
  onRetry?: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  messages, 
  currentResponse,
  onSuggestionClick,
  onRetry
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (messagesEndRef.current && (messages.length > 0 || currentResponse?.content)) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentResponse?.content]);

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    // Ensure we have a valid message type
    const isUser = message && message.type === 'user';
    const isLast = index === messages.length - 1;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isLast ? 'mb-4' : 'mb-6'}`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
          {/* Message Header */}
          <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
            <span className="text-xs font-medium text-gray-600">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>

          {/* Message Bubble */}
          <div
            className={`
              p-3 rounded-lg text-sm leading-relaxed
              ${isUser 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }
            `}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCurrentResponse = () => {
    if (!currentResponse) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-4"
      >
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
        </div>

        {/* Response Content */}
        <div className="flex-1">
          {/* Response Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600">AI Assistant</span>
            
            {currentResponse.isStreaming && (
              <div className="flex items-center gap-1 text-purple-600">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
            
            {currentResponse.isComplete && !currentResponse.error && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs">Complete</span>
              </div>
            )}

            {currentResponse.error && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">Error</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Now</span>
            </div>
          </div>

          {/* Error Display */}
          {currentResponse.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{currentResponse.error}</span>
                </div>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Response Bubble */}
          {currentResponse.content && (
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-sm p-3 mb-3">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {currentResponse.content}
                  {currentResponse.isStreaming && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-purple-600 ml-1"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {currentResponse.suggestions.length > 0 && currentResponse.isComplete && onSuggestionClick && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-50 rounded-lg p-3 border border-purple-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Quick Actions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentResponse.suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="px-3 py-1.5 text-xs bg-white text-purple-700 rounded-full border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-colors"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      ref={scrollRef} 
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {(!messages || messages.length === 0) && !currentResponse ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Welcome to Chargur AI Assistant
          </h3>
          <p className="text-gray-600 max-w-md">
            I'm here to help you plan and design your app. Start by describing your app idea, 
            and I'll guide you through each stage of the development process.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {[
              "I want to build a social media app",
              "Help me plan an e-commerce platform", 
              "I need a productivity tool for teams"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(example)}
                className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {messages && messages.map((message, index) => renderMessage(message, index))}
          </AnimatePresence>
          
          {renderCurrentResponse()}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};