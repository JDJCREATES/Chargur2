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
 */

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  Panel,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  NodeTypes,
  useReactFlow,
  MarkerType,
  ConnectionLineType,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { CanvasToolbar } from './CanvasToolbar';
import { useCanvasScreenshot } from './core/CanvasScreenshot';
import { v4 as uuidv4 } from 'uuid';
import * as nodeFactory from '../../lib/canvas/nodeFactory';
import { STAGE1_NODE_TYPES, STAGE2_NODE_TYPES } from '../../lib/canvas/nodeFactory';
import { 
  getEdgeStyle, 
  generateConnectionLabel, 
  connectionExists, 
  getUniqueEdgeId,
  updateNodesWithConnection,
  cleanupNodeConnections,
  createEdge
} from '../../lib/canvas/connectionUtilities';
import { nodeTypes } from './nodes';
import { CanvasExportModal } from './CanvasExportModal';

// Import processors directly
import { processIdeationData } from '../../lib/canvas/processors/ideationProcessor';
import { processFeatureData } from '../../lib/canvas/processors/featureProcessor';
import { processStructureData } from '../../lib/canvas/processors/structureProcessor';
import { processInterfaceData } from '../../lib/canvas/processors/interfaceProcessor';
import { processArchitectureData } from '../../lib/canvas/processors/architectureProcessor';
import { processAuthData } from '../../lib/canvas/processors/authProcessor';

// Update the props interface to make callbacks optional
interface SpatialCanvasProps {
  currentStage?: any;
  stageData: any;
  projectId: string | null;
  canvasNodes?: Node[];
  canvasConnections?: Edge[];
  onUpdateCanvasNodes?: (nodes: Node[]) => void;
  onUpdateCanvasConnections?: (connections: Edge[]) => void;
  onAddLofiLayoutNode?: () => void;
  onSendMessage: (message: string) => void;
}

// In the component, use store methods when callbacks aren't provided
export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  stageData,
  projectId,
  canvasNodes = [],
  canvasConnections = [],
  onUpdateCanvasNodes,
  onUpdateCanvasConnections,
  onAddLofiLayoutNode,
  onSendMessage
}) => {
  // Make sure these refs are properly initialized
  const lastProcessedStageDataRef = useRef<string>('');
  const processingRef = useRef(false);
  
  // Get canvas data and actions from the store
  const { 
    canvasNodes: storeCanvasNodes, 
    canvasConnections: storeCanvasConnections, 
    updateCanvasNodes, 
    updateCanvasConnections,
    currentStageId
  } = useAppStore();

  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Get screenshot functionality
  const { takeScreenshot, canvasRef } = useCanvasScreenshot();

  // Get the ReactFlow instance
  const reactFlowInstance = useReactFlow();
  
  // Get updateStageData and other methods from the store
  const { updateStageData } = useAppStore();


  // Use store data as fallback when props aren't provided - MEMOIZED
  const effectiveNodes = useMemo(() => 
    canvasNodes.length > 0 ? canvasNodes : storeCanvasNodes,
    [canvasNodes, storeCanvasNodes]
  );

  const effectiveEdges = useMemo(() => 
    canvasConnections.length > 0 ? canvasConnections : storeCanvasConnections,
    [canvasConnections, storeCanvasConnections]
  );
  
  // Use store methods as fallback
  const handleUpdateNodes = onUpdateCanvasNodes || updateCanvasNodes;
  const handleUpdateConnections = onUpdateCanvasConnections || updateCanvasConnections;

  // SEPARATE: Node position/interaction updates (should NOT trigger stageData processing)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, effectiveNodes);
    handleUpdateNodes(newNodes); // This saves positions but doesn't process stageData
  }, [effectiveNodes, handleUpdateNodes]);

  // Handle edge changes - apply changes and update store directly
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const newEdges = applyEdgeChanges(changes, effectiveEdges);
    handleUpdateConnections(newEdges);
  }, [effectiveEdges, handleUpdateConnections]);

  const onConnect = useCallback((params: any) => {
    // Check if connection already exists
    if (connectionExists(effectiveEdges, params.source, params.target)) {
      return;
    }
    
    // Find source and target nodes
    const sourceNode = effectiveNodes.find(node => node.id === params.source);
    const targetNode = effectiveNodes.find(node => node.id === params.target);
    
    // Create edge with appropriate style and label
    const newEdge = createEdge(params.source, params.target, sourceNode, targetNode);
    
    // Add the edge
    const newEdges = addEdge(newEdge, effectiveEdges);
    
    // Update nodes with connection data
    const updatedNodes = updateNodesWithConnection(effectiveNodes, params.source, params.target);
    
    // Update both nodes and edges
    handleUpdateNodes(updatedNodes);
    handleUpdateConnections(newEdges);
  }, [effectiveEdges, handleUpdateConnections]);


  // SEPARATE: StageData processing (should ONLY happen on AI responses)
  // Re-enable the stageData processing useEffect

  // Re-enable the stageData processing useEffect
  useEffect(() => {
  
    const stageDataString = JSON.stringify(stageData);
    
    if (lastProcessedStageDataRef.current === stageDataString) { 
      return;
    }

    if (processingRef.current) {
      return;
    }

    processingRef.current = true;

    try {
      const currentStageId = useAppStore.getState().currentStageId;
      const currentState = useAppStore.getState();
      
      // Get current nodes/edges from store at processing time, not from dependencies
      const currentNodes = currentState.canvasNodes;
      const currentEdges = currentState.canvasConnections;
      
      const stageSpecificData = stageData[currentStageId];
      
      if (!stageSpecificData || Object.keys(stageSpecificData).length === 0) {
       /* console.log(`SpatialCanvas: No stage-specific data for ${currentStageId} or it's empty. Skipping processing.`);*/
        processingRef.current = false;
        return;
      }

     /* console.log(`SpatialCanvas: Processing stage data for ${currentStageId}. Current nodes count: ${currentNodes.length}. Stage data keys: ${Object.keys(stageSpecificData).join(', ')}`);*/
      // Process nodes...
      let processedNodes: Node[] = [];
      
      switch (currentStageId) {
        case 'ideation-discovery':
          processedNodes = processIdeationData(currentNodes, stageSpecificData, {});
          break;
        case 'feature-planning':
          processedNodes = processFeatureData(currentNodes, stageSpecificData, {});
          break;
        case 'structure-flow':
          processedNodes = processStructureData(currentNodes, stageSpecificData, {});
          break;
        case 'architecture-design':
          processedNodes = processArchitectureData(currentNodes, stageSpecificData, {});
          break;
        case 'interface-interaction':
          processedNodes = processInterfaceData(currentNodes, stageSpecificData, {});
          break;
        case 'user-auth-flow':
          processedNodes = processAuthData(currentNodes, stageSpecificData, {});
          break;
        default:
          processedNodes = currentNodes;
      }
      
      // Add callbacks to nodes
      const nodesWithCallbacks = processedNodes.map(node => ({
        ...node,
        data: {
          ...(node.data || {}),
          onNodeUpdate: (id: string, updates: any) => {
            const node = processedNodes.find(n => n.id === id);
            if (!node) return;
            
            // Special handling for nodes that need to update stage data
            if (node.type === 'branding') {
              // Update the interface-interaction stage data with the branding information
              updateStageData('interface-interaction', { 
                customBranding: {
                  primaryColor: updates.primaryColor || node.data.primaryColor,
                  secondaryColor: updates.secondaryColor || node.data.secondaryColor,
                  accentColor: updates.accentColor || node.data.accentColor,
                  fontFamily: updates.fontFamily || node.data.fontFamily,
                  bodyFont: updates.bodyFont || node.data.bodyFont,
                  borderRadius: updates.borderRadius || node.data.borderRadius
                },
                selectedDesignSystem: updates.designSystem || node.data.designSystem
              });
              console.log('Updated branding data in stage data:', updates);
            } else if (node.type === 'appName' && updates.value !== undefined) {
              // Update ideation-discovery stage data with app name
              updateStageData('ideation-discovery', { appName: updates.value });
            } else if (node.type === 'tagline' && updates.value !== undefined) {
              // Update ideation-discovery stage data with tagline
              updateStageData('ideation-discovery', { tagline: updates.value });
            } else if (node.type === 'coreProblem' && updates.value !== undefined) {
              // Update ideation-discovery stage data with problem statement
              updateStageData('ideation-discovery', { problemStatement: updates.value });
            } else if (node.type === 'mission' && (updates.value !== undefined || updates.missionStatement !== undefined)) {
              // Update ideation-discovery stage data with mission
              const updateData: any = {};
              if (updates.value !== undefined) updateData.appIdea = updates.value;
              if (updates.missionStatement !== undefined) updateData.missionStatement = updates.missionStatement;
              updateStageData('ideation-discovery', updateData);
            } else if (node.type === 'valueProp' && updates.value !== undefined) {
              // Update ideation-discovery stage data with value proposition
              updateStageData('ideation-discovery', { valueProposition: updates.value });
            }
            
            // Update the node in the canvas
            const updatedNodes = processedNodes.map(n => 
              n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
            );
            handleUpdateNodes(updatedNodes);
          },
          onNodeDelete: (id: string) => {
            // Use the cleanupNodeConnections utility
            const { updatedNodes, updatedEdges } = cleanupNodeConnections(
              processedNodes,
              effectiveEdges,
              id
            );
            
            handleUpdateNodes(updatedNodes);
            handleUpdateConnections(updatedEdges);
          },
          onStartConnection: (id: string) => {
            console.log('Start connection from', id);
          },
          onSendMessage
        }
      }));
      
      console.log('SpatialCanvas: Calling handleUpdateNodes with new nodes. Count:', nodesWithCallbacks.length);
      handleUpdateNodes(nodesWithCallbacks);
      lastProcessedStageDataRef.current = stageDataString;
      
    } catch (error) {
      console.error('Error processing stage data:', error);
    } finally {
      processingRef.current = false;
    }
  }, [stageData, onSendMessage]); // ONLY stageData and onSendMessage - no node/edge dependencies!
 
  // Reset view when canvas nodes change significantly (indicating project change)
  useEffect(() => {
    if (!projectId) {
      return;
    }
    
    // Reset processing state when project changes
    processingRef.current = false;
    lastProcessedStageDataRef.current = '';
    
    // Use ReactFlow's fitView to reset the view
    setTimeout(() => {
      reactFlowInstance.fitView();
    }, 100);
  }, [projectId, reactFlowInstance]);

  const handleAddNode = useCallback((type: string) => {
    // Check if it's a custom ideation node type
    if (Object.values(STAGE1_NODE_TYPES).includes(type as any)) {
      // For singleton nodes, check if they already exist
      if (type === 'appName' || type === 'tagline' || type === 'coreProblem' || 
          type === 'mission' || type === 'valueProp') {
        // Check if this singleton node already exists          
        const existingNode = effectiveNodes.find(node => node.id === type);
        if (existingNode) {
          // Select the existing node instead of creating a new one
          setSelectedNodeId(existingNode.id);
          return;
        }
      }
      
      // Create the appropriate custom node
      let newNode: Node;

      // Use the nodeFactory to create the appropriate node type
      switch(type) {
        case 'appName':
          newNode = nodeFactory.createAppNameNode('', effectiveNodes);
          break;
        case 'tagline':
          newNode = nodeFactory.createTaglineNode('', effectiveNodes);
          break;
        case 'coreProblem':
          newNode = nodeFactory.createCoreProblemNode('', effectiveNodes);
          break;
        case 'mission':
          newNode = nodeFactory.createMissionNode('', '', effectiveNodes);
          break;
        case 'valueProp':
          newNode = nodeFactory.createValuePropNode('', effectiveNodes);
          break;
        case 'platform':
          newNode = nodeFactory.createPlatformNode('web', effectiveNodes);
          break;
        case 'techStack':
          newNode = nodeFactory.createTechStackNode([], effectiveNodes);
          break;
        case 'uiStyle':
          newNode = nodeFactory.createUIStyleNode('clean-minimal', effectiveNodes);
          break;
        case 'feature':
          newNode = {
            id: uuidv4(),
            type: 'feature',
            position: { x: 300, y: 300 },
            data: {
              title: 'New Feature',
              content: 'Describe this feature...',
              size: { width: 300, height: 200 },
              color: 'blue',
              connections: [],
              metadata: { 
                stage: 'feature-planning',
                priority: 'should',
                complexity: 'medium',
                category: 'both'
              },
              subFeatures: [],
              showBreakdown: false,
              resizable: true
            }
          };
          break;
        default:
          // Default node creation for other types
          newNode = {
            id: `${type}-${Date.now()}`,
            type: 'default',
            position: { x: 300, y: 300 },
            data: {
              type,
              title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
              content: 'Click edit to add content...',
              color: type,
              connections: [],
              metadata: { stage: currentStageId, nodeType: type },
              resizable: true
            }
          };
      }
      
      // Add common callback functions to the node data
      newNode.data = {
        ...newNode.data,
        onNodeUpdate: (id: string, updates: any) => {
          const node = effectiveNodes.find(n => n.id === id);
          if (!node) return;
          
          // Special handling for nodes that need to update stage data
          if (node.type === 'branding') {
            // Update the interface-interaction stage data with the branding information
            updateStageData('interface-interaction', { 
              customBranding: {
                primaryColor: updates.primaryColor || node.data.primaryColor,
                secondaryColor: updates.secondaryColor || node.data.secondaryColor,
                accentColor: updates.accentColor || node.data.accentColor,
                fontFamily: updates.fontFamily || node.data.fontFamily,
                bodyFont: updates.bodyFont || node.data.bodyFont,
                borderRadius: updates.borderRadius || node.data.borderRadius
              },
              selectedDesignSystem: updates.designSystem || node.data.designSystem
            });
            console.log('Updated branding data in stage data:', updates);
          } else if (node.type === 'appName' && updates.value !== undefined) {
            // Update ideation-discovery stage data with app name
            updateStageData('ideation-discovery', { appName: updates.value });
          } else if (node.type === 'tagline' && updates.value !== undefined) {
            // Update ideation-discovery stage data with tagline
            updateStageData('ideation-discovery', { tagline: updates.value });
          } else if (node.type === 'coreProblem' && updates.value !== undefined) {
            // Update ideation-discovery stage data with problem statement
            updateStageData('ideation-discovery', { problemStatement: updates.value });
          } else if (node.type === 'mission' && (updates.value !== undefined || updates.missionStatement !== undefined)) {
            // Update ideation-discovery stage data with mission
            const updateData: any = {};
            if (updates.value !== undefined) updateData.appIdea = updates.value;
            if (updates.missionStatement !== undefined) updateData.missionStatement = updates.missionStatement;
            updateStageData('ideation-discovery', updateData);
          } else if (node.type === 'valueProp' && updates.value !== undefined) {
            // Update ideation-discovery stage data with value proposition
            updateStageData('ideation-discovery', { valueProposition: updates.value });
          }
          
          // Update the node in the canvas
          const updatedNodes = effectiveNodes.map(n => 
            n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
          );
          handleUpdateNodes(updatedNodes);
        },
        onNodeDelete: (id: string) => {
          const filteredNodes = effectiveNodes.filter(node => node.id !== id);
          const filteredEdges = effectiveEdges.filter(edge => 
            edge.source !== id && edge.target !== id
          );
          handleUpdateNodes(filteredNodes);
          handleUpdateConnections(filteredEdges);
        },
        onStartConnection: (id: string) => {
         
          // Implement connection logic
        },
        onSendMessage: onSendMessage
      };
      
      const newNodes = [...effectiveNodes, newNode];
      handleUpdateNodes(newNodes);
      setSelectedNodeId(newNode.id);
    } else if (type === 'lofiLayout') {
      // Create a new lofi layout node
      const newNode = nodeFactory.createLofiLayoutNode({}, effectiveNodes);
      
      // Add common callback functions to the node data
      newNode.data = {
        ...newNode.data,
        onNodeUpdate: (id: string, updates: any) => {
          const updatedNodes = effectiveNodes.map(node => node.id === id 
            ? { ...node, data: { ...(node.data || {}), ...updates } } 
            : node
          );
          handleUpdateNodes(updatedNodes);
        },
        onNodeDelete: (id: string) => {
          // Use the cleanupNodeConnections utility
          const { updatedNodes, updatedEdges } = cleanupNodeConnections(
            effectiveNodes,
            effectiveEdges,
            id
          );
          
          handleUpdateNodes(updatedNodes);
          handleUpdateConnections(updatedEdges);
        },
        onStartConnection: (id: string) => {
          // Implement connection logic
        },
        onSendMessage
      };
      
      const newNodes = [...effectiveNodes, newNode];
      handleUpdateNodes(newNodes);
      setSelectedNodeId(newNode.id);
    } else {
      // Default node creation for other types
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position: { x: 300, y: 300 },
        data: {
          type,
          title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          content: 'Click edit to add content...',
          color: type,
          connections: [],
          metadata: { stage: currentStageId, nodeType: type },
          resizable: true,
          onNodeUpdate: (id: string, updates: any) => {
            const updatedNodes = effectiveNodes.map(node => node.id === id 
              ? { ...node, data: { ...(node.data || {}), ...updates } } 
              : node
            );
            handleUpdateNodes(updatedNodes);
          },
          onNodeDelete: (id: string) => {
            // Use the cleanupNodeConnections utility
            const { updatedNodes, updatedEdges } = cleanupNodeConnections(
              effectiveNodes,
              effectiveEdges,
              id
            );
            
            handleUpdateNodes(updatedNodes);
            handleUpdateConnections(updatedEdges);
          },
          onAddLofiLayoutNode: () => handleAddNode('lofiLayout'),
          onStartConnection: (id: string) => {
        
          },
          onSendMessage
        }
      };
      
      const newNodes = [...effectiveNodes, newNode];
      handleUpdateNodes(newNodes);
      setSelectedNodeId(newNode.id);
    }
  }, [effectiveNodes, effectiveEdges, handleUpdateNodes, handleUpdateConnections, currentStageId, onSendMessage, updateStageData]);

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      
      try {
        handleUpdateNodes([]);
        handleUpdateConnections([]);
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    }
  }, [handleUpdateNodes, handleUpdateConnections]);

  const handleAutoLayout = useCallback(() => {
    // Simple force-directed layout
    try {
      const nodesByType = effectiveNodes.reduce<Record<string, Node[]>>((acc, node) => {
        if (!node) return acc;
        const type = node.type || 'unknown'; 
        if (!acc[type]) acc[type] = [];
        acc[type].push(node);
        return acc;
      }, {});
  
      let x = 100;
      const typeSpacing = 300;
      const nodeSpacing = 120;

      const updatedNodes = [...effectiveNodes];
  
      Object.entries(nodesByType).forEach(([type, typeNodes]) => {
        let y = 100;
        typeNodes.forEach((node) => {
          const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: { x, y }
            };
          }
          y += nodeSpacing;
        });
        x += typeSpacing;
      });

      handleUpdateNodes(updatedNodes);
    } catch (error) {
      console.error('Error in auto layout:', error);
    }
  }, [effectiveNodes, handleUpdateNodes]);

  // Save canvas state
  const handleSave = useCallback(() => {
    // Canvas is already auto-saved via onUpdateCanvasNodes/onUpdateCanvasConnections
    console.log('Canvas saved manually');
    
    // Use a simpler notification approach to avoid DOM manipulation
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md z-50';
    notification.textContent = 'Canvas saved successfully';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const exportData = {
        nodes: effectiveNodes,
        edges: effectiveEdges,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          nodeCount: effectiveNodes.length,
          edgeCount: effectiveEdges.length
        }
      };
      console.log('Exporting canvas data');
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'canvas-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting canvas data:', error);
    }
  }, [effectiveNodes, effectiveEdges]);

  const handleScreenshot = useCallback(() => {
    // Get the React Flow wrapper element
    const reactFlowWrapper = document.querySelector('.react-flow');
    
    if (reactFlowWrapper) {
      takeScreenshot({ current: reactFlowWrapper as HTMLDivElement });
    }
  }, [takeScreenshot]);

  const handleExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
      {/* Canvas Toolbar */}
      <CanvasToolbar
        onAddNode={handleAddNode}
        onZoomIn={() => reactFlowInstance.zoomIn()}
        onZoomOut={() => reactFlowInstance.zoomOut()}
        onResetView={() => reactFlowInstance.fitView()}
        onSave={handleSave}
        onExport={handleExport}
        onToggleGrid={() => setShowGrid(!showGrid)} 
        onScreenshot={handleScreenshot}
        onAutoLayout={handleAutoLayout}
        onClearCanvas={handleClearCanvas}
        showGrid={showGrid}
        scale={reactFlowInstance.getZoom()}
        isCollapsed={isToolbarCollapsed}
        onToggleCollapse={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
      />

      {/* Main Canvas Area */}
      <div className="w-full h-full">
        <ReactFlow
          nodes={effectiveNodes}
          edges={effectiveEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          onNodeDragStop={(_, node) => {
            // Update node position in the canvas
            const updatedNodes = effectiveNodes.map(n => 
              n.id === node.id ? { ...n, position: node.position } : n
            );
            handleUpdateNodes(updatedNodes);
          }}
          deleteKeyCode="Delete"
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          proOptions={{ hideAttribution: true }}
          connectionLineStyle={{ stroke: '#9CA3AF', strokeWidth: 2 }}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#9CA3AF', strokeWidth: 2 },
            markerEnd: { type: MarkerType.Arrow },
            labelStyle: { fill: '#6b7280', fontWeight: 500, fontSize: 12 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8, rx: 4, ry: 4 }
          }}
        >
          <Background color="#e5e7eb" gap={20} size={1} variant={showGrid ? BackgroundVariant.Dots : undefined} />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'appName': return '#3b82f6';
                case 'tagline': return '#8b5cf6';
                case 'coreProblem': return '#f97316';
                case 'mission': return '#10b981';
                case 'userPersona': return '#3b82f6';
                case 'valueProp': return '#10b981';
                case 'competitor': return '#ef4444';
                case 'feature': return '#3b82f6';
                default: return '#9ca3af';
              }
            }}
            maskColor="rgba(240, 240, 240, 0.6)"
          />
          
          {/* Canvas Info */}
          <Panel position="bottom-right">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600">
              <div>Nodes: {effectiveNodes.length}</div>
              <div>Connections: {effectiveEdges.length}</div>
              <div>Zoom: {Math.round(reactFlowInstance.getZoom() * 100)}%</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
      
      {/* Export Modal */}
      <CanvasExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportPNG={handleScreenshot}
      />
    </div>
  );
};