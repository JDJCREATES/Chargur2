import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Edit3, Sparkles, Plus, X } from 'lucide-react';

interface ValuePropNodeData {
  id: 'valueProp';
  value: string;
  editable: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  bulletPoints?: string[];
}

interface ValuePropositionNodeProps {
  node: ValuePropNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<ValuePropNodeData>) => void;
  onSelect: (nodeId: string) => void;
  scale: number;
}

export const ValuePropositionNode: React.FC<ValuePropositionNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.value);
  const [editBullets, setEditBullets] = useState(node.bulletPoints || []);
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
    const updates: Partial<ValuePropNodeData> = {};
    
    if (editValue.trim() !== node.value) {
      updates.value = editValue.trim();
    }
    
    if (JSON.stringify(editBullets) !== JSON.stringify(node.bulletPoints)) {
      updates.bulletPoints = editBullets.filter(bullet => bullet.trim());
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
      setEditBullets(node.bulletPoints || []);
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
    if (!node.value) return;
    
    // Simulate AI rewrite - in real app, this would call your AI service
    const rewritten = `${node.value} Our solution delivers measurable results through innovative technology and user-centered design.`;
    onUpdate(node.id, { value: rewritten });
  };

  const displayValue = node.value || "What unique value does your app provide?";
  const isPlaceholder = !node.value;

  return (
    <div className={`
      relative w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 
      rounded-lg shadow-md border-2 transition-all duration-300
      ${isSelected ? 'border-emerald-400 shadow-lg' : 'border-emerald-200'}
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
              {node.bulletPoints && node.bulletPoints.length > 0 && (
                <div className="space-y-1">
                  {node.bulletPoints.map((bullet, index) => (
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
            
            {node.value && (
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
  );
};