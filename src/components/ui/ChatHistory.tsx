import React from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '../../types';
import { Avatar } from './Avatar';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  return (
    <div className="max-h-64 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          <p>No conversations yet.</p>
          <p className="text-sm mt-2">Start by describing your app idea!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar size="sm" />
              <div
                className={`
                  max-w-[80%] p-3 rounded-lg text-sm
                  ${message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                  }
                `}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};