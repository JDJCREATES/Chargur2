import React, { useState, useRef, useEffect } from 'react';
import { Target, Edit3, Sparkles } from 'lucide-react';

interface MissionNodeData {
  id: 'mission';
  value: string;
  missionStatement?: string;
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
  onSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.value);
  const [editMissionStatement, setEditMissionStatement] = useState(node.missionStatement || '');
  const [isRefining, setIsRefining] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const missionStatementRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const updates: Partial<MissionNodeData> = {};
    
    if (editValue.trim() !== node.value) {
      updates.value = editValue.trim();
    }
    
    if (editMissionStatement.trim() !== (node.missionStatement || '')) {
      updates.missionStatement = editMissionStatement.trim();
    }
    
    if (Object.keys(updates).length > 0) {
      onUpdate(node.id, updates);
    }
    
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(node.value);
      setEditMissionStatement(node.missionStatement || '');
      setIsEditing(false);
    }
  };

  const refineWithAI = async () => {
    if (!node.value) return;
    
    setIsRefining(true);
    // Simulate AI refinement
    setTimeout(() => {
      const refined = `${node.value.trim()}${node.value.endsWith('.') ? '' : '.'} We empower users to achieve their goals through innovative technology.`;
      onUpdate(node.id, { value: refined });
      setIsRefining(false);
    }, 2000);
  };

  const displayValue = node.value || "Describe your app's mission and purpose...";
  const displayMissionStatement = node.missionStatement || "";
  const hasMissionStatement = !!displayMissionStatement;
  
  const refineMissionStatement = () => {
    if (!node.value) return;
    
    setIsRefining(true);
    setTimeout(() => {
      onUpdate(node.id, { missionStatement: `Our mission is to ${node.value.toLowerCase().includes('app') ? 'provide a platform that' : ''} empower users to achieve their goals through innovative technology while maintaining the highest standards of quality and user experience.` });
      setIsRefining(false);
    }, 2000);
  };
  const isPlaceholder = !node.value;

  return (
    <div className={`
      relative w-full h-full bg-gradient-to-r from-green-50 to-emerald-50 
      rounded-lg shadow-md border-2 transition-all duration-300
      ${isSelected ? 'border-green-400 shadow-lg' : 'border-green-200'}
      ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
    `}>
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-green-200">
          <Target className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">App Purpose</span>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {isEditing ? (
            <>
              <textarea
                ref={textareaRef}
                placeholder="Describe what your app does..."
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyPress}
                className="w-full h-16 text-sm text-green-900 bg-transparent border-none resize-none focus:outline-none placeholder-green-500 mb-3"
              />
              
              <div className="mb-2">
                <label className="block text-xs font-medium text-green-700 mb-1">
                  Mission Statement:
                </label>
                <textarea
                  ref={missionStatementRef}
                  value={editMissionStatement}
                  onChange={(e) => setEditMissionStatement(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter a formal mission statement..."
                  className="w-full h-20 text-sm text-green-900 bg-white bg-opacity-50 border border-green-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-green-500 p-2"
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-green-700">App Purpose:</h3>
              <div className={`
                text-sm text-green-900 leading-relaxed
                ${isPlaceholder ? 'italic opacity-60' : ''}
              `}>
                {displayValue}
              </div>
              
              {hasMissionStatement && (
                <>
                  <h3 className="text-xs font-medium text-green-700 pt-2 border-t border-green-100">Mission Statement:</h3>
                  <div className="text-sm text-green-800 leading-relaxed font-medium">
                    {displayMissionStatement}
                  </div>
                </>
              )}
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
            
            {node.value && !hasMissionStatement && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  refineMissionStatement();
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
                {isRefining ? 'Generating...' : 'Generate Mission'}
              </button>
            )}
            
            {node.value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rewriteWithAI();
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
                {isRefining ? 'Refining...' : 'Refine Purpose'}
              </button>
            )}
          </div>
        )}

        {/* Character Count */}
        {isEditing && (
          <div className="absolute bottom-2 right-2 text-xs text-green-500">
            {editValue.length} / {editMissionStatement.length} chars
          </div>
        )}
    </div>
  );
};

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
                <Sparkles className={\`w-3 h-3 ${isRefining ? 'animate-spin' : ''}`} />
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
  );
};