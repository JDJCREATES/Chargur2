/**
 * CanvasRenderer.tsx
 * 
 * Handles the visual rendering of the SpatialCanvas system.
 * Manages node rendering, connections, grid, and visual effects.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Renders all canvas nodes with proper positioning
 * - Draws connections between nodes
 * - Manages visual effects (grid, zoom, animations)
 * - Handles different node types and custom rendering
 * - Provides visual feedback for interactions
 * 
 * CRITICAL FUNCTIONALITY:
 * - Efficient rendering of large numbers of nodes
 * - Smooth animations and transitions
 * - Responsive design and scaling
 * - Custom node type rendering
 * - Connection path calculation and drawing
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CanvasNodeData } from '../CanvasNode';
import { DefaultCanvasNode } from '../DefaultCanvasNode';
import { DraggableConnectableWrapper } from '../DraggableConnectableWrapper';
import { CanvasConnection } from '../CanvasConnection';
import { 
  AppNameNode, 
  TaglineNode, 
  CoreProblemNode, 
  MissionNode, 
  UserPersonaNode, 
  ValuePropositionNode, 
  CompetitorNode, 
  TechStackNode,
  UIStyleNode,
  PlatformNode,
  STAGE1_NODE_TYPES 
} from '../customnodetypes/stage1nodes';

export interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'reference' | 'dependency' | 'flow';
}

interface CanvasRendererProps {
  nodes: CanvasNodeData[];
  connections: Connection[];
  selectedNodeId: string | null;
  connectingFrom: string | null;
  scale: number;
  offset: { x: number; y: number };
  showGrid: boolean;
  onNodeSelect: (nodeId: string) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionStart: (nodeId: string) => void;
  onConnectionEnd: (nodeId: string) => void;
  onSendMessage: (message: string) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  nodes,
  connections,
  selectedNodeId,
  connectingFrom,
  scale,
  offset,
  showGrid,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onConnectionStart,
  onConnectionEnd,
  onSendMessage
}) => {
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
    <div className="relative w-full h-full">
      {/* Grid Background */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${offset.x}px ${offset.y}px`,
          }}
        />
      )}

      {/* Canvas Content Container */}
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
        {/* Render Connections */}
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

        {/* Render Nodes */}
        {nodes.map((node) => {
          const isCustomIdeationNode = node.metadata?.stage === 'ideation-discovery' && 
                                      Object.values(STAGE1_NODE_TYPES).includes(node.type as any);

          return (
            <DraggableConnectableWrapper
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isConnecting={connectingFrom !== null}
              onSelect={onNodeSelect}
              onUpdate={onNodeUpdate}
              onDelete={onNodeDelete}
              onStartConnection={onConnectionStart}
              onEndConnection={onConnectionEnd}
              scale={scale}
            >
              {isCustomIdeationNode ? (
                // Render custom ideation node
                (() => {
                  const commonProps = {
                    node: node as any,
                    isSelected: selectedNodeId === node.id,
                    onUpdate: onNodeUpdate,

                    onSelect: onNodeSelect,
                    scale: scale
                  };

                  switch (node.type) {
                    case 'appName':
                      return <AppNameNode {...commonProps} />;
                    case 'tagline':
                      return <TaglineNode {...commonProps} />;
                    case 'coreProblem':
                      return <CoreProblemNode {...commonProps} />;
                    case 'mission':
                      return <MissionNode {...commonProps} onSendMessage={onSendMessage} />;
                    case 'userPersona':
                      return <UserPersonaNode {...commonProps} onDelete={onNodeDelete} />;
                    case 'valueProp':
                      return <ValuePropositionNode {...commonProps} />;
                    case 'competitor':
                      return <CompetitorNode {...commonProps} onDelete={onNodeDelete} />;
                    case 'techStack':
                      return <TechStackNode {...commonProps} />;
                    case 'uiStyle':
                      return <UIStyleNode {...commonProps} />;
                    case 'platform':
                      return <PlatformNode {...commonProps} />;
                    default:
                      return <DefaultCanvasNode 
                                node={node} 
                                isSelected={selectedNodeId === node.id}
                                onUpdate={onNodeUpdate}
                                onDelete={onNodeDelete}
                                onStartConnection={onConnectionStart}
                              />;
                  }
                })()
              ) : (
                // Render default node
                <DefaultCanvasNode 
                  node={node} 
                  isSelected={selectedNodeId === node.id}
                  onUpdate={onNodeUpdate}
                  onDelete={onNodeDelete}
                  onStartConnection={onConnectionStart}
                />
              )}
            </DraggableConnectableWrapper>
          );
        })}

        {/* Connection Preview */}
        {connectingFrom && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-30">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-blue-600 bg-blue-50 bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-200"
            >
              Click another node to create connection
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};