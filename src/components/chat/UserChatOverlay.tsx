import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageSquare } from 'lucide-react';

interface UserChatOverlayProps {
  onSendMessage: (message: string) => void;
  onOpenSidebar: () => void;
  isLoading?: boolean;
  lastUserMessage?: string;
  disabled?: boolean;
}

export const UserChatOverlay: React.FC<UserChatOverlayProps> = ({
  onSendMessage,
  onOpenSidebar,
  isLoading = false,
  lastUserMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      onOpenSidebar(); // Open sidebar to show AI response
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Animated text for typing effect
  const AnimatedText: React.FC<{ text: string }> = ({ text }) => {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-500"
      >
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02, duration: 0.1 }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative"
    >
      {/* Last User Message Display */}
      <AnimatePresence>
        {lastUserMessage && !isFocused && !message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-2 px-4"
          >
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Last message:</span>
              <AnimatedText text={lastUserMessage} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-end gap-3 p-3 bg-white/80 backdrop-blur-sm mb-16">
          {/* Input Container */}
          <motion.div
            className="flex-1 relative"
            animate={{
              scale: isFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask the AI assistant about your app design..."
              disabled={isLoading || disabled}
              className="w-full px-4 py-3 bg-white border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500 shadow-sm transition-all duration-200"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-blue-500/20 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: isFocused ? 1 : 0,
                scale: isFocused ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <Send className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Subtle gradient overlay for seamless blending */}
        <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
      </motion.form>
    </motion.div>
  );
};