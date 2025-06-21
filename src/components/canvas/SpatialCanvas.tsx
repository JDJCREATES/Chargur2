import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CanvasNode, CanvasNodeData } from './CanvasNode';
import { CanvasConnection } from './CanvasConnection';
import { CanvasToolbar } from './CanvasToolbar';
import { Stage, StageData } from '../../types';

interface SpatialCanvasProps {
  currentStage?: Stage;
  stageData: StageData;
  onSendMessage: (message: string) => void;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'dependency' | 'flow' | 'reference';
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  currentStage,
  stageData,
  onSendMessage,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CanvasNodeData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Initialize canvas with data from stages
  useEffect(() => {
    generateNodesFromStageData();
  }, [stageData]);

  const generateNodesFromStageData = () => {
    const newNodes: CanvasNodeData[] = [];
    let nodeId = 1;

    // Generate concept cluster from ideation data
    const ideationData = stageData['ideation-discovery'];
    if (ideationData) {
      if (ideationData.appName) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: 'App Identity',
          content: `${ideationData.appName}\n${ideationData.tagline || ''}\n\n${ideationData.appIdea || ''}`,
          position: { x: 100, y: 100 },
          size: { width: 200, height: 120 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery' }
        });
      }

      if (ideationData.problemStatement) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: 'Problem Statement',
          content: ideationData.problemStatement,
          position: { x: 320, y: 100 },
          size: { width: 180, height: 100 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery' }
        });
      }

      if (ideationData.targetUsers) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: 'Target Users',
          content: ideationData.targetUsers,
          position: { x: 100, y: 240 },
          size: { width: 180, height: 80 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery' }
        });
      }
    }

    // Generate feature cluster
    const featureData = stageData['feature-planning'];
    if (featureData) {
      let featureY = 100;
      
      if (featureData.selectedFeaturePacks) {
        featureData.selectedFeaturePacks.forEach((pack: string) => {
          newNodes.push({
            id: `feature-${nodeId++}`,
            type: 'feature',
            title: `${pack.charAt(0).toUpperCase() + pack.slice(1)} Pack`,
            content: `Feature pack: ${pack}`,
            position: { x: 600, y: featureY },
            size: { width: 160, height: 80 },
            color: 'blue',
            connections: [],
            metadata: { stage: 'feature-planning', pack }
          });
          featureY += 100;
        });
      }

      if (featureData.customFeatures) {
        featureData.customFeatures.forEach((feature: any) => {
          newNodes.push({
            id: `feature-${nodeId++}`,
            type: 'feature',
            title: feature.name,
            content: `${feature.description}\nPriority: ${feature.priority}\nComplexity: ${feature.complexity}`,
            position: { x: 600, y: featureY },
            size: { width: 160, height: 100 },
            color: 'blue',
            connections: [],
            metadata: { stage: 'feature-planning', custom: true }
          });
          featureY += 120;
        });
      }
    }

    // Generate UX flow cluster
    const structureData = stageData['structure-flow'];
    if (structureData) {
      let flowY = 100;
      
      if (structureData.screens) {
        structureData.screens.forEach((screen: any) => {
          newNodes.push({
            id: `ux-flow-${nodeId++}`,
            type: 'ux-flow',
            title: screen.name,
            content: `Screen type: ${screen.type}`,
            position: { x: 900, y: flowY },
            size: { width: 140, height: 80 },
            color: 'green',
            connections: [],
            metadata: { stage: 'structure-flow', screenType: screen.type }
          });
          flowY += 100;
        });
      }

      if (structureData.userFlows) {
        structureData.userFlows.forEach((flow: any) => {
          newNodes.push({
            id: `ux-flow-${nodeId++}`,
            type: 'ux-flow',
            title: flow.name,
            content: `Steps: ${flow.steps.join(' → ')}`,
            position: { x: 1100, y: flowY },
            size: { width: 200, height: 100 },
            color: 'green',
            connections: [],
            metadata: { stage: 'structure-flow', flowType: 'user-journey' }
          });
          flowY += 120;
        });
      }
    }

    // Generate system cluster
    const architectureData = stageData['architecture-design'];
    if (architectureData) {
      let systemY = 400;
      
      if (architectureData.databaseSchema) {
        architectureData.databaseSchema.forEach((table: any) => {
          newNodes.push({
            id: `system-${nodeId++}`,
            type: 'system',
            title: `${table.name} Table`,
            content: `Fields: ${table.fields?.map((f: any) => f.name).join(', ') || 'No fields defined'}`,
            position: { x: 100, y: systemY },
            size: { width: 180, height: 100 },
            color: 'red',
            connections: [],
            metadata: { stage: 'architecture-design', tableType: 'database' }
          });
          systemY += 120;
        });
      }

      if (architectureData.apiEndpoints) {
        newNodes.push({
          id: `system-${nodeId++}`,
          type: 'system',
          title: 'API Endpoints',
          content: `${architectureData.apiEndpoints.length} endpoints defined`,
          position: { x: 300, y: 400 },
          size: { width: 160, height: 80 },
          color: 'red',
          connections: [],
          metadata: { stage: 'architecture-design', systemType: 'api' }
        });
      }
    }

    // Add AI agent output node if there's significant data
    if (newNodes.length > 0) {
      newNodes.push({
        id: `agent-output-${nodeId++}`,
        type: 'agent-output',
        title: 'AI Analysis',
        content: `Project has ${newNodes.length} components defined. Ready for next phase of development.`,
        position: { x: 500, y: 400 },
        size: { width: 200, height: 100 },
        color: 'gray',
        connections: [],
        metadata: { generated: true, timestamp: new Date().toISOString() }
      });
    }

    setNodes(newNodes);
  };

  const addNode = useCallback((type: CanvasNodeData['type']) => {
    const newNode: CanvasNodeData = {
      id: `${type}-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: 'Click edit to add content...',
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 200 
      },
      size: { width: 180, height: 100 },
      color: type,
      connections: [],
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNodeData>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const startConnection = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId);
  }, []);

  const endConnection = useCallback((nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const newConnection: Connection = {
        id: `${connectingFrom}-${nodeId}`,
        from: connectingFrom,
        to: nodeId,
        type: 'reference',
      };
      setConnections(prev => [...prev, newConnection]);
      
      // Update node connections
      updateNode(connectingFrom, {
        connections: [...(nodes.find(n => n.id === connectingFrom)?.connections || []), nodeId]
      });
    }
    setConnectingFrom(null);
  }, [connectingFrom, nodes, updateNode]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null);
      setConnectingFrom(null);
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.metaKey)) { // Middle mouse or Cmd+click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const autoLayout = useCallback(() => {
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

  const getConnectionPath = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;
    
    return {
      from: {
        x: fromNode.position.x + fromNode.size.width / 2,
        y: fromNode.position.y + fromNode.size.height / 2,
      },
      to: {
        x: toNode.position.x + toNode.size.width / 2,
        y: toNode.position.y + toNode.size.height / 2,
      },
    };
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      <CanvasToolbar
        onAddNode={addNode}
        onZoomIn={() => setScale(prev => Math.min(3, prev * 1.2))}
        onZoomOut={() => setScale(prev => Math.max(0.1, prev * 0.8))}
        onResetView={() => {
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }}
        onSave={() => console.log('Save canvas')}
        onExport={() => console.log('Export canvas')}
        onToggleGrid={() => setShowGrid(prev => !prev)}
        onAutoLayout={autoLayout}
        showGrid={showGrid}
        scale={scale}
      />

      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage: showGrid 
            ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
            : undefined,
          backgroundSize: showGrid ? `${20 * scale}px ${20 * scale}px` : undefined,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transformOrigin: '0 0',
          }}
        >
          {/* Render connections */}
          {connections.map((connection) => {
            const path = getConnectionPath(connection);
            if (!path) return null;
            
            return (
              <CanvasConnection
                key={connection.id}
                from={path.from}
                to={path.to}
                style={connection.type === 'dependency' ? 'dashed' : 'solid'}
                animated={connection.type === 'flow'}
              />
            );
          })}

          {/* Render nodes */}
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isConnecting={connectingFrom !== null}
              onSelect={setSelectedNodeId}
              onUpdate={updateNode}
              onDelete={deleteNode}
              onStartConnection={startConnection}
              onEndConnection={endConnection}
              scale={scale}
            />
          ))}

          {/* Connection preview */}
          {connectingFrom && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="text-center mt-4 text-sm text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
                Click another node to create connection
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600">
        <div>Nodes: {nodes.length}</div>
        <div>Connections: {connections.length}</div>
        <div>Zoom: {Math.round(scale * 100)}%</div>
      </div>
    </div>
  );
};