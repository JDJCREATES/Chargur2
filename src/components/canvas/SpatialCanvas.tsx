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
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);

  // Initialize canvas with data from stages
  useEffect(() => {
    generateNodesFromStageData();
  }, [stageData, currentStage]);

  const generateNodesFromStageData = () => {
    const newNodes: CanvasNodeData[] = [];
    let nodeId = 1;
    let xOffset = 100;
    let yOffset = 100;

    // Generate concept cluster from ideation data
    const ideationData = stageData['ideation-discovery'];
    if (ideationData) {
      if (ideationData.appName || ideationData.appIdea) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: ideationData.appName || 'App Concept',
          content: `${ideationData.tagline || 'No tagline yet'}\n\n${ideationData.appIdea || 'App idea in development...'}`,
          position: { x: xOffset, y: yOffset },
          size: { width: 220, height: 140 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery' }
        });
        xOffset += 250;
      }

      if (ideationData.problemStatement) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: 'Problem Statement',
          content: ideationData.problemStatement,
          position: { x: xOffset, y: yOffset },
          size: { width: 200, height: 120 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery' }
        });
        xOffset += 230;
      }

      if (ideationData.targetUsers) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: 'Target Users',
          content: ideationData.targetUsers,
          position: { x: 100, y: yOffset + 160 },
          size: { width: 200, height: 100 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery' }
        });
      }

      if (ideationData.valueProposition) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: 'Value Proposition',
          content: ideationData.valueProposition,
          position: { x: 320, y: yOffset + 160 },
          size: { width: 200, height: 100 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery' }
        });
      }

      // Add selected tags as concept nodes
      if (ideationData.keyFeatures && ideationData.keyFeatures.length > 0) {
        newNodes.push({
          id: `concept-${nodeId++}`,
          type: 'concept',
          title: 'Key Features',
          content: ideationData.keyFeatures.join('\n• '),
          position: { x: 540, y: yOffset + 160 },
          size: { width: 180, height: 120 },
          color: 'yellow',
          connections: [],
          metadata: { stage: 'ideation-discovery', type: 'features' }
        });
      }
    }

    // Generate feature cluster
    const featureData = stageData['feature-planning'];
    if (featureData) {
      let featureX = 100;
      let featureY = 350;
      
      if (featureData.selectedFeaturePacks) {
        featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
          const packNames: { [key: string]: string } = {
            'auth': 'Authentication & Users',
            'crud': 'Data Management',
            'social': 'Social Features',
            'communication': 'Communication',
            'commerce': 'E-commerce',
            'analytics': 'Analytics & Reporting',
            'media': 'Media & Files',
            'ai': 'AI & Automation'
          };
          
          newNodes.push({
            id: `feature-${nodeId++}`,
            type: 'feature',
            title: packNames[pack] || pack.charAt(0).toUpperCase() + pack.slice(1),
            content: `Feature pack selected\nIncludes core ${pack} functionality`,
            position: { x: featureX + (index % 3) * 200, y: featureY + Math.floor(index / 3) * 120 },
            size: { width: 180, height: 100 },
            color: 'blue',
            connections: [],
            metadata: { stage: 'feature-planning', pack }
          });
        });
      }

      if (featureData.customFeatures) {
        const startIndex = featureData.selectedFeaturePacks?.length || 0;
        featureData.customFeatures.forEach((feature: any, index: number) => {
          newNodes.push({
            id: `feature-${nodeId++}`,
            type: 'feature',
            title: feature.name,
            content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`,
            position: { 
              x: featureX + ((startIndex + index) % 3) * 200, 
              y: featureY + Math.floor((startIndex + index) / 3) * 120 
            },
            size: { width: 180, height: 120 },
            color: 'blue',
            connections: [],
            metadata: { stage: 'feature-planning', custom: true }
          });
        });
      }

      // Add natural language features if provided
      if (featureData.naturalLanguageFeatures) {
        newNodes.push({
          id: `feature-${nodeId++}`,
          type: 'feature',
          title: 'Feature Description',
          content: featureData.naturalLanguageFeatures,
          position: { x: 700, y: 350 },
          size: { width: 220, height: 140 },
          color: 'blue',
          connections: [],
          metadata: { stage: 'feature-planning', type: 'description' }
        });
      }
    }

    // Generate UX flow cluster
    const structureData = stageData['structure-flow'];
    if (structureData) {
      let flowX = 100;
      let flowY = 600;
      
      if (structureData.screens) {
        structureData.screens.forEach((screen: any, index: number) => {
          newNodes.push({
            id: `ux-flow-${nodeId++}`,
            type: 'ux-flow',
            title: screen.name,
            content: `Screen type: ${screen.type}\n\n${screen.description || 'Core app screen'}`,
            position: { x: flowX + (index % 4) * 160, y: flowY },
            size: { width: 150, height: 100 },
            color: 'green',
            connections: [],
            metadata: { stage: 'structure-flow', screenType: screen.type }
          });
        });
      }

      if (structureData.userFlows) {
        structureData.userFlows.forEach((flow: any, index: number) => {
          newNodes.push({
            id: `ux-flow-${nodeId++}`,
            type: 'ux-flow',
            title: flow.name,
            content: `User journey:\n${flow.steps?.slice(0, 3).join(' → ') || 'Flow steps'}${flow.steps?.length > 3 ? '...' : ''}`,
            position: { x: flowX + (index % 3) * 220, y: flowY + 120 },
            size: { width: 200, height: 120 },
            color: 'green',
            connections: [],
            metadata: { stage: 'structure-flow', flowType: 'user-journey' }
          });
        });
      }
    }

    // Generate system cluster
    const architectureData = stageData['architecture-design'];
    if (architectureData) {
      let systemX = 100;
      let systemY = 800;
      
      if (architectureData.databaseSchema) {
        architectureData.databaseSchema.forEach((table: any, index: number) => {
          newNodes.push({
            id: `system-${nodeId++}`,
            type: 'system',
            title: `${table.name} Table`,
            content: `Database table\n\nFields:\n${table.fields?.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n') || 'No fields defined'}${table.fields?.length > 4 ? '\n...' : ''}`,
            position: { x: systemX + (index % 3) * 200, y: systemY },
            size: { width: 180, height: 100 },
            color: 'red',
            connections: [],
            metadata: { stage: 'architecture-design', tableType: 'database' }
          });
        });
      }

      if (architectureData.apiEndpoints) {
        newNodes.push({
          id: `system-${nodeId++}`,
          type: 'system',
          title: 'API Endpoints',
          content: `${architectureData.apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`,
          position: { x: systemX + 400, y: systemY },
          size: { width: 160, height: 80 },
          color: 'red',
          connections: [],
          metadata: { stage: 'architecture-design', systemType: 'api' }
        });
      }
    }

    // Add AI agent output node with dynamic content
    if (newNodes.length > 2) {
      const completedStages = Object.keys(stageData).length;
      const totalNodes = newNodes.length;
      
      newNodes.push({
        id: `agent-output-${nodeId++}`,
        type: 'agent-output',
        title: 'AI Analysis',
        content: `Project Analysis:\n\n• ${totalNodes} components mapped\n• ${completedStages} stages completed\n• Ready for ${completedStages < 3 ? 'more planning' : 'development'}`,
        position: { x: 750, y: 100 },
        size: { width: 200, height: 120 },
        color: 'gray',
        connections: [],
        metadata: { 
          generated: true, 
          timestamp: new Date().toISOString(),
          stagesCompleted: completedStages,
          totalNodes: totalNodes
        }
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
        x: Math.random() * 300 + 150, 
        y: Math.random() * 200 + 150 
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

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.metaKey || e.ctrlKey))) { // Middle mouse or Cmd/Ctrl+click
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleCanvasMouseUp = useCallback(() => {
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
    <div className="relative w-full h-96 overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
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
        isCollapsed={isToolbarCollapsed}
        onToggleCollapse={() => setIsToolbarCollapsed(prev => !prev)}
      />
      <div
        ref={canvasRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
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
          animate={{
            scale: scale,
            x: offset.x / scale,
            y: offset.y / scale,
          }}
          transition={{ type: "tween", duration: 0.1 }}
          style={{
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
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-30">
              <div className="text-sm text-blue-600 bg-blue-50 bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-200">
                Click another node to create connection
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600">
        <div>Nodes: {nodes.length}</div>
        <div>Connections: {connections.length}</div>
        <div>Zoom: {Math.round(scale * 100)}%</div>
      </div>
    </div>
  );
};