import React, { useState, useRef, useEffect } from 'react';
import { Edit3, History, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Handle, Position, NodeProps } from 'reactflow';

const AppNameNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data?.value || '');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (data?.editable) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== data?.value) {
      const newHistory = [...(data?.nameHistory || []), data?.value].filter(Boolean);
      data?.onNodeUpdate?.(id, { 
        value: editValue.trim(),
        nameHistory: newHistory
      });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(data?.value || '');
      setIsEditing(false);
    }
  };

  const displayValue = data?.value || "Name your app...";
  const isPlaceholder = !data?.value;

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />

      <div 
        className={`
        relative w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 
        rounded-xl shadow-lg border-2 transition-all duration-300
        ${selected ? 'border-white shadow-2xl' : 'border-blue-400'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
        `}
        onDoubleClick={handleDoubleClick}
      >
          {/* Main Content */}
          <div className="p-6 flex flex-col items-center justify-center h-full">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyPress}
                className="w-full text-2xl font-bold text-center bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-none rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="Enter app name..."
              />
            ) : (
              <h1 className={`
                text-2xl font-bold text-center text-white leading-tight
                ${isPlaceholder ? 'italic opacity-80' : ''}
              `}>
                {displayValue}
              </h1>
            )}
            
            {!isEditing && (
              <div className="flex items-center gap-2 mt-2 opacity-70">
                <Edit3 className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Double-click to edit</span>
              </div>
            )}
          </div>

          {/* History Button */}
          {data?.nameHistory && data?.nameHistory.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHistory(!showHistory);
              }}
              className="absolute top-2 right-2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              title="View name history"
            >
              <History className="w-4 h-4 text-white" />
            </button>
          )}

          {/* History Tooltip */}
          {showHistory && data?.nameHistory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-3 min-w-48 z-60"
            >
              <h4 className="font-medium text-sm text-gray-800 mb-2">Name History</h4>
              <div className="space-y-1">
                {data?.nameHistory?.map((name, index) => (
                  <div key={index} className="text-xs text-gray-600 p-1 hover:bg-gray-50 rounded cursor-pointer"
                       onClick={() => {
                         data?.onNodeUpdate?.(id, { value: name });
                         setShowHistory(false);
                       }}>
                    {name}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-20 blur-xl -z-10" />
      </div>
    </>
  );
};

export default AppNameNode;