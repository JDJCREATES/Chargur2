/**
 * Canvas.tsx
 * 
 * Main canvas component that integrates the AI Agent with the spatial canvas.
 * Flexible, responsive layout with smart animations.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stage, StageData, Connection } from '../../types';
import { SpatialCanvas } from '../canvas/SpatialCanvas';
import { useAppStore } from '../../store/useAppStore';
import { UserChatOverlay } from '../chat/UserChatOverlay';
import { CanvasNodeData } from '../canvas/CanvasNode';

interface AgentChatProps {
  sendMessage: (message: string) => void;
  historyMessages: any[];
  content: string;
  suggestions: string[];
  autoFillData: any;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  isStreaming: boolean;
}

interface CanvasProps {
  currentStage?: Stage;
  stageData: StageData;
  canvasNodes?: CanvasNodeData[];
  canvasConnections?: Connection[];
  onUpdateCanvasNodes?: (nodes: CanvasNodeData[]) => void;
  onUpdateCanvasConnections?: (connections: Connection[]) => void;
  onOpenSidebar?: () => void;
  agentChat: AgentChatProps;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentStage,
  stageData,
  canvasNodes,
  canvasConnections,
  onUpdateCanvasNodes,
  onUpdateCanvasConnections,
  onOpenSidebar,
  agentChat
}) => {
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const { projectId } = useAppStore();
  
  // Use the props directly (they're already passed from App.tsx)
  const effectiveCanvasNodes = canvasNodes || [];
  const effectiveCanvasConnections = canvasConnections || [];

  const handleSendMessage = (message: string) => {
    setLastUserMessage(message);
    agentChat.sendMessage(message);
    // Open the sidebar when a message is sent
    if (onOpenSidebar) {
      onOpenSidebar();
    }
  };

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
          className="text-center max-w-md p-6 bg-white rounded-lg shadow-md"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome To Chargur UX-IA Agent</h3>
          {useAppStore.getState().projectId ? (
            <p className="text-gray-600">Choose a stage from the sidebar to get started designing your app!</p>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">No project is currently loaded. Create a new project to get started!</p>
              <button
                onClick={() => useAppStore.getState().createAndLoadNewProject()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Project
              </button>
            </div>
          )}
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
            <h1 className="text-xl font-semibold text-gray-800">{currentStage.title}   
              
            </h1>
            <p className="text-sm text-gray-600 mt-1">{currentStage.description}</p>
            <div className="flex items-center mt-2"> {currentStage.completed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="px-2 py-1 pr-5 bg-green-100 text-green-800 text-xs rounded-full"
            >
              Completed
            </motion.span>
          )}
        </div> 
         <h2 className="items-center space-x-2 pr-5 font-chargur inline-flex">ChargUr </h2>
        </div>
      
          </div>
         
      </motion.div>

      {/* Canvas Content - Flexible Height with Chat Overlay */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 min-h-0 p-3 flex flex-col"
      >
        {/* Spatial Canvas */}
        <motion.div
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <SpatialCanvas
            currentStage={currentStage}
            stageData={stageData}
            projectId={projectId}
            canvasNodes={effectiveCanvasNodes}
            canvasConnections={effectiveCanvasConnections}
            onUpdateCanvasNodes={onUpdateCanvasNodes}
            onUpdateCanvasConnections={onUpdateCanvasConnections}
            onSendMessage={agentChat.sendMessage}
          />
        </motion.div>

        {/* User Chat Input Overlay */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <UserChatOverlay
            onSendMessage={handleSendMessage}
            onOpenSidebar={onOpenSidebar || (() => {})}
            isLoading={agentChat.isLoading || agentChat.isStreaming}
            lastUserMessage={lastUserMessage}
            disabled={!currentStage}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};