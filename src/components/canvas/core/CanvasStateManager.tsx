/**
 * CanvasStateManager.tsx
 * 
 * Manages the persistent state of the SpatialCanvas system.
 * Handles localStorage operations, state synchronization, and recovery.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Persists canvas state across browser sessions
 * - Manages node positions and user customizations
 * - Handles state recovery and migration
 * - Provides state synchronization between components
 * - Maintains ephemeral nature while preserving user work
 * 
 * CRITICAL FUNCTIONALITY:
 * - Auto-save canvas state to localStorage
 * - Load and restore canvas state on initialization
 * - Handle state migrations for schema changes
 * - Provide state update callbacks for components
 */

import { useState, useEffect, useCallback } from 'react';
import { CanvasNodeData } from '../CanvasNode';
import { CanvasDataProcessor, ProcessorState } from './CanvasDataProcessor';

export interface CanvasState {
  selectedNodeId: string | null;
  scale: number;
  offset: { x: number; y: number };
  showGrid: boolean;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'reference' | 'dependency' | 'flow';
}

const DEFAULT_STATE: CanvasState = {
  selectedNodeId: null,
  scale: 1,
  offset: { x: 0, y: 0 },
  showGrid: true,
};

export const useCanvasStateManager = (
  initialNodes: CanvasNodeData[] = [],
  initialConnections: Connection[] = [],
  onUpdateNodes?: (nodes: CanvasNodeData[]) => void | undefined,
  onUpdateConnections?: (connections: Connection[]) => void | undefined
) => {
  const [state, setState] = useState<CanvasState>(DEFAULT_STATE);
  const [nodes, setNodes] = useState<CanvasNodeData[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  
  // Update local state when props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);
  
  useEffect(() => {
    setConnections(initialConnections);
  }, [initialConnections]);

  const updateState = useCallback((updates: Partial<CanvasState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNodes = useCallback((updatedNodes: CanvasNodeData[]) => {
    setNodes(updatedNodes);
    if (onUpdateNodes) {
      onUpdateNodes(updatedNodes);
    }
  }, [onUpdateNodes]);

  const updateConnections = useCallback((updatedConnections: Connection[]) => {
    setConnections(updatedConnections);
    if (onUpdateConnections) {
      onUpdateConnections(updatedConnections);
    }
  }, [onUpdateConnections]);

  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNodeData>) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    );
    setNodes(updatedNodes);
    if (onUpdateNodes) {
      onUpdateNodes(updatedNodes);
    }
  }, [nodes, onUpdateNodes]);

  const addNode = useCallback((node: CanvasNodeData) => {
    const updatedNodes = [...nodes, node];
    setNodes(updatedNodes);
    if (onUpdateNodes) {
      onUpdateNodes(updatedNodes);
    }
  }, [nodes, onUpdateNodes]);

  const removeNode = useCallback((nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    setNodes(updatedNodes);
    if (onUpdateNodes) {
      onUpdateNodes(updatedNodes);
    }
    
    const updatedConnections = connections.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    );
    setConnections(updatedConnections);
    if (onUpdateConnections) {
      onUpdateConnections(updatedConnections);
    }
    
    // Update selected node if needed
    if (state.selectedNodeId === nodeId) {
      setState(prev => ({ ...prev, selectedNodeId: null }));
    }
  }, [nodes, connections, state.selectedNodeId, onUpdateNodes, onUpdateConnections]);

  const addConnection = useCallback((connection: Connection) => {
    const updatedConnections = [...connections, connection];
    setConnections(updatedConnections);
    if (onUpdateConnections) {
      onUpdateConnections(updatedConnections);
    }
  }, [connections, onUpdateConnections]);

  const removeConnection = useCallback((connectionId: string) => {
    const updatedConnections = connections.filter(conn => conn.id !== connectionId);
    setConnections(updatedConnections);
    if (onUpdateConnections) {
      onUpdateConnections(updatedConnections);
    }
  }, [connections, onUpdateConnections]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    if (onUpdateNodes) {
      onUpdateNodes([]);
    }
    
    setConnections([]);
    if (onUpdateConnections) {
      onUpdateConnections([]);
    }
    
    setState(prev => ({
      ...prev,
      selectedNodeId: null
    }));
  }, [onUpdateNodes, onUpdateConnections]);

  const resetView = useCallback(() => {
    setState(prev => ({
      ...prev,
      scale: 1,
      offset: { x: 0, y: 0 }
    }));
  }, []);

  const setSelectedNode = useCallback((nodeId: string | null) => {
    setState(prev => ({ ...prev, selectedNodeId: nodeId }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setState(prev => ({ ...prev, scale }));
  }, []);

  const setOffset = useCallback((offset: { x: number; y: number }) => {
    setState(prev => ({ ...prev, offset }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const processStageData = useCallback((stageData: any) => {
    const processorState: ProcessorState = {
      nodes: nodes
    };

    CanvasDataProcessor.updateCanvasFromStageData(
      stageData,
      processorState,
      (newState: ProcessorState) => {
        updateNodes(newState.nodes); 
      }
    );
  }, [nodes, updateNodes]);

  return {
    state,
    nodes,
    connections,
    updateState,
    updateNodes,
    updateConnections,
    updateNode,
    addNode,
    removeNode,
    addConnection,
    removeConnection,
    clearCanvas,
    resetView,
    setSelectedNode,
    setScale,
    setOffset,
    toggleGrid,
    processStageData
  };
};