import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Edit3, Copy, Code } from 'lucide-react';

interface MarkdownCodeNodeData {
  title: string;
  content: string;
  source?: string;
  editable?: boolean;
  onNodeUpdate?: (id: string, updates: Partial<MarkdownCodeNodeData>) => void;
  onNodeDelete?: (id: string) => void;
}

const MarkdownCodeNode: React.FC<NodeProps<MarkdownCodeNodeData>> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (data?.onNodeUpdate) {
      data.onNodeUpdate(id, { content: editContent });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setEditContent(data?.content || '');
      setIsEditing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data?.content || '');
  };

  // Split content by newlines and add line numbers
  const renderNumberedContent = () => {
    if (!data?.content) return <div className="text-gray-400 italic">No content</div>;
    
    const lines = data.content.split('\n');
    return (
      <div className="font-mono text-xs">
        {lines.map((line, index) => (
          <div key={index} className="flex">
            <div className="text-gray-500 w-8 text-right pr-2 select-none">
              {index + 1}
            </div>
            <div className="text-green-400 flex-1 whitespace-pre">
              {line || ' '}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500"
      />

      <div className={`
        relative w-full h-full bg-gray-900 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-green-400 shadow-lg' : 'border-green-200'}
      `}>
        style={{ width: data.size?.width, height: data.size?.height }}
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-green-400" />
            <h3 className="font-medium text-sm text-green-300">{data?.title || 'Code'}</h3>
            {data?.source && (
              <span className="text-xs text-gray-400">Source: {data.source}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={copyToClipboard}
              className="p-1 text-gray-400 hover:text-green-400 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-3 h-3" />
            </button>
            
            {data?.editable && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                title="Edit content"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 overflow-auto max-h-[calc(100%-40px)]">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyPress}
              className="w-full h-full min-h-[100px] bg-gray-800 text-green-400 font-mono text-xs p-2 border border-gray-700 rounded resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          ) : (
            renderNumberedContent()
          )}
        </div>
      </div>
    </>
  );
};

export default MarkdownCodeNode;