import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Box, Plus, X, Sparkles } from 'lucide-react';
import { CanvasNodeData } from '../../CanvasNode';

interface FeatureNodeProps {
  node: CanvasNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  scale: number;
}

export const FeatureNode: React.FC<FeatureNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  scale
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.title || '');
  const [editDescription, setEditDescription] = useState(node.content || '');
  const [editPriority, setEditPriority] = useState(node.metadata?.priority || 'should');
  const [editComplexity, setEditComplexity] = useState(node.metadata?.complexity || 'medium');
  const [editCategory, setEditCategory] = useState(node.metadata?.category || 'both');
  const [editSubFeatures, setEditSubFeatures] = useState<string[]>(node.subFeatures || []);
  const [newSubFeature, setNewSubFeature] = useState('');
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const updates: Partial<CanvasNodeData> = {
      title: editName.trim(),
      content: editDescription.trim(),
      metadata: {
        ...node.metadata,
        priority: editPriority as string,
        complexity: editComplexity as string,
        category: editCategory as string
      },
      subFeatures: editSubFeatures.filter(sf => sf.trim() !== '')
    };
    
    onUpdate(node.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(node.title || '');
    setEditDescription(node.content || '');
    setEditPriority(node.metadata?.priority || 'should');
    setEditComplexity(node.metadata?.complexity || 'medium');
    setEditCategory(node.metadata?.category || 'both');
    setEditSubFeatures(node.subFeatures || []);
    setIsEditing(false);
  };

  const addSubFeature = () => {
    if (newSubFeature.trim()) {
      setEditSubFeatures([...editSubFeatures, newSubFeature.trim()]);
      setNewSubFeature('');
    }
  };

  const removeSubFeature = (index: number) => {
    setEditSubFeatures(editSubFeatures.filter((_, i) => i !== index));
  };

  const updateSubFeature = (index: number, value: string) => {
    const updatedSubFeatures = [...editSubFeatures];
    updatedSubFeatures[index] = value;
    setEditSubFeatures(updatedSubFeatures);
  };

  // Generate AI sub-features
  const generateSubFeatures = () => {
    // This would call the AI to generate sub-features
    // For now, we'll use a simple algorithm based on the feature name
    const featureName = node.title || '';
    
    // Common feature breakdowns
    const commonBreakdowns: { [key: string]: string[] } = {
      'user profiles': [
        'View user profile details',
        'Edit profile information',
        'Upload and crop profile avatar',
        'Set user preferences',
        'Configure privacy settings'
      ],
      'real-time chat': [
        'Send text messages',
        'Receive messages with delivery status',
        'Show typing indicators',
        'Access message history',
        'Support emoji reactions and attachments'
      ],
      'file upload': [
        'Select multiple files',
        'Show upload progress',
        'Validate file types and sizes',
        'Manage storage quotas',
        'Download and share uploaded files'
      ],
      'notifications': [
        'Push notifications for mobile',
        'Email notifications for important events',
        'In-app notification center',
        'Notification preference settings',
        'Read/unread status tracking'
      ],
      'authentication': [
        'Email/password registration',
        'Social login options',
        'Password reset flow',
        'Account verification',
        'Session management'
      ],
      'payment': [
        'Multiple payment method support',
        'Secure checkout process',
        'Payment history tracking',
        'Subscription management',
        'Invoice generation'
      ],
      'search': [
        'Full-text search capability',
        'Filter and sort results',
        'Search history tracking',
        'Suggested search terms',
        'Advanced search options'
      ],
      'dashboard': [
        'Key metrics visualization',
        'Customizable widgets',
        'Data filtering options',
        'Export capabilities',
        'Real-time updates'
      ]
    };
    
    // Try to find an exact match first
    const key = featureName.toLowerCase().trim();
    if (commonBreakdowns[key]) {
      setEditSubFeatures(commonBreakdowns[key]);
      return;
    }
    
    // If no exact match, look for partial matches
    for (const breakdownKey in commonBreakdowns) {
      if (key.includes(breakdownKey) || breakdownKey.includes(key)) {
        setEditSubFeatures(commonBreakdowns[breakdownKey]);
        return;
      }
    }
    
    // Generate generic breakdown based on feature name
    setEditSubFeatures([
      `${featureName} setup and configuration`,
      `${featureName} core functionality`,
      `${featureName} user interface`,
      `${featureName} settings and customization`,
      `${featureName} integration with other features`
    ]);
  };

  // Get priority and complexity colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must': return 'bg-red-100 text-red-700 border-red-200';
      case 'should': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'could': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'wont': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Extract priority and complexity from node metadata or content
  const extractPriorityAndComplexity = () => {
    let priority = node.metadata?.priority || 'should';
    let complexity = node.metadata?.complexity || 'medium';
    
    // If not in metadata, try to extract from content
    if (node.content) {
      const priorityMatch = node.content.match(/Priority:\s*(\w+)/i);
      const complexityMatch = node.content.match(/Complexity:\s*(\w+)/i);
      
      if (priorityMatch && priorityMatch[1]) {
        priority = priorityMatch[1].toLowerCase();
      }
      
      if (complexityMatch && complexityMatch[1]) {
        complexity = complexityMatch[1].toLowerCase();
      }
    }
    
    return { priority, complexity };
  };

  const { priority, complexity } = extractPriorityAndComplexity();
  const priorityColor = getPriorityColor(priority);
  const complexityColor = getComplexityColor(complexity);

  // Get description from content
  const getDescription = () => {
    if (!node.content) return '';
    
    // Remove priority and complexity lines
    return node.content
      .replace(/Priority:\s*\w+/i, '')
      .replace(/Complexity:\s*\w+/i, '')
      .trim();
  };

  const description = getDescription();

  return (
    <div className={`
      relative w-full h-full bg-white 
      rounded-lg shadow-md border transition-all duration-300
      ${isSelected ? 'border-blue-400 shadow-lg' : 'border-blue-200'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-blue-100 bg-blue-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-blue-600" />
          {isEditing ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-2 py-1 text-sm font-medium border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <h3 className="font-medium text-sm text-blue-800 truncate">
            {node.title || 'Feature'}
          </h3>
          )}
        
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Delete feature"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category display (when not editing) */}
      {!isEditing && node.metadata?.category && (
        <div className="px-3 pt-2 text-xs text-gray-500 italic">
          {node.metadata.category.charAt(0).toUpperCase() + node.metadata.category.slice(1)}
        </div>
      )}

      {/* Main Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-3">
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe this feature..."
              />
            </div>
            
            {/* Priority and Complexity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editPriority as string}
                  onChange={(e) => setEditPriority(e.target.value as string)}
                  className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="must">Must Have</option>
                  <option value="should">Should Have</option>
                  <option value="could">Could Have</option>
                  <option value="wont">Won't Have</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Complexity</label>
                <select
                  value={editComplexity as string}
                  onChange={(e) => setEditComplexity(e.target.value as string)}
                  className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editCategory as string}
                  onChange={(e) => setEditCategory(e.target.value as string)}
                  className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="both">Both</option>
                  <option value="ai-assisted">AI-Assisted</option>
                  <option value="api-required">API Required</option>
                </select>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Description */}
            <div className="text-xs text-gray-700 leading-relaxed">
              {description || 'No description provided'}
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              <div className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </div>
              <div className={`text-xs px-2 py-0.5 rounded-full border ${complexityColor}`}>
                {complexity.charAt(0).toUpperCase() + complexity.slice(1)} complexity
              </div>
              {node.metadata?.category && (
                <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  {node.metadata.category.charAt(0).toUpperCase() + node.metadata.category.slice(1)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feature Breakdown Section */}
      <div className="px-3 pb-3 mt-2">
        {/* Feature Breakdown Header - styled like the sidebar */}
        <div className="flex items-center justify-between mb-2 bg-blue-100 p-2 rounded-t-lg border-b border-blue-200">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
            <Box className="w-3 h-3" />
            <span>Feature Breakdown</span>
          </div>
          
          {isEditing && (
            <button
              onClick={generateSubFeatures}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Sparkles className="w-3 h-3" />
              Auto-Generate
            </button>
          )}
        </div>
        
        {/* Sub-features Content */}
        <div className="space-y-1 bg-blue-50 p-2 rounded-b-lg">
          {isEditing ? (
            <div className="space-y-1">
              {/* Editable Sub-features */}
              {editSubFeatures.map((subFeature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <input
                    type="text"
                    value={subFeature}
                    onChange={(e) => updateSubFeature(index, e.target.value)}
                    className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeSubFeature(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* Add new sub-feature */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                <input
                  type="text"
                  value={newSubFeature}
                  onChange={(e) => setNewSubFeature(e.target.value)}
                  placeholder="Add sub-feature..."
                  className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSubFeature.trim()) {
                      addSubFeature();
                    }
                  }}
                />
                <button
                  onClick={addSubFeature}
                  disabled={!newSubFeature.trim()}
                  className={`p-1 rounded ${
                    newSubFeature.trim() ? 'text-blue-600 hover:bg-blue-100' : 'text-blue-300 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {node.subFeatures && node.subFeatures.length > 0 ? (
                node.subFeatures.map((subFeature, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-blue-700">
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></div>
                    <div>{subFeature}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-blue-400 italic">
                  No sub-features defined. Click edit to add.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Button in Footer */}
      {!isEditing && (
        <div className="absolute bottom-0 right-0 p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </button>
        </div>
      )}
    </div>
  );
};