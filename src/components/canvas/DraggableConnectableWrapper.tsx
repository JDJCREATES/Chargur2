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

import React, { useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
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
  onSendMessage?: (message: string) => void;
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
  onSendMessage,
  scale,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const initialMousePosRef = useRef({ x: 0, y: 0 });
  const initialNodeSizeRef = useRef({ width: 0, height: 0 }); 

  // Add safety checks for node properties
  const nodeSize = node?.size || { width: 200, height: 100 };
  const nodePosition = node?.position || { x: 0, y: 0 };

  // Create motion values for position
  const x = useMotionValue(nodePosition.x);
  const y = useMotionValue(nodePosition.y);

  // Update motion values when node position changes
  React.useEffect(() => {
    x.set(nodePosition.x);
    y.set(nodePosition.y);
  }, [nodePosition.x, nodePosition.y, x, y]);

  const handleDragStart = (event: any, info: any) => {
    try {
      setIsDragging(true);
      setDragStart({ x: nodePosition.x, y: nodePosition.y });
      // Call the parent's startNodeDrag function if provided
      if (onSelect) {
        onSelect(node.id);
      }
    } catch (error) {
      console.error('Error in handleDragStart:', error);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    try {
      // Calculate final position based on dragStart and offset
      const newPosition = {
        x: Math.max(0, dragStart.x + info.offset.x),
        y: Math.max(0, dragStart.y + info.offset.y),
      };
      // Update the node position in the store
      onUpdate(node.id, { position: newPosition });
      setIsDragging(false);
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsResizing(true);
      initialMousePosRef.current = { x: e.clientX, y: e.clientY };
      initialNodeSizeRef.current = { width: nodeSize.width, height: nodeSize.height };
    } catch (error) {
      console.error('Error in handleResizeStart:', error);
    }
  };

  const handleResize = (e: React.MouseEvent) => {
    try {
      if (!isResizing) return;
      
      e.stopPropagation();
      e.preventDefault();
      
      const deltaX = (e.clientX - initialMousePosRef.current.x) / scale;
      const deltaY = (e.clientY - initialMousePosRef.current.y) / scale;
      
      const newWidth = Math.max(100, initialNodeSizeRef.current.width + deltaX);
      const newHeight = Math.max(50, initialNodeSizeRef.current.height + deltaY);
      
      onUpdate(node.id, {
        size: { width: newWidth, height: newHeight }
      });
    } catch (error) {
      console.error('Error in handleResize:', error);
    }
  };

  const handleResizeEnd = () => {
    try {
      setIsResizing(false);
    } catch (error) {
      console.error('Error in handleResizeEnd:', error);
    }
  };

  return (
    <motion.div
      drag={!isResizing}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={false}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
      className={`
        absolute cursor-move select-none transition-shadow
        ${isDragging ? 'z-50' : isSelected ? 'z-30' : 'z-10'}
      `}
      style={{
        x,
        y,
        width: nodeSize.width,
        minHeight: nodeSize.height,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseMove={isResizing ? handleResize : undefined}
      onMouseUp={isResizing ? handleResizeEnd : undefined}
      onMouseLeave={isResizing ? handleResizeEnd : undefined}
    >
      {/* Node Content */}
      <div className={`
        w-full h-full relative 
        ${isConnecting ? 'ring-2 ring-blue-400 ring-opacity-30' : ''}
      `}>
        {/* Pulsing Energy Border Layers - Only when selected */}
        {isSelected && (
          <>
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none ring-8 ring-teal-400/20"
              animate={{ scale: [1, 1.04, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            />

            {/* Inner Ring */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none ring-2 ring-yellow-600/60"
              animate={{ scale: [1, 1.04, 1], opacity: [0, .8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            />
          </>
        )}
        
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

        {/* Resize Handle */}
        {isSelected && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-300 rounded-bl-sm rounded-tr-sm cursor-nwse-resize hover:bg-gray-100"
            onMouseDown={handleResizeStart}
            
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </motion.div>
  );
};