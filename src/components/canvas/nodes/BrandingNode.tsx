import React, { useState, useRef, useEffect } from 'react';
import { Palette, Edit3, Check, X, Type, Square, Circle } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface BrandingData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  bodyFont: string;
  borderRadius: string;
  designSystem: string;
}

const BrandingNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BrandingData>({
    primaryColor: data?.primaryColor || '#3B82F6',
    secondaryColor: data?.secondaryColor || '#10B981',
    accentColor: data?.accentColor || '#F59E0B',
    fontFamily: data?.fontFamily || 'Inter',
    bodyFont: data?.bodyFont || 'Roboto',
    borderRadius: data?.borderRadius || 'medium',
    designSystem: data?.designSystem || 'shadcn'
  });
  
  const primaryColorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && primaryColorRef.current) {
      primaryColorRef.current.focus();
    }
  }, [isEditing]);

  // Update local state when props change
  useEffect(() => {
    setEditData({
      primaryColor: data?.primaryColor || '#3B82F6',
      secondaryColor: data?.secondaryColor || '#10B981',
      accentColor: data?.accentColor || '#F59E0B',
      fontFamily: data?.fontFamily || 'Inter',
      bodyFont: data?.bodyFont || 'Roboto',
      borderRadius: data?.borderRadius || 'medium',
      designSystem: data?.designSystem || 'shadcn'
    });
  }, [data]);

  const handleSave = () => {
    if (data?.onNodeUpdate) {
      data.onNodeUpdate(id, editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      primaryColor: data?.primaryColor || '#3B82F6',
      secondaryColor: data?.secondaryColor || '#10B981',
      accentColor: data?.accentColor || '#F59E0B',
      fontFamily: data?.fontFamily || 'Inter',
      bodyFont: data?.bodyFont || 'Roboto',
      borderRadius: data?.borderRadius || 'medium',
      designSystem: data?.designSystem || 'shadcn'
    });
    setIsEditing(false);
  };

  const designSystems = [
    { id: 'shadcn', name: 'ShadCN/UI', desc: 'Modern, accessible components' },
    { id: 'mui', name: 'Material-UI', desc: 'Google Material Design' },
    { id: 'chakra', name: 'Chakra UI', desc: 'Simple & modular components' },
    { id: 'radix', name: 'Radix UI', desc: 'Low-level UI primitives' },
    { id: 'custom', name: 'Custom Tailwind', desc: 'Pure Tailwind CSS' },
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Poppins', 'Open Sans', 'Montserrat', 'Lato', 'Raleway'
  ];

  const borderRadiusOptions = [
    { value: 'none', label: 'None' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  const getDesignSystemName = (id: string): string => {
    return designSystems.find(ds => ds.id === id)?.name || id;
  };

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />

      <div className={`
        relative bg-gradient-to-br from-purple-50 to-pink-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-purple-400 shadow-lg' : 'border-purple-200'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-purple-200 bg-purple-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            <h3 className="font-medium text-sm text-purple-800">Brand Identity</h3>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-purple-600 hover:bg-purple-100 rounded"
              title="Edit branding"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-3 whitespace-normal break-words">
          {isEditing ? (
            <div className="space-y-3">
              {/* Color Pickers */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-purple-700 mb-1">Brand Colors</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-purple-600 mb-1">Primary</label>
                    <div className="flex items-center gap-1">
                      <input
                        ref={primaryColorRef}
                        type="color"
                        value={editData.primaryColor}
                        onChange={(e) => setEditData({...editData, primaryColor: e.target.value})}
                        className="w-6 h-6 rounded border border-purple-200"
                      />
                      <input
                        type="text"
                        value={editData.primaryColor}
                        onChange={(e) => setEditData({...editData, primaryColor: e.target.value})}
                        className="flex-1 px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-purple-600 mb-1">Secondary</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={editData.secondaryColor}
                        onChange={(e) => setEditData({...editData, secondaryColor: e.target.value})}
                        className="w-6 h-6 rounded border border-purple-200"
                      />
                      <input
                        type="text"
                        value={editData.secondaryColor}
                        onChange={(e) => setEditData({...editData, secondaryColor: e.target.value})}
                        className="flex-1 px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-purple-600 mb-1">Accent</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={editData.accentColor}
                        onChange={(e) => setEditData({...editData, accentColor: e.target.value})}
                        className="w-6 h-6 rounded border border-purple-200"
                      />
                      <input
                        type="text"
                        value={editData.accentColor}
                        onChange={(e) => setEditData({...editData, accentColor: e.target.value})}
                        className="flex-1 px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-purple-700 mb-1">Typography</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-purple-600 mb-1">Heading Font</label>
                    <select
                      value={editData.fontFamily}
                      onChange={(e) => setEditData({...editData, fontFamily: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-purple-600 mb-1">Body Font</label>
                    <select
                      value={editData.bodyFont}
                      onChange={(e) => setEditData({...editData, bodyFont: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Design System & Border Radius */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-purple-600 mb-1">Design System</label>
                    <select
                      value={editData.designSystem}
                      onChange={(e) => setEditData({...editData, designSystem: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {designSystems.map(system => (
                        <option key={system.id} value={system.id}>{system.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-purple-600 mb-1">Border Radius</label>
                    <select
                      value={editData.borderRadius}
                      onChange={(e) => setEditData({...editData, borderRadius: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {borderRadiusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Color Display */}
              <div>
                <h4 className="text-xs font-medium text-purple-700 mb-2">Brand Colors</h4>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: data?.primaryColor || '#3B82F6' }}
                    ></div>
                    <span className="text-xs text-purple-600 mt-1">Primary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: data?.secondaryColor || '#10B981' }}
                    ></div>
                    <span className="text-xs text-purple-600 mt-1">Secondary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: data?.accentColor || '#F59E0B' }}
                    ></div>
                    <span className="text-xs text-purple-600 mt-1">Accent</span>
                  </div>
                </div>
              </div>

              {/* Typography Display */}
              <div>
                <h4 className="text-xs font-medium text-purple-700 mb-2">Typography</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-3 h-3 text-purple-600" />
                    <span className="text-xs text-purple-600">Heading: {data?.fontFamily || 'Inter'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Type className="w-3 h-3 text-purple-600" />
                    <span className="text-xs text-purple-600">Body: {data?.bodyFont || 'Roboto'}</span>
                  </div>
                </div>
              </div>

              {/* Design System & Border Radius Display */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Square className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600">Design: {getDesignSystemName(data?.designSystem || 'shadcn')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600">Radius: {data?.borderRadius || 'medium'}</span>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-2 pt-2 border-t border-purple-100">
                <h4 className="text-xs font-medium text-purple-700 mb-2">Preview</h4>
                <div className="p-2 bg-white rounded border border-purple-100">
                  <div className="flex gap-2 mb-2">
                    <div 
                      className="px-2 py-1 text-xs text-white rounded" 
                      style={{ backgroundColor: data?.primaryColor || '#3B82F6' }}
                    >
                      Primary Button
                    </div>
                    <div 
                      className="px-2 py-1 text-xs text-white rounded" 
                      style={{ backgroundColor: data?.secondaryColor || '#10B981' }}
                    >
                      Secondary
                    </div>
                  </div>
                  <div 
                    className="text-xs p-2 rounded border" 
                    style={{ 
                      borderColor: data?.primaryColor || '#3B82F6',
                      borderRadius: data?.borderRadius === 'large' ? '0.5rem' : 
                                   data?.borderRadius === 'medium' ? '0.375rem' : 
                                   data?.borderRadius === 'small' ? '0.25rem' : '0'
                    }}
                  >
                    <div className="font-bold mb-1" style={{ fontFamily: data?.fontFamily || 'Inter' }}>
                      Heading Text
                    </div>
                    <div style={{ fontFamily: data?.bodyFont || 'Roboto' }}>
                      Body text example
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BrandingNode;