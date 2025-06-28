import React from 'react';
import { Palette } from 'lucide-react';
import { CustomBranding } from './types';

interface ComponentStylingSectionProps {
  selectedDesignSystem: string;
  customBranding: CustomBranding;
  onUpdateDesignSystem: (system: string) => void;
  onUpdateCustomBranding: (updates: Partial<CustomBranding>) => void;
}

export const ComponentStylingSection: React.FC<ComponentStylingSectionProps> = ({
  selectedDesignSystem,
  customBranding,
  onUpdateDesignSystem,
  onUpdateCustomBranding
}) => {
  const designSystems = [
    { id: 'shadcn', name: 'ShadCN/UI', desc: 'Modern, accessible components' },
    { id: 'mui', name: 'Material-UI', desc: 'Google Material Design' },
    { id: 'chakra', name: 'Chakra UI', desc: 'Simple & modular components' },
    { id: 'radix', name: 'Radix UI', desc: 'Low-level UI primitives' },
    { id: 'custom', name: 'Custom Tailwind', desc: 'Pure Tailwind CSS' },
  ];

  return (
    <div className="space-y-4">
      {/* Design System Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Design System</label>
        <div className="grid grid-cols-1 gap-2">
          {designSystems.map((system) => (
            <button
              key={system.id}
              onClick={() => onUpdateDesignSystem(system.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedDesignSystem === system.id
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">{system.name}</div>
              <div className="text-xs text-gray-500">{system.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Branding */}
      <div className="bg-purple-50 rounded-lg p-3">
        <h4 className="font-medium text-sm text-purple-800 mb-3">Custom Branding</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-purple-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customBranding.primaryColor}
                onChange={(e) => onUpdateCustomBranding({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-purple-200"
              />
              <input
                type="text"
                value={customBranding.primaryColor}
                onChange={(e) => onUpdateCustomBranding({ primaryColor: e.target.value })}
                className="flex-1 px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-purple-700 mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customBranding.secondaryColor}
                onChange={(e) => onUpdateCustomBranding({ secondaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-purple-200"
              />
              <input
                type="text"
                value={customBranding.secondaryColor}
                onChange={(e) => onUpdateCustomBranding({ secondaryColor: e.target.value })}
                className="flex-1 px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-purple-700 mb-1">Font Family</label>
            <select
              value={customBranding.fontFamily}
              onChange={(e) => onUpdateCustomBranding({ fontFamily: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Poppins">Poppins</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-purple-700 mb-1">Border Radius</label>
            <select
              value={customBranding.borderRadius}
              onChange={(e) => onUpdateCustomBranding({ borderRadius: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};