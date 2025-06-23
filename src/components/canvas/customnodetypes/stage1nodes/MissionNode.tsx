import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Edit3, Sparkles } from 'lucide-react';

interface MissionNodeData {
  id: 'mission';
  value: string;
  editable: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface MissionNodeProps {
  node: MissionNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<MissionNodeData>) => void;
  onSelect: (nodeId: string) => void;
  scale: number;
}

export const MissionNode: React.FC<MissionNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect,
  scale,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.value);
  const [isRefining, setIsRefining] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() !== node.value) {
      onUpdate(node.id, { value: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(node.value);
      setIsEditing(false);
    }
  };

  const refineWithAI = async () => {
    if (!node.value) return;
    
    setIsRefining(true);
    // Simulate AI refinement - in real app, this would call your AI service
    setTimeout(() => {
      const refined = `${node.value.trim()}${node.value.endsWith('.') ? '' : '.'} We empower users to achieve their goals through innovative technology.`;
      onUpdate(node.id, { value: refined });
      setIsRefining(false);
    }, 2000);
  };

  const displayValue = node.value || "Describe your app's mission and purpose...";
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
        relative w-full h-full bg-gradient-to-r from-green-50 to-emerald-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${isSelected ? 'border-green-400 shadow-lg' : 'border-green-200'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-green-200">
          <Target className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Mission Statement</span>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="w-full h-24 text-sm text-green-900 bg-transparent border-none resize-none focus:outline-none placeholder-green-500"
              placeholder="Enter your mission statement..."
            />
          ) : (
            <div className={`
              text-sm text-green-900 leading-relaxed min-h-24
              ${isPlaceholder ? 'italic opacity-60' : ''}
            `}>
              {displayValue}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex items-center justify-between p-3 border-t border-green-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>
            
            {node.value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  refineWithAI();
                }}
                disabled={isRefining}
                className={`
                  flex items-center gap-1 text-xs transition-colors
                  ${isRefining 
                    ? 'text-green-400 cursor-not-allowed' 
                    : 'text-green-600 hover:text-green-800'
                  }
                `}
              >
                <Sparkles className={`w-3 h-3 ${isRefining ? 'animate-spin' : ''}`} />
                {isRefining ? 'Refining...' : 'Refine via AI'}
              </button>
            )}
          </div>
        )}

        {/* Character Count */}
        {isEditing && (
          <div className="absolute bottom-2 right-2 text-xs text-green-500">
            {editValue.length} chars
          </div>
        )}
      </div>
    </motion.div>
  );
};