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

export interface CanvasState {
  nodes: CanvasNodeData[];
  connections: Connection[];
  selectedNodeId: string | null;
  scale: number;
  offset: { x: number; y: number };
  showGrid: boolean;
  lastProcessedData: { [key: string]: any };
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'reference' | 'dependency' | 'flow';
}

const STORAGE_KEYS = {
  NODES: 'chargur-canvas-nodes',
  CONNECTIONS: 'chargur-canvas-connections',
  LAST_PROCESSED: 'chargur-last-processed-data',
  CANVAS_STATE: 'chargur-canvas-state'
};

const DEFAULT_STATE: CanvasState = {
  nodes: [],
  connections: [],
  selectedNodeId: null,
  scale: 1,
  offset: { x: 0, y: 0 },
  showGrid: true,
  lastProcessedData: {}
};

export const useCanvasStateManager = () => {
  const [state, setState] = useState<CanvasState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    loadCanvasState();
  }, []);

  // Auto-save state changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      saveCanvasState(state);
    }
  }, [state, isLoaded]);

  const loadCanvasState = useCallback(() => {
    try {
      // Try to load complete state first
      const savedState = localStorage.getItem(STORAGE_KEYS.CANVAS_STATE);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(parsed);
        setIsLoaded(true);
        return;
      }

      // Fallback to individual keys for backward compatibility
      const savedNodes = localStorage.getItem(STORAGE_KEYS.NODES);
      const savedConnections = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      const savedLastProcessed = localStorage.getItem(STORAGE_KEYS.LAST_PROCESSED);

      const loadedState: CanvasState = {
        ...DEFAULT_STATE,
        nodes: savedNodes ? JSON.parse(savedNodes) : [],
        connections: savedConnections ? JSON.parse(savedConnections) : [],
        lastProcessedData: savedLastProcessed ? JSON.parse(savedLastProcessed) : {}
      };

      setState(loadedState);
      setIsLoaded(true);
    } catch (error) {
      console.warn('Failed to load canvas state, using defaults:', error);
      setState(DEFAULT_STATE);
      setIsLoaded(true);
    }
  }, []);

  const saveCanvasState = useCallback((stateToSave: CanvasState) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CANVAS_STATE, JSON.stringify(stateToSave));
      
      // Also save individual keys for backward compatibility
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(stateToSave.nodes));
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(stateToSave.connections));
      localStorage.setItem(STORAGE_KEYS.LAST_PROCESSED, JSON.stringify(stateToSave.lastProcessedData));
    } catch (error) {
      console.error('Failed to save canvas state:', error);
    }
  }, []);

  const updateState = useCallback((updates: Partial<CanvasState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNodes = useCallback((nodes: CanvasNodeData[]) => {
    setState(prev => ({ ...prev, nodes }));
  }, []);

  const updateConnections = useCallback((connections: Connection[]) => {
    setState(prev => ({ ...prev, connections }));
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNodeData>) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  const addNode = useCallback((node: CanvasNodeData) => {
    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, node]
    }));
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.from !== nodeId && conn.to !== nodeId
      ),
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId
    }));
  }, []);

  const addConnection = useCallback((connection: Connection) => {
    setState(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }));
  }, []);

  const removeConnection = useCallback((connectionId: string) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }));
  }, []);

  const clearCanvas = useCallback(() => {
    const clearedState = {
      ...DEFAULT_STATE,
      scale: state.scale,
      offset: state.offset,
      showGrid: state.showGrid
    };
    setState(clearedState);
    
    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, [state.scale, state.offset, state.showGrid]);

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

  const exportState = useCallback(() => {
    return {
      nodes: state.nodes,
      connections: state.connections,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        nodeCount: state.nodes.length,
        connectionCount: state.connections.length
      }
    };
  }, [state]);

  const importState = useCallback((importedData: any) => {
    try {
      if (importedData.nodes && Array.isArray(importedData.nodes)) {
        setState(prev => ({
          ...prev,
          nodes: importedData.nodes,
          connections: importedData.connections || [],
          selectedNodeId: null
        }));
      }
    } catch (error) {
      console.error('Failed to import canvas state:', error);
    }
  }, []);

  return {
    state,
    isLoaded,
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
    exportState,
    importState,
    saveCanvasState,
    loadCanvasState
  };
};