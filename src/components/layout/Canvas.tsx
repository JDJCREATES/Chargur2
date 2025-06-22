/**
 * Canvas.tsx
 * 
 * Main canvas component that integrates the AI Agent with the spatial canvas and user input.
 * Handles agent responses, auto-fill data, stage progression, and memory management.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Stage, StageData } from '../../types';
import { ChatInterface } from '../chat/ChatInterface';
import { StreamingResponse } from '../chat/StreamingResponse';
import { useAgentChat } from '../../hooks/useAgentChat';
import { SpatialCanvas } from '../canvas/SpatialCanvas';

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
  onGoToStage,
  getNextStage,
}) => {
  const {
    isLoading,
    error,
    content,
    suggestions,
    isComplete,
    isStreaming,
    sendMessage,
    retry,
    clearError
  } = useAgentChat({
    stageId: currentStage?.id || 'unknown',
    currentStageData: stageData[currentStage?.id || ''] || {},
    allStageData: stageData,
    onAutoFill: (data) => {
      if (currentStage?.id) {
        onUpdateStageData(currentStage.id, data);
      }
    },
    onStageComplete: () => {
      if (currentStage?.id) {
        onCompleteStage(currentStage.id);
      }
    }
  });

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
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
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Completed
              </span>
            )}
            {currentStage.comingSoon && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stage Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              {currentStage.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentStage.description}
            </p>
            {currentStage.comingSoon && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  This stage is coming soon! We're working hard to bring you more AI-powered features.
                </p>
              </div>
            )}
          </motion.div>

          {/* Agent Response */}
          <StreamingResponse
            content={content}
            isComplete={isComplete}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            isStreaming={isStreaming}
          />

          {/* Spatial Canvas */}
          <SpatialCanvas
            currentStage={currentStage}
            stageData={stageData}
            onSendMessage={onSendMessage}
          />
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface
        onSendMessage={sendMessage}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
      />
    </div>
  );
};