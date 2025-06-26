/**
 * CanvasStateManager.tsx
 * 
 * Manages the persistent state of the SpatialCanvas system.
 * Handles saving, loading, and updating canvas state.
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
import { useRef } from 'react';
import { isEqual } from 'lodash';
import { CanvasNodeData } from '../CanvasNode';
import { CanvasDataProcessor, ProcessorState } from './CanvasDataProcessor';
import { useAppStore } from '../../../store/useAppStore';

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
  const [lastProcessedStageData, setLastProcessedStageData] = useState<{ [key: string]: any }>({});
  
  // Add processing flag to prevent loops
  const processingRef = useRef(false);
  
  // Use ref to hold latest nodes to prevent infinite loops
  const nodesRef = useRef<CanvasNodeData[]>(initialNodes);
  
  // Get resetView action from the store
  const storeResetView = useAppStore(state => state.resetView);
  
  // Update the ref whenever initialNodes change
  useEffect(() => {
    nodesRef.current = initialNodes;
  }, [initialNodes]);
  
  // Deep comparison helper to prevent unnecessary updates
  const areNodesEqual = useCallback((nodesA: CanvasNodeData[], nodesB: CanvasNodeData[]) => {
    if (nodesA.length !== nodesB.length) return false;
    return isEqual(nodesA, nodesB);
  }, []);
  
  const areConnectionsEqual = useCallback((connsA: Connection[], connsB: Connection[]) => {
    if (connsA.length !== connsB.length) return false;
    return isEqual(connsA, connsB);
  }, []);
  
  const updateState = useCallback((updates: Partial<CanvasState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNodes = useCallback((updatedNodes: CanvasNodeData[]) => {
    // Only update if the nodes have actually changed (deep comparison)
    if (onUpdateNodes && !areNodesEqual(updatedNodes, initialNodes)) {
      console.log('Nodes changed, updating...');
      onUpdateNodes(updatedNodes);
    }
  }, [onUpdateNodes, initialNodes, areNodesEqual]);

  const updateConnections = useCallback((updatedConnections: Connection[]) => {
    // Only update if the connections have actually changed (deep comparison)
    if (onUpdateConnections && !areConnectionsEqual(updatedConnections, initialConnections)) {
      console.log('Connections changed, updating...');
      onUpdateConnections(updatedConnections);
    }
  }, [onUpdateConnections, initialConnections, areConnectionsEqual]);

  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNodeData>) => {
    const updatedNodes = initialNodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    );
    if (onUpdateNodes) {
      onUpdateNodes(updatedNodes);
    }
  }, [initialNodes, onUpdateNodes]);

  const addNode = useCallback((node: CanvasNodeData) => {
    const updatedNodes = [...initialNodes, node];
    if (onUpdateNodes) {
      onUpdateNodes(updatedNodes);
    }
  }, [initialNodes, onUpdateNodes]);

  const removeNode = useCallback((nodeId: string) => {
    const updatedNodes = initialNodes.filter(node => node.id !== nodeId);
    if (onUpdateNodes) {
      onUpdateNodes(updatedNodes);
    }
    
    const updatedConnections = initialConnections.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    );
    if (onUpdateConnections) {
      onUpdateConnections(updatedConnections);
    }
    
    // Update selected node if needed
    if (state.selectedNodeId === nodeId) {
      setState(prev => ({ ...prev, selectedNodeId: null }));
    }
  }, [initialNodes, initialConnections, state.selectedNodeId, onUpdateNodes, onUpdateConnections]);

  const addConnection = useCallback((connection: Connection) => {
    const updatedConnections = [...initialConnections, connection];
    if (onUpdateConnections) {
      onUpdateConnections(updatedConnections);
    }
  }, [initialConnections, onUpdateConnections]);

  const removeConnection = useCallback((connectionId: string) => {
    const updatedConnections = initialConnections.filter(conn => conn.id !== connectionId);
    if (onUpdateConnections) {
      onUpdateConnections(updatedConnections);
    }
  }, [initialConnections, onUpdateConnections]);

  const clearCanvas = useCallback(() => {
    console.log('Clearing canvas in CanvasStateManager');
    const emptyNodes: CanvasNodeData[] = [];
    
    // Use the callback instead of setNodes
    if (onUpdateNodes) {
      onUpdateNodes(emptyNodes);
    }
    
    const emptyConnections: Connection[] = [];
    if (onUpdateConnections) {
      onUpdateConnections(emptyConnections);
    }
    
    setState(prev => ({
      ...prev,
      selectedNodeId: null
    }));
  }, [onUpdateNodes, onUpdateConnections]);

  const resetView = useCallback(() => {
    console.log('Resetting canvas view');
    // Call the store's resetView action
    storeResetView();
    // Update local state
    setState(prev => ({
      ...prev,
      scale: 1,
      offset: { x: 0, y: 0 }
    }));
  }, [storeResetView]);

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
    // Prevent concurrent processing
    if (processingRef.current) {
      console.log('Already processing stage data, skipping...');
      return;
    }
    
    console.log('Processing stage data in CanvasStateManager:', Object.keys(stageData));

    // Prevent concurrent processing
    if (processingRef.current) {
      console.log('Already processing stage data, skipping...');
      return;
    }

    processingRef.current = true;
    
    const processorState: ProcessorState = {
      nodes: nodesRef.current,
      lastProcessedData: lastProcessedStageData || {}
    };
    
    console.log('Calling CanvasDataProcessor with:', {
      stageDataKeys: Object.keys(stageData),
      nodeCount: nodesRef.current.length
    });

    CanvasDataProcessor.updateCanvasFromStageData(
      stageData,
      processorState,
      (newState: ProcessorState) => {
        console.log('CanvasDataProcessor callback with:', {
          newNodeCount: newState.nodes.length
        });
        updateNodes(newState.nodes); 
        setLastProcessedStageData(newState.lastProcessedData || {});
        console.log('Canvas data processed, node count:', newState.nodes.length);
        
        // Reset processing flag
        processingRef.current = false;
        }, [lastProcessedStageData, updateNodes, nodesRef]    );
  }
  )

  return {
    state,
    nodes: initialNodes,
    connections: initialConnections,
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