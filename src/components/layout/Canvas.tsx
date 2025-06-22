/**
 * Canvas.tsx
 * 
 * Main canvas component that integrates the AI Agent with the spatial canvas.
 * Flexible, responsive layout with smart animations.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Stage, StageData } from '../../types';
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
}) => {
  if (!currentStage) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen flex items-center justify-center bg-gray-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Stage</h3>
          <p className="text-gray-600">Choose a stage from the sidebar to get started with the AI assistant.</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen flex flex-col bg-gray-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{currentStage.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{currentStage.description}</p>
          </div>
          {currentStage.completed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
            >
              Completed
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Canvas Content - Flexible Height */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 min-h-0 p-3"
      >
        <motion.div
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <SpatialCanvas
            currentStage={currentStage}
            stageData={stageData}
            onSendMessage={onSendMessage}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};