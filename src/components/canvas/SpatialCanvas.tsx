/**
 * SpatialCanvas.tsx
 * 
 * Main orchestrator for the SpatialCanvas system - a living, ephemeral design board.
 * Integrates all core components to provide a unified spatial design experience.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Central coordinator for all canvas operations
 * - Manages integration between data processing, state, interactions, and rendering
 * - Provides the main interface for stage data integration
 * - Maintains the ephemeral nature - nodes persist across stage transitions
 * - Handles toolbar integration and canvas controls
 * 
 * CRITICAL FUNCTIONALITY:
 * - Orchestrates updateCanvasFromStageData through CanvasDataProcessor
 * - Maintains persistent state across stage changes
 * - Provides unified interface for all canvas operations
 * - Handles real-time updates from stage data changes
 * - Manages canvas lifecycle and cleanup
 * 
 * EPHEMERAL DESIGN PHILOSOPHY:
 * The spatial canvas is designed to be a living board that evolves with the user's
 * design process. Unlike traditional stage-based systems that reset on navigation,
 * this canvas preserves user work and builds upon it incrementally. Nodes represent
 * the user's design thinking and persist across stage transitions, creating a
 * comprehensive visual representation of their entire project.
 */

import React, { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasRenderer } from './core/CanvasRenderer';
import { CanvasDataProcessor, ProcessorState } from './core/CanvasDataProcessor';
import { useCanvasStateManager } from './core/CanvasStateManager';
import { useCanvasScreenshot } from './core/CanvasScreenshot';
import { useCanvasInteractionManager } from './core/CanvasInteractionManager';
import { CanvasNodeData } from './CanvasNode';
import { STAGE1_NODE_TYPES, STAGE1_NODE_DEFAULTS } from './customnodetypes/stage1nodes';
import { Connection } from '../../types';
import { Connection } from '../../types';

interface SpatialCanvasProps {
  currentStage?: any;
  stageData: any;
  canvasNodes?: CanvasNodeData[];
  canvasConnections?: Connection[];
  onUpdateCanvasNodes?: (nodes: CanvasNodeData[]) => void;
  onUpdateCanvasConnections?: (connections: Connection[]) => void;
  canvasNodes?: CanvasNodeData[];
  canvasConnections?: Connection[];
  onUpdateCanvasNodes?: (nodes: CanvasNodeData[]) => void;
  onUpdateCanvasConnections?: (connections: Connection[]) => void;
  onSendMessage: (message: string) => void;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  stageData,
  canvasNodes = [],
  canvasConnections = [],
  onUpdateCanvasNodes,
  onUpdateCanvasConnections,
  canvasNodes = [],
  canvasConnections = [],
  onUpdateCanvasNodes,
  onUpdateCanvasConnections,
  onSendMessage
}) => {
  const {
    state,
    nodes,
    nodes,
    connections,
    updateNode,
    addNode,
    removeNode,
    addConnection,
    clearCanvas,
    resetView,
    setSelectedNode,
    setScale,
    setOffset,
    toggleGrid,
    processStageData,
  } = useCanvasStateManager(
    canvasNodes,
    canvasConnections,
    onUpdateCanvasNodes,
    onUpdateCanvasConnections
  );
    canvasConnections,
    onUpdateCanvasNodes,
    onUpdateCanvasConnections
  );

  const {
    interactionState,
    handlers
  } = useCanvasInteractionManager(
    state.scale,
    setScale,
    setOffset,
    setSelectedNode,
    updateNode,
    removeNode,
    (from: string, to: string) => {
      const newConnection = {
        id: `${from}-${to}`,
        from,
        to,
        type: 'reference' as const,
      };
      addConnection(newConnection);
      
      // Update node connections
      updateNode(from, {
        connections: [...(nodes.find(n => n.id === from)?.connections || []), to]
      });
    }
  );

  // Process stage data when it changes
  useEffect(() => {
    if (stageData) {
      processStageData(stageData);
    }
  }, [stageData, processStageData]);
        // Check if this singleton node already exists
        const existingNode = nodes.find(n => n.id === type);
        if (existingNode) {
          // Select the existing node instead of creating a new one
          setSelectedNode(existingNode.id);
          return;
        }
      }
      
      // Create the appropriate custom node
      let newNode: CanvasNodeData;
      
      switch (type) {
        case 'appName':
          newNode = {
            id: type,
            type,
            title: 'App Name',
            content: '',
            position: { 
              x: defaults.position.x + Math.random() * 50 - 25, 
              y: defaults.position.y + Math.random() * 50 - 25 
            },
            size: defaults.size,
            color: type,
            connections: [],
            metadata: { stage: 'ideation-discovery', nodeType: type },
            value: '',
            editable: true,
            nameHistory: [],
            resizable: true
          };
          break;
        case 'tagline':
          newNode = {
            id: type,
            type,
            title: 'Tagline',
            content: '',
            position: { 
              x: defaults.position.x + Math.random() * 50 - 25, 
              y: defaults.position.y + Math.random() * 50 - 25 
            },
            size: defaults.size,
            color: type,
            connections: [],
            metadata: { stage: 'ideation-discovery', nodeType: type },
            value: '',
            editable: true,
            resizable: true
          };
          break;
        case 'coreProblem':
          newNode = {
            id: type,
            type,
            title: 'Core Problem',
            content: '',
            position: { 
              x: defaults.position.x + Math.random() * 50 - 25, 
              y: defaults.position.y + Math.random() * 50 - 25 
            },
            size: defaults.size,
            color: type,
            connections: [],
            metadata: { stage: 'ideation-discovery', nodeType: type },
            value: '',
            editable: true,
            keywords: [],
            resizable: true
          };
          break;
        case 'mission':
          newNode = {
            id: type,
            type,
            title: 'Mission',
            content: '',
            position: { 
              x: defaults.position.x + Math.random() * 50 - 25, 
              y: defaults.position.y + Math.random() * 50 - 25 
            },
            size: defaults.size,
            color: type,
            connections: [],
            metadata: { stage: 'ideation-discovery', nodeType: type },
            value: '',
            editable: true,
            resizable: true
          };
          break;
        case 'valueProp':
          newNode = {
            id: type,
            type,
            title: 'Value Proposition',
            content: '',
            position: { 
              x: defaults.position.x + Math.random() * 50 - 25, 
              y: defaults.position.y + Math.random() * 50 - 25 
            },
            size: defaults.size,
            color: type,
            connections: [],
            metadata: { stage: 'ideation-discovery', nodeType: type },
            value: '',
            editable: true,
            bulletPoints: [],
            resizable: true
          };
          break;
        case 'userPersona':
          newNode = {
            id: `${type}-${Date.now()}`,
            type,
            title: 'User Persona',
            content: '',
            position: { 
              x: defaults.position.x + Math.random() * 50 - 25, 
              y: defaults.position.y + Math.random() * 50 - 25 
            },
            size: defaults.size,
            color: type,
            connections: [],
            metadata: { stage: 'ideation-discovery', nodeType: type },
            name: '',
            role: '',
            painPoint: '',
            emoji: '👤',
            editable: true,
            resizable: true
          };
          break;
        case 'competitor':
          newNode = {
            id: `${type}-${Date.now()}`,
            type,
            title: 'Competitor',
            content: '',
            position: { 
              x: defaults.position.x + Math.random() * 50 - 25, 
              y: defaults.position.y + Math.random() * 50 - 25 
            },
            size: defaults.size,
            color: type,
            connections: [],
            metadata: { stage: 'ideation-discovery', nodeType: type },
            name: '',
            notes: '',
            link: '',
            editable: true,
            resizable: true
          };
          break;
        default:
          // Default node creation for other types
          newNode = {
            id: `${type}-${Date.now()}`,
            type,
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            content: 'Click edit to add content...',
            position: { 
              x: Math.random() * 300 + 150, 
              y: Math.random() * 200 + 150 
            },
            size: { width: 180, height: 100 },
            color: type,
            connections: [],
            resizable: true
          };
      }
      
      addNode(newNode);
      setSelectedNode(newNode.id);
    } else {
      // Default node creation for other types
      const newNode: CanvasNodeData = {
        id: `${type}-${Date.now()}`,
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        content: 'Click edit to add content...',
        position: { 
          x: Math.random() * 300 + 150, 
          y: Math.random() * 200 + 150 
        },
        size: { width: 180, height: 100 },
        color: type,
        connections: [],
        resizable: true
      };
      
      addNode(newNode);
      setSelectedNode(newNode.id);
    }
  }, [addNode, setSelectedNode, nodes]);

  const handleAutoLayout = useCallback(() => {
    // Simple force-directed layout
    const nodesByType = nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, CanvasNodeData[]>);

    let x = 100;
    const typeSpacing = 300;
    const nodeSpacing = 120;

    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      let y = 100;
      typeNodes.forEach((node) => {
        updateNode(node.id, { position: { x, y } });
        y += nodeSpacing;
      });
      x += typeSpacing;
    });
  }, [nodes, updateNode]);

  // Save canvas state
  const handleSave = useCallback(() => {
    // Canvas is already auto-saved via onUpdateCanvasNodes/onUpdateCanvasConnections
    // Just provide visual feedback to the user
    const savedNotification = document.createElement('div');
    savedNotification.className = 'fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md z-50';
    savedNotification.textContent = 'Canvas saved successfully';
    document.body.appendChild(savedNotification);
    
    setTimeout(() => {
      savedNotification.remove();
    }, 2000);
  }, []);

  const handleExport = useCallback(() => {
    const exportData = {
      nodes,
      connections,
      metadata: { 
        exportedAt: new Date().toISOString(),
        version: '1.0',
        nodeCount: nodes.length,
        connectionCount: connections.length
      }
    };
    
      nodes,
      connections,
      metadata: { 
        exportedAt: new Date().toISOString(),
        version: '1.0',
        nodeCount: nodes.length,
        connectionCount: connections.length
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, connections]);
        onToggleGrid={toggleGrid}
        onScreenshot={() => takeScreenshot(canvasRef)}
        onAutoLayout={handleAutoLayout}
        onClearCanvas={clearCanvas}
        nodes={nodes}
        connections={connections}
        showGrid={state.showGrid}
        scale={state.scale}
        isCollapsed={isToolbarCollapsed}
        onToggleCollapse={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
      />

      {/* Main Canvas Area */}
      <div 
        ref={canvasRef}
        className={`w-full h-full ${interactionState.isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handlers.onCanvasClick}
        onWheel={handlers.onWheel}
        onMouseDown={handlers.onMouseDown}
        onMouseMove={handlers.onMouseMove}
        onMouseUp={handlers.onMouseUp}
        onMouseLeave={handlers.onMouseUp}
        onKeyDown={handlers.onKeyDown}
        tabIndex={0}>
        <CanvasRenderer
          nodes={nodes}
          connections={connections}
          selectedNodeId={state.selectedNodeId}
          connectingFrom={interactionState.connectingFrom}
          scale={state.scale}
          offset={state.offset}
          showGrid={state.showGrid}
          onNodeSelect={setSelectedNode}
          onNodeUpdate={updateNode}
          onNodeDelete={removeNode}
          onConnectionStart={handlers.onConnectionStart}
          onConnectionEnd={handlers.onConnectionEnd}
          onSendMessage={onSendMessage}
        />
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600">
        <div>Nodes: {nodes.length}</div>
        <div>Connections: {connections.length}</div>
        <div>Zoom: {Math.round(state.scale * 100)}%</div>
      </div>
    </div>
  );
};