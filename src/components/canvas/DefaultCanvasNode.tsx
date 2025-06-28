/**
 * DefaultCanvasNode.tsx
 * 
 * Default node implementation for the SpatialCanvas system.
 * Handles the standard node appearance and behavior.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Provides the default node appearance and behavior
 * - Manages node content editing
 * - Handles node collapse/expand functionality
 * - Displays node metadata and actions
 * 
 * NOTE: This component should be wrapped by DraggableConnectableWrapper
 * to provide drag functionality and connection points.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit3,
  Trash2,
  Link,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  GiLightBulb,
  GiEnergise,
  GiPerson,
  GiWindow,
  GiDatabase,
  GiConversation,
  GiScrollQuill,
  GiCrown,
  GiQuill,
  GiBullseye,
  GiDiamonds,
  GiCrossedSwords
} from 'react-icons/gi';
import { CanvasNodeData } from '../CanvasNode';


interface DefaultCanvasNodeProps {
  node: CanvasNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
}

export const DefaultCanvasNode: React.FC<DefaultCanvasNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onDelete,
  onStartConnection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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

  const getNodeIcon = () => {
    switch (node.type) {
      case 'concept': return <GiLightBulb className="w-4 h-4" />;
      case 'feature': return <GiEnergise className="w-4 h-4" />;
      case 'ux-flow': return <GiPerson className="w-4 h-4" />;
      case 'wireframe': return <GiWindow className="w-4 h-4" />;
      case 'system': return <GiDatabase className="w-4 h-4" />;
      case 'agent-output': return <GiConversation className="w-4 h-4" />;
      case 'appName': return <GiCrown className="w-4 h-4" />;
      case 'tagline': return <GiQuill className="w-4 h-4" />;
      case 'coreProblem': return <GiLightBulb className="w-4 h-4" />;
      case 'mission': return <GiBullseye className="w-4 h-4" />;
      case 'userPersona': return <GiPerson className="w-4 h-4" />;
      case 'valueProp': return <GiDiamonds className="w-4 h-4" />;
      case 'competitor': return <GiCrossedSwords className="w-4 h-4" />;
      default: return <GiScrollQuill className="w-4 h-4" />;
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
      appName: 'bg-blue-100 border-blue-300 text-blue-800',
      tagline: 'bg-purple-100 border-purple-300 text-purple-800',
      coreProblem: 'bg-orange-100 border-orange-300 text-orange-800',
      mission: 'bg-green-100 border-green-300 text-green-800',
      userPersona: 'bg-blue-100 border-blue-300 text-blue-800',
      valueProp: 'bg-emerald-100 border-emerald-300 text-emerald-800',
      competitor: 'bg-red-100 border-red-300 text-red-800',
    };
    return colors[node.type] || colors['agent-output'];
  };

  return (
    <div className={`
      w-full h-full rounded-lg border-2 shadow-sm transition-all
      ${getNodeColors()}
      ${isSelected ? 'shadow-lg' : 'shadow-sm'}
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
        <div className="p-3 flex-1 overflow-auto">
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveEdit}
              className="w-full h-full p-2 text-xs bg-white bg-opacity-50 border border-current border-opacity-30 rounded resize-none focus:outline-none focus:ring-1 focus:ring-current"
              autoFocus
              placeholder="Enter content..."
              style={{ minHeight: '20px', height: Math.max(20, node.size.height - 60) }}
            />
          ) : (
            <div className="text-xs leading-relaxed h-full overflow-auto">
              {node.content || 'Click edit to add content...'}
            </div>
          )}
          
          {/* Metadata Display */}
          {node.metadata && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
              <div className="text-xs opacity-75">
                {Object.entries(node.metadata)
                  .filter(([key]) => !key.startsWith('_') && key !== 'stage' && key !== 'nodeType' && key !== 'generated')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))
                }
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
    </div>
  );
};