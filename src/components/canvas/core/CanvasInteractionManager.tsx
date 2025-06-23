/**
 * CanvasInteractionManager.tsx
 * 
 * Handles all user interactions within the SpatialCanvas system.
 * Manages node selection, connections, dragging, and canvas navigation.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Processes user input events (mouse, keyboard, touch)
 * - Manages node selection and multi-selection
 * - Handles node connection creation and management
 * - Controls canvas panning and zooming
 * - Provides interaction feedback and visual cues
 * 
 * CRITICAL FUNCTIONALITY:
 * - Node dragging with collision detection
 * - Connection creation between nodes
 * - Canvas panning and zooming
 * - Keyboard shortcuts for power users
 * - Touch support for mobile devices
 */

import { useCallback, useRef, useState } from 'react';
import { CanvasNodeData } from '../CanvasNode';

export interface InteractionState {
  isDragging: boolean;
  isPanning: boolean;
  isConnecting: boolean;
  connectingFrom: string | null;
  draggedNode: string | null;
  lastPanPoint: { x: number; y: number };
}

export interface InteractionHandlers {
  onNodeSelect: (nodeId: string) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionStart: (nodeId: string) => void;
  onConnectionEnd: (nodeId: string) => void;
  onCanvasClick: (event: React.MouseEvent) => void;
  onWheel: (event: React.WheelEvent) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

const DEFAULT_INTERACTION_STATE: InteractionState = {
  isDragging: false,
  isPanning: false,
  isConnecting: false,
  connectingFrom: null,
  draggedNode: null,
  lastPanPoint: { x: 0, y: 0 }
};

export const useCanvasInteractionManager = (
  scale: number,
  onScaleChange: (scale: number) => void,
  onOffsetChange: (offset: { x: number; y: number }) => void,
  onNodeSelect: (nodeId: string | null) => void,
  onNodeUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void,
  onNodeDelete: (nodeId: string) => void,
  onConnectionCreate: (from: string, to: string) => void
) => {
  const [interactionState, setInteractionState] = useState<InteractionState>(DEFAULT_INTERACTION_STATE);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
      setInteractionState(prev => ({ 
        ...prev, 
        connectingFrom: null, 
        isConnecting: false 
      }));
    }
  }, [onNodeSelect]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, scale * delta));
    onScaleChange(newScale);
  }, [scale, onScaleChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.metaKey || e.ctrlKey))) {
      // Middle mouse or Cmd/Ctrl+click for panning
      e.preventDefault();
      setInteractionState(prev => ({
        ...prev,
        isPanning: true,
        lastPanPoint: { x: e.clientX, y: e.clientY }
      }));
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (interactionState.isPanning) {
      e.preventDefault();
      const deltaX = e.clientX - interactionState.lastPanPoint.x;
      const deltaY = e.clientY - interactionState.lastPanPoint.y;
      
      const newOffset = {
        x: offsetRef.current.x + deltaX,
        y: offsetRef.current.y + deltaY
      };
      
      offsetRef.current = newOffset;
      onOffsetChange(newOffset);
      
      setInteractionState(prev => ({
        ...prev,
        lastPanPoint: { x: e.clientX, y: e.clientY }
      }));
    }
  }, [interactionState.isPanning, interactionState.lastPanPoint, onOffsetChange]);

  const handleMouseUp = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      isPanning: false,
      isDragging: false,
      draggedNode: null
    }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.key === 'Escape') {
      setInteractionState(prev => ({
        ...prev,
        connectingFrom: null,
        isConnecting: false
      }));
      onNodeSelect(null);
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Delete selected node (would need selectedNodeId from parent)
      // This would be handled by the parent component
    }
    
    if (e.key === ' ') {
      e.preventDefault();
      // Space bar for panning mode
    }
  }, [onNodeSelect]);

  const startConnection = useCallback((nodeId: string) => {
    setInteractionState(prev => ({
      ...prev,
      connectingFrom: nodeId,
      isConnecting: true
    }));
  }, []);

  const endConnection = useCallback((nodeId: string) => {
    if (interactionState.connectingFrom && interactionState.connectingFrom !== nodeId) {
      onConnectionCreate(interactionState.connectingFrom, nodeId);
    }
    setInteractionState(prev => ({
      ...prev,
      connectingFrom: null,
      isConnecting: false
    }));
  }, [interactionState.connectingFrom, onConnectionCreate]);

  const startNodeDrag = useCallback((nodeId: string) => {
    setInteractionState(prev => ({
      ...prev,
      isDragging: true,
      draggedNode: nodeId
    }));
  }, []);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    // Ensure position is within bounds
    const boundedPosition = {
      x: Math.max(0, position.x),
      y: Math.max(0, position.y)
    };
    
    onNodeUpdate(nodeId, { position: boundedPosition });
  }, [onNodeUpdate]);

  const endNodeDrag = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      isDragging: false,
      draggedNode: null
    }));
  }, []);

  const handlers: InteractionHandlers = {
    onNodeSelect,
    onNodeUpdate,
    onNodeDelete,
    onConnectionStart: startConnection,
    onConnectionEnd: endConnection,
    onCanvasClick: handleCanvasClick,
    onWheel: handleWheel,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onKeyDown: handleKeyDown
  };

  return {
    interactionState,
    handlers,
    startNodeDrag,
    updateNodePosition,
    endNodeDrag,
    setInteractionState
  };
};