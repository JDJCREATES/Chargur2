import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { CanvasHeader } from './CanvasHeader';
import { SpatialCanvas } from '../canvas/SpatialCanvas';
import { Stage } from '../../types';

interface CanvasProps {
  currentStage?: Stage;
  stageData: any;
  onSendMessage: (message: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  currentStage, 
  stageData,
  onSendMessage
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };




  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <CanvasHeader currentStage={currentStage} />
      
      {/* Main Canvas Area */}
      <SpatialCanvas
        currentStage={currentStage}
        stageData={stageData}
        onSendMessage={onSendMessage}
      />

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  currentStage?.comingSoon 
                    ? "This stage is coming soon..." 
                    : "Describe your app idea or ask a question..."
                }
                disabled={currentStage?.comingSoon}
                className={`
                  w-full p-4 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${currentStage?.comingSoon ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
                `}
              />
              <button
                type="submit"
                disabled={!message.trim() || currentStage?.comingSoon}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors
                  ${message.trim() && !currentStage?.comingSoon
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};