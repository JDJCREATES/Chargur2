/**
 * DraggableConnectableWrapper.tsx
 * 
 * A wrapper component that provides drag functionality and connection points
 * for all node types in the SpatialCanvas system.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Provides consistent drag behavior for all node types
 * - Manages connection points for node linking
 * - Handles selection visual feedback
 * - Centralizes position updates and drag events
 * - Creates a unified interaction layer for all node types
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CanvasNodeData } from './CanvasNode';

interface DraggableConnectableWrapperProps {
  node: CanvasNodeData;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
  scale: number;
  children: React.ReactNode;
}

export const DraggableConnectableWrapper: React.FC<DraggableConnectableWrapperProps> = ({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onUpdate,
  onDelete,
  onStartConnection,
  onEndConnection,
  scale,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: any) => {
    const newPosition = {
      x: Math.max(0, node.position.x + info.delta.x / scale),
      y: Math.max(0, node.position.y + info.delta.y / scale),
    };
    onUpdate(node.id, { position: newPosition });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
      className={`
        absolute cursor-move select-none transition-shadow
        ${isDragging ? 'z-50' : 'z-10'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: node.size.width,
        minHeight: node.size.height,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      {/* Node Content */}
      <div className={`
        w-full h-full relative
        ${isConnecting ? 'ring-2 ring-blue-400 ring-opacity-30' : ''}
      `}>
        {children}
        
        {/* Connection Points */}
        <div 
          className="absolute -top-1 left-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-x-1/2 cursor-crosshair hover:opacity-80"
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              onEndConnection(node.id);
            } else {
              onStartConnection(node.id);
            }
          }}
        />
        <div 
          className="absolute -bottom-1 left-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-x-1/2 cursor-crosshair hover:opacity-80"
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              onEndConnection(node.id);
            } else {
              onStartConnection(node.id);
            }
          }}
        />
        <div 
          className="absolute -left-1 top-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-y-1/2 cursor-crosshair hover:opacity-80"
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              onEndConnection(node.id);
            } else {
              onStartConnection(node.id);
            }
          }}
        />
        <div 
          className="absolute -right-1 top-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-y-1/2 cursor-crosshair hover:opacity-80"
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              onEndConnection(node.id);
            } else {
              onStartConnection(node.id);
            }
          }}
        />
      </div>
    </motion.div>
  );
};