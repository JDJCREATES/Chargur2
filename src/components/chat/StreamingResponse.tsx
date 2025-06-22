import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

interface StreamingResponseProps {
  content: string;
  isComplete: boolean;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isStreaming: boolean;
}

export const StreamingResponse: React.FC<StreamingResponseProps> = ({
  content,
  isComplete,
  suggestions,
  onSuggestionClick,
  isStreaming
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (content !== displayedContent) {
      setDisplayedContent(content);
    }
  }, [content]);

  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setShowCursor(false);
    }
  }, [isStreaming]);

  if (!content && !isStreaming) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-800">AI Assistant</span>
          {isStreaming && (
            <div className="flex items-center gap-1 text-blue-600">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span className="text-xs">Thinking...</span>
            </div>
          )}
          {isComplete && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs">Complete</span>
            </div>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
            {displayedContent}
            {isStreaming && showCursor && (
              <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse" />
            )}
          </div>
        </div>

        {suggestions.length > 0 && isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-medium text-gray-600">Quick Actions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};