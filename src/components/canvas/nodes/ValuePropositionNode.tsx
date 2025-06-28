import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Edit3, Sparkles, Plus, X } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

const ValuePropositionNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.value);
  const [editBullets, setEditBullets] = useState(data.bulletPoints || []);
  const [newBullet, setNewBullet] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const newBulletRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const updates: any = {};
    
    if (editValue.trim() !== data.value) {
      updates.value = editValue.trim();
    }
    
    if (JSON.stringify(editBullets) !== JSON.stringify(data.bulletPoints)) {
      updates.bulletPoints = editBullets.filter(bullet => bullet.trim());
    }
    
    if (Object.keys(updates).length > 0) {
      data.onNodeUpdate(id, updates);
    }
    
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(data.value);
      setEditBullets(data.bulletPoints || []);
      setIsEditing(false);
    }
  };

  const addBulletPoint = () => {
    if (newBullet.trim()) {
      setEditBullets([...editBullets, newBullet.trim()]);
      setNewBullet('');
      if (newBulletRef.current) {
        newBulletRef.current.focus();
      }
    }
  };

  const removeBulletPoint = (index: number) => {
    setEditBullets(editBullets.filter((_, i) => i !== index));
  };

  const rewriteWithAI = async () => {
    if (!data.value) return;
    
    // Simulate AI rewrite - in real app, this would call your AI service
    const rewritten = `${data.value} Our solution delivers measurable results through innovative technology and user-centered design.`;
    data.onNodeUpdate(id, { value: rewritten });
  };

  const displayValue = data.value || "What unique value does your app provide?";
  const isPlaceholder = !data.value;

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-emerald-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-emerald-500"
      />

      <div className={`
        relative w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-emerald-400 shadow-lg' : 'border-emerald-200'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Value Proposition</span>
          </div>

          {/* Main Content */}
          <div className="p-4">
            {isEditing ? (
              <div className="space-y-4">
                {/* Main Value Text */}
                <textarea
                  ref={textareaRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full h-20 text-sm text-emerald-900 bg-white border border-emerald-200 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your value proposition..."
                />
                
                {/* Bullet Points */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-emerald-700">Key Benefits:</label>
                  
                  {editBullets.map((bullet, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...editBullets];
                          newBullets[index] = e.target.value;
                          setEditBullets(newBullets);
                        }}
                        className="flex-1 text-xs bg-white border border-emerald-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => removeBulletPoint(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add New Bullet */}
                  <div className="flex items-center gap-2">
                    <Plus className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <input
                      ref={newBulletRef}
                      type="text"
                      value={newBullet}
                      onChange={(e) => setNewBullet(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBulletPoint()}
                      className="flex-1 text-xs bg-white border border-emerald-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Add benefit..."
                    />
                    <button
                      onClick={addBulletPoint}
                      className="text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Save/Cancel */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 text-xs bg-emerald-600 text-white rounded py-2 hover:bg-emerald-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 text-xs bg-gray-300 text-gray-700 rounded py-2 hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Main Value Text */}
                <div className={`
                  text-sm text-emerald-900 leading-relaxed
                  ${isPlaceholder ? 'italic opacity-60' : ''}
                `}>
                  {displayValue}
                </div>
                
                {/* Bullet Points */}
                {data.bulletPoints && data.bulletPoints.length > 0 && (
                  <div className="space-y-1">
                    {data.bulletPoints.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-emerald-800 leading-relaxed">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center justify-between p-3 border-t border-emerald-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              
              {data.value && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    rewriteWithAI();
                  }}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Rewrite
                </button>
              )}
            </div>
          )}
      </div>
    </>
  );
};

export default ValuePropositionNode;