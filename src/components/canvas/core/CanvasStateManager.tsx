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
  scale: .55,
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
  
  // Get resetView action from the store
  const storeResetView = useAppStore(state => state.resetView);
  
  const updateState = useCallback((updates: Partial<CanvasState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNodes = useCallback((updatedNodes: CanvasNodeData[]) => {
    // Update nodes through the callback
    if (onUpdateNodes) {
      console.log('Nodes changed, updating...');
      onUpdateNodes(updatedNodes);
    }
  }, [onUpdateNodes]);

  const updateConnections = useCallback((updatedConnections: Connection[]) => {
    // Update connections through the callback
    if (onUpdateConnections) {
      console.log('Connections changed, updating...');
      onUpdateConnections(updatedConnections);
    }
  }, [onUpdateConnections]);

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

  const processStageData = useCallback(async (stageData: any) => {
    // Prevent concurrent processing
    if (processingRef.current) {
      console.log('Already processing stage data, skipping...');
      return;
    }

    console.log('Processing stage data in CanvasStateManager:', Object.keys(stageData));

    processingRef.current = true;
    
    try {
      // Get current stage ID from the app store
      const { useAppStore } = await import('../../../store/useAppStore');
      const currentStageId = useAppStore.getState().currentStageId;
      
      console.log('Calling CanvasDataProcessor with:', {
        currentStageId,
        stageDataKeys: Object.keys(stageData),
        nodeCount: initialNodes.length
      });

      // Get stage-specific data
      const stageSpecificData = stageData[currentStageId];
      
      if (!stageSpecificData) {
        console.log('No data for current stage:', currentStageId);
        processingRef.current = false;
        return;
      }

      const result = CanvasDataProcessor.updateCanvasFromStageData(
        initialNodes,
        initialConnections,
        currentStageId,
        stageSpecificData,
        lastProcessedStageData
      );
      
      console.log('CanvasDataProcessor result:', {
        newNodeCount: result.nodes.length
      });
      
      updateNodes(result.nodes); 
      setLastProcessedStageData(result.lastProcessedData || {});
      console.log('Canvas data processed, node count:', result.nodes.length);
    } catch (error) {
      console.error('Error in processStageData:', error);
    } finally {
      // Reset processing flag
      processingRef.current = false;
    }
  }, [lastProcessedStageData, updateNodes, initialNodes]);

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