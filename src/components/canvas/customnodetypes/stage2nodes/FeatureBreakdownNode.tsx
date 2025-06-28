import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit3, Trash2, Plus, Check, X } from 'lucide-react';
import { CanvasNodeData } from '../../CanvasNode';

interface FeatureBreakdownNodeProps {
  node: CanvasNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  scale: number;
}

export const FeatureBreakdownNode: React.FC<FeatureBreakdownNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  scale
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSteps, setEditSteps] = useState<string[]>(node.breakdownSteps || []);
  const [newStep, setNewStep] = useState('');

  const handleSave = () => {
    onUpdate(node.id, { 
      breakdownSteps: editSteps.filter(step => step.trim() !== '')
    });
    setIsEditing(false);
    setNewStep('');
  };

  const handleCancel = () => {
    setEditSteps(node.breakdownSteps || []);
    setIsEditing(false);
    setNewStep('');
  };

  const addStep = () => {
    if (newStep.trim()) {
      setEditSteps([...editSteps, newStep.trim()]);
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setEditSteps(editSteps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updatedSteps = [...editSteps];
    updatedSteps[index] = value;
    setEditSteps(updatedSteps);
  };

  // Get parent feature name from metadata if available
  const parentFeatureName = node.metadata?.parentFeatureName || 'Feature';

  return (
    <div className={`
      relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 
      rounded-lg shadow-md border-2 transition-all duration-300
      ${isSelected ? 'border-blue-400 shadow-lg' : 'border-blue-200'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-blue-200 bg-blue-100 bg-opacity-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <h3 className="font-medium text-sm text-blue-800">
            {parentFeatureName} Breakdown
          </h3>
        </div>
        
        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 hover:bg-blue-200 rounded text-blue-700"
              title="Edit breakdown"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Delete breakdown"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <div className="text-xs font-medium text-blue-700 mb-1">Sub-features:</div>
            
            {/* Editable steps */}
            {editSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1"></div>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeStep(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* Add new step */}
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0 mt-1"></div>
              <input
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="Add new sub-feature..."
                className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newStep.trim()) {
                    addStep();
                  }
                }}
              />
              <button
                onClick={addStep}
                disabled={!newStep.trim()}
                className={`p-1 rounded ${
                  newStep.trim() ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-300 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-blue-100">
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {node.breakdownSteps && node.breakdownSteps.length > 0 ? (
              node.breakdownSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-blue-700">
                  <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></div>
                  <div>{step}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-blue-400 italic">
                No breakdown steps defined. Click edit to add steps.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection indicator */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-blue-400"></div>
    </div>
  );
};