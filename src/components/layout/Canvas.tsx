/**
 * Canvas.tsx
 * 
 * Main canvas component that integrates the AI Agent with the spatial canvas.
 * Flexible, responsive layout with smart animations.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ReactFlowProvider } from 'reactflow';
import { Stage, StageData } from '../../types';
import { SpatialCanvas } from '../canvas/SpatialCanvas';
import { Node, Edge } from 'reactflow';
import { Logo } from './Logo';
import { useAppStore } from '../../store/useAppStore';
import { UserChatOverlay } from '../chat/UserChatOverlay';

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
  canvasNodes?: Node[];
  canvasConnections?: Edge[];
  onUpdateCanvasNodes?: (nodes: Node[]) => void;
  onUpdateCanvasConnections?: (connections: Edge[]) => void;
  onOpenSidebar?: () => void;
  onAddLofiLayoutNode?: () => void;
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
  onAddLofiLayoutNode,
  agentChat
}) => {
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const { projectId } = useAppStore();
  
  const effectiveCanvasNodes = canvasNodes || [];
  const effectiveCanvasConnections = canvasConnections || [];
  
  // Handler for adding a lo-fi layout node
  const handleAddLofiLayoutNode = useCallback(() => {
    // Import nodeFactory and use it to create a new lo-fi layout node
    import('../../lib/canvas/nodeFactory').then(({ createLofiLayoutNode }) => {
      // Get current state from the store
      const appStore = useAppStore.getState();
      const currentNodes = appStore.canvasNodes;
      const currentStageData = appStore.stageData['interface-interaction'] || {};
      
      // Create a unique layout ID
      const layoutId = `layout-${Date.now()}`;
      
      // Create layout data
      const layoutData = {
        layoutId,
        templateName: 'Dashboard Layout',
        description: 'Main dashboard with sidebar navigation',
        viewMode: 'desktop',
        layoutBlocks: [
          { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
          { id: 'sidebar', type: 'sidebar', label: 'Sidebar', position: { x: 0, y: 10 }, size: { width: 20, height: 80 }, locked: true },
          { id: 'content', type: 'content', label: 'Content Area', position: { x: 20, y: 10 }, size: { width: 80, height: 80 }, locked: true },
          { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
        ]
      };
      
      // Create a new lo-fi layout node
      const newNode = createLofiLayoutNode(layoutData, currentNodes);
      
      // Add the new node to canvas
      appStore.updateCanvasNodes([...currentNodes, newNode]);
      
      // Also update the stage data to include this layout
      const lofiLayouts = [...(currentStageData.lofiLayouts || []), layoutData];
      appStore.updateStageData('interface-interaction', { lofiLayouts });
      
      console.log('Lo-fi layout node added to canvas');
    });
  }, []);

  const handleSendMessage = (message: string) => {
    setLastUserMessage(message);
    agentChat.sendMessage(message);
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
          <ReactFlowProvider>
            <SpatialCanvas
              currentStage={currentStage}
              stageData={stageData}
              projectId={projectId}
              canvasNodes={effectiveCanvasNodes}
              canvasConnections={effectiveCanvasConnections}
              onUpdateCanvasNodes={onUpdateCanvasNodes}
              onUpdateCanvasConnections={onUpdateCanvasConnections}
              onAddLofiLayoutNode={handleAddLofiLayoutNode}
              onSendMessage={agentChat.sendMessage}
            />
          </ReactFlowProvider>
        </motion.div>

        {/* User Chat Input Overlay */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="mb-24"
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