import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Info } from 'lucide-react';

interface TaglineNodeData {
  id: 'tagline';
  value: string;
  editable: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface TaglineNodeProps {
  node: TaglineNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<TaglineNodeData>) => void;
  onSelect: (nodeId: string) => void;
  scale: number;
}

export const TaglineNode: React.FC<TaglineNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect,
  scale,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.value);
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() !== node.value) {
      onUpdate(node.id, { value: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(node.value);
      setIsEditing(false);
    }
  };

  const displayValue = node.value || "Your app's essence in a few words...";
  const isPlaceholder = !node.value;

  return (
    <motion.div
      className={`
        absolute cursor-pointer select-none transition-all duration-300
        ${isSelected ? 'z-50' : 'z-10'}
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
      whileHover={{ scale: 1.02 }}
      animate={{
        scale: isSelected ? 1.05 : 1,
      }}
    >
      <div className={`
        relative w-full h-full bg-gradient-to-r from-purple-100 to-pink-100 
        rounded-full shadow-md border-2 transition-all duration-300
        ${isSelected ? 'border-purple-400 shadow-lg' : 'border-purple-200'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
        <div className="px-6 py-3 flex items-center justify-center h-full">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="w-full text-sm font-medium text-center bg-transparent text-purple-800 placeholder-purple-400 border-none focus:outline-none"
              placeholder="Enter tagline..."
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className={`
                text-sm font-medium text-center text-purple-800 leading-tight
                ${isPlaceholder ? 'italic opacity-60' : ''}
              `}>
                {displayValue}
              </span>
              {node.editable && !isEditing && (
                <Edit3 
                  className="w-3 h-3 text-purple-600 opacity-50 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Info Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors text-xs"
          title="Why taglines matter"
        >
          <Info className="w-3 h-3" />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-8 right-0 bg-white rounded-lg shadow-lg p-3 min-w-64 z-60 border border-purple-200"
          >
            <h4 className="font-medium text-purple-800 mb-2 text-sm">Why Taglines Matter</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              A great tagline captures your app's core value in just a few words. 
              It helps users instantly understand what makes your app special and 
              memorable. Think "Just Do It" or "Think Different" - short, powerful, 
              and unforgettable.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};