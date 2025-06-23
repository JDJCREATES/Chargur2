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

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasRenderer } from './core/CanvasRenderer';
import { CanvasDataProcessor, ProcessorState } from './core/CanvasDataProcessor';
import { useCanvasStateManager } from './core/CanvasStateManager';
import { useCanvasInteractionManager } from './core/CanvasInteractionManager';
import { CanvasNodeData } from './CanvasNode';
export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  stageData,
  onSendMessage
}) => {
  const {
    state,
    isLoaded,
    updateState,
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
    exportState,
    importState
  } = useCanvasStateManager();

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
        connections: [...(state.nodes.find(n => n.id === from)?.connections || []), to]
      });
    }
  );

  // Handle stage data updates through CanvasDataProcessor
  useEffect(() => {
    if (!isLoaded) return;

    const processorState: ProcessorState = {
      nodes: state.nodes,
      lastProcessedData: state.lastProcessedData
    };

    CanvasDataProcessor.updateCanvasFromStageData(
      stageData,
      processorState,
      (newState: ProcessorState) => {
        updateState({
          nodes: newState.nodes,
          lastProcessedData: newState.lastProcessedData
        });
      }
    );
  }, [stageData, isLoaded, state.nodes, state.lastProcessedData, updateState]);

  const handleAddNode = useCallback((type: CanvasNodeData['type']) => {
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
    };
    
    addNode(newNode);
  }, [addNode]);

  const handleAutoLayout = useCallback(() => {
    // Simple force-directed layout
    const nodesByType = state.nodes.reduce((acc, node) => {
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
  }, [state.nodes, updateNode]);

  const handleSave = useCallback(() => {
    console.log('Canvas saved automatically');
  }, []);

  const handleExport = useCallback(() => {
    const exportData = exportState();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportState]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
      {/* Canvas Toolbar */}
      <CanvasToolbar
        onAddNode={handleAddNode}
        onZoomIn={() => setScale(Math.min(3, state.scale * 1.2))}
        onZoomOut={() => setScale(Math.max(0.1, state.scale * 0.8))}
        onResetView={resetView}
        onSave={handleSave}
        onExport={handleExport}
        onToggleGrid={toggleGrid}
        onAutoLayout={handleAutoLayout}
        onClearCanvas={clearCanvas}
        showGrid={state.showGrid}
        scale={state.scale}
      />

      {/* Main Canvas Area */}
      <div
        className={`w-full h-full ${interactionState.isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handlers.onCanvasClick}
        onWheel={handlers.onWheel}
        onMouseDown={handlers.onMouseDown}
        onMouseMove={handlers.onMouseMove}
        onMouseUp={handlers.onMouseUp}
        onMouseLeave={handlers.onMouseUp}
        onKeyDown={handlers.onKeyDown}
        tabIndex={0}
      >
        <CanvasRenderer
          nodes={state.nodes}
          connections={state.connections}
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
        />
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600">
        <div>Nodes: {state.nodes.length}</div>
        <div>Connections: {state.connections.length}</div>
        <div>Zoom: {Math.round(state.scale * 100)}%</div>
      </div>
    </div>
  );
};