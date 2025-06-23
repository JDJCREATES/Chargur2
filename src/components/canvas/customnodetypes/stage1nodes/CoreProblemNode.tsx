import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Edit3, Link, Lightbulb } from 'lucide-react';

interface CoreProblemNodeData {
  id: 'coreProblem';
  value: string;
  editable: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  keywords?: string[];
  relatedCompetitors?: string[];
}

interface CoreProblemNodeProps {
  node: CoreProblemNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<CoreProblemNodeData>) => void;
  onSelect: (nodeId: string) => void;
  scale: number;
}

export const CoreProblemNode: React.FC<CoreProblemNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect,
  scale,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.value);
  const [highlightedText, setHighlightedText] = useState(node.value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Auto-highlight keywords when value changes
    if (node.keywords && node.keywords.length > 0) {
      let highlighted = node.value;
      node.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
      });
      setHighlightedText(highlighted);
    } else {
      setHighlightedText(node.value);
    }
  }, [node.value, node.keywords]);

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

  const highlightKeywords = () => {
    if (!node.value) return;
    
    // Simple keyword extraction - split by common words and take meaningful ones
    const words = node.value.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !['that', 'with', 'they', 'have', 'this', 'from', 'were', 'been'].includes(word))
      .slice(0, 5);
    
    onUpdate(node.id, { keywords: words });
  };

  const displayValue = node.value || "What core problem does your app solve?";
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
        relative w-full h-full bg-gradient-to-br from-orange-100 to-red-100 
        rounded-lg shadow-md border-2 transition-all duration-300 transform rotate-1
        ${isSelected ? 'border-orange-400 shadow-lg rotate-0' : 'border-orange-200'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
        {/* Sticky Note Header */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-8 h-3 bg-orange-300 rounded-t-sm"></div>
        
        {/* Problem Icon */}
        <div className="absolute top-3 left-3">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>

        {/* Main Content */}
        <div className="p-4 pt-12 h-full">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="w-full h-full text-sm text-orange-900 bg-transparent border-none resize-none focus:outline-none placeholder-orange-500"
              placeholder="Describe the core problem your app solves..."
            />
          ) : (
            <div className="h-full flex flex-col">
              <div 
                className={`
                  text-sm text-orange-900 leading-relaxed flex-1
                  ${isPlaceholder ? 'italic opacity-60' : ''}
                `}
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
              
              {!isEditing && node.editable && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-orange-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  
                  {node.value && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        highlightKeywords();
                      }}
                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 transition-colors"
                    >
                      <Lightbulb className="w-3 h-3" />
                      Highlight Keywords
                    </button>
                  )}
                  
                  {node.relatedCompetitors && node.relatedCompetitors.length > 0 && (
                    <button
                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 transition-colors"
                      title="View related competitors"
                    >
                      <Link className="w-3 h-3" />
                      Competitors
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keywords Display */}
        {node.keywords && node.keywords.length > 0 && !isEditing && (
          <div className="absolute bottom-2 right-2">
            <div className="flex flex-wrap gap-1">
              {node.keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};