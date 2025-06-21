import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Users, 
  Zap, 
  Layout, 
  Database, 
  Settings,
  Edit3,
  Trash2,
  Link,
  Plus,
  MessageSquare,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

export interface CanvasNodeData {
  id: string;
  type: 'concept' | 'feature' | 'ux-flow' | 'wireframe' | 'system' | 'agent-output';
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  connections: string[];
  metadata?: any;
  collapsed?: boolean;
}

interface CanvasNodeProps {
  node: CanvasNodeData;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
  scale: number;
}

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onUpdate,
  onDelete,
  onStartConnection,
  onEndConnection,
  scale,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);

  const getNodeIcon = () => {
    switch (node.type) {
      case 'concept': return <Lightbulb className="w-4 h-4" />;
      case 'feature': return <Zap className="w-4 h-4" />;
      case 'ux-flow': return <Users className="w-4 h-4" />;
      case 'wireframe': return <Layout className="w-4 h-4" />;
      case 'system': return <Database className="w-4 h-4" />;
      case 'agent-output': return <MessageSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getNodeColors = () => {
    const colors = {
      concept: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      feature: 'bg-blue-100 border-blue-300 text-blue-800',
      'ux-flow': 'bg-green-100 border-green-300 text-green-800',
      wireframe: 'bg-purple-100 border-purple-300 text-purple-800',
      system: 'bg-red-100 border-red-300 text-red-800',
      'agent-output': 'bg-gray-100 border-gray-300 text-gray-800',
    };
    return colors[node.type] || colors['agent-output'];
  };

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

  const handleSaveEdit = () => {
    onUpdate(node.id, { content: editContent });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setEditContent(node.content);
      setIsEditing(false);
    }
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
      <div className={`
        w-full h-full rounded-lg border-2 shadow-sm transition-all
        ${getNodeColors()}
        ${isSelected ? 'shadow-lg' : 'shadow-sm'}
        ${isConnecting ? 'ring-2 ring-blue-400 ring-opacity-30' : ''}
      `}>
        {/* Node Header */}
        <div className="flex items-center justify-between p-2 border-b border-current border-opacity-20">
          <div className="flex items-center gap-2">
            {getNodeIcon()}
            <span className="font-medium text-sm truncate">{node.title}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {node.collapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(node.id, { collapsed: false });
                }}
                className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
              >
                <Eye className="w-3 h-3" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartConnection(node.id);
              }}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
              title="Connect to another node"
            >
              <Link className="w-3 h-3" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Node Content */}
        {!node.collapsed && (
          <div className="p-3">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSaveEdit}
                className="w-full h-20 p-2 text-xs bg-white bg-opacity-50 border border-current border-opacity-30 rounded resize-none focus:outline-none focus:ring-1 focus:ring-current"
                autoFocus
                placeholder="Enter content..."
              />
            ) : (
              <div className="text-xs leading-relaxed">
                {node.content || 'Click edit to add content...'}
              </div>
            )}
            
            {/* Metadata Display */}
            {node.metadata && (
              <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                <div className="text-xs opacity-75">
                  {Object.entries(node.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapse Toggle */}
        {!node.collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(node.id, { collapsed: true });
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-current border-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-80"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        )}

        {/* Connection Points */}
        <div className="absolute -top-1 left-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-x-1/2"></div>
        <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-x-1/2"></div>
        <div className="absolute -left-1 top-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-y-1/2"></div>
        <div className="absolute -right-1 top-1/2 w-2 h-2 bg-current rounded-full opacity-30 transform -translate-y-1/2"></div>
      </div>
    </motion.div>
  );
};