/**
 * Canvas.tsx
 * 
 * Main canvas component that integrates the AI Agent with the spatial canvas and user input.
 * Handles agent responses, auto-fill data, stage progression, and memory management.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Stage, StageData, ChatMessage } from '../../types';
import { SpatialCanvas } from '../canvas/SpatialCanvas';
import { ChatHistory } from '../ui/ChatHistory';
import { ChatInterface } from '../chat/ChatInterface';
import { useAgentChat } from '../../hooks/useAgentChat';
import { useAgent } from '../agent/AgentContextProvider';

interface CanvasProps {
  currentStage?: Stage;
  onSendMessage: (message: string) => void;
  onUpdateStageData?: (stageId: string, data: any) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentStage,
  stageData,
  onSendMessage,
  onUpdateStageData,
  onCompleteStage,
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const { agentState, updateAgentMemory, getStageRecommendations } = useAgent();
  
  const agentChat = useAgentChat({
    stageId: currentStage?.id || '',
    currentStageData: stageData,
    llmProvider: 'openai',
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{currentStage.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{currentStage.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {currentStage.completed && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
            )}
            {currentStage.comingSoon && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Coming Soon</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-1 min-h-full">
        <div className="max-w-4xl mx-auto space-y-6 min-h-full">

          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <SpatialCanvas
              currentStage={currentStage}
              stageData={stageData}
              onSendMessage={onSendMessage}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
