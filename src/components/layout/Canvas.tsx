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
  stageData: StageData;
  onSendMessage: (message: string) => void;
  onUpdateStageData?: (stageId: string, data: any) => void;
  onCompleteStage?: (stageId: string) => void;
  onGoToStage?: (stageId: string) => void;
  getNextStage?: () => Stage | null;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentStage,
  stageData,
  onSendMessage,
  onUpdateStageData,
  onCompleteStage,
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const agentChat = useAgentChat({
    stageId: currentStage?.id || '',
    currentStageData: stageData,
    allStageData: stageData,
    onAutoFill: (data) => {
      if (currentStage?.id && onUpdateStageData) {
        onUpdateStageData(currentStage.id, data);
      }
    },
    onStageComplete: () => {
      if (currentStage?.id && onCompleteStage) {
        onCompleteStage(currentStage.id);
      }
    },
  });

  const { agentState } = useAgent();

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      type: 'user',
    };
    setChatMessages(prev => [...prev, userMessage]);
    agentChat.sendMessage(content);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleRetry = () => {
    agentChat.retry();
  };

  if (!currentStage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Stage</h3>
          <p className="text-gray-600">Choose a stage from the sidebar to get started with the AI assistant.</p>
        </div>
      </div>
    );
  }

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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Stage Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-800 mb-2">{currentStage.title}</h2>
            <p className="text-gray-600 mb-4">{currentStage.description}</p>
            {currentStage.comingSoon && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  This stage is coming soon! We're working hard to bring you more AI-powered features.
                </p>
              </div>
            )}
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col"
          >
            <div className="flex items-center gap-2 p-4 border-b border-gray-200">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            </div>

            <ChatHistory
              messages={chatMessages}
              currentResponse={
                agentChat.content || agentChat.isLoading
                  ? {
                      content: agentChat.content,
                      isComplete: agentChat.isComplete,
                      suggestions: agentChat.suggestions,
                      isStreaming: agentChat.isStreaming,
                      error: agentChat.error,
                    }
                  : undefined
              }
              onSuggestionClick={handleSuggestionClick}
              onRetry={handleRetry}
            />

            <ChatInterface
              onSendMessage={handleSendMessage}
              isLoading={agentChat.isLoading}
              error={agentChat.error}
              onRetry={handleRetry}
              disabled={!currentStage}
            />
          </motion.div>

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
