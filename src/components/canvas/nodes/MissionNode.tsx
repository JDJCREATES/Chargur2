import React, { useState, useRef, useEffect } from 'react';
import { Target, Edit3, Sparkles } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

const MissionNode: React.FC<NodeProps> = ({ 
  id, 
  data = {}, // Add default empty object
  selected,
  isConnectable 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data?.value || '');
  const [editMissionStatement, setEditMissionStatement] = useState(data?.missionStatement || '');
  const [isRefining, setIsRefining] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const missionStatementRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Update state when data changes
  useEffect(() => {
    setEditValue(data?.value || '');
    setEditMissionStatement(data?.missionStatement || '');
  }, [data?.value, data?.missionStatement]);

  const handleSave = () => {
    const updates: any = {};
    
    if (editValue.trim() !== (data?.value || '')) {
      updates.value = editValue.trim();
    }
    
    if (editMissionStatement.trim() !== (data?.missionStatement || '')) {
      updates.missionStatement = editMissionStatement.trim();
    }
    
    if (Object.keys(updates).length > 0 && data?.onNodeUpdate) {
      data.onNodeUpdate(id, updates);
    }
    
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(data?.value || '');
      setEditMissionStatement(data?.missionStatement || '');
      setIsEditing(false);
    }
  };

  const refineWithAI = async () => {
    if (!data?.value) return;
    
    if (data?.onSendMessage) {
      setIsRefining(true);
      data.onSendMessage(`Please refine this app purpose description to be more clear and professional: "${data.value}"`);
      // Note: The actual update will happen via the onAutoFill callback in App.tsx
      // when the AI response comes back with updated data
    }
  };

  const displayValue = data?.value || "Describe your app's mission and purpose...";
  const displayMissionStatement = data?.missionStatement || "";
  const hasMissionStatement = !!displayMissionStatement;
  
  const refineMissionStatement = () => {
    if (!data?.value) return;
    
    if (data?.onSendMessage) {
      setIsRefining(true);
      data.onSendMessage(`Based on this app purpose: "${data.value}", please generate a formal mission statement that captures the app's core values and goals.`);
      // Note: The actual update will happen via the onAutoFill callback in App.tsx
      // when the AI response comes back with updated data
    }
  };
  
  const isPlaceholder = !data?.value;

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
        relative bg-gradient-to-r from-green-50 to-emerald-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-green-400 shadow-lg' : 'border-green-200'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b border-green-200">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">App Purpose</span>
          </div>

          {/* Main Content */}
          <div className="p-4 whitespace-normal break-words">
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
              
              {data?.value && !hasMissionStatement && (
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
              
              {data?.value && (
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
    </>
  );
};

export default MissionNode;