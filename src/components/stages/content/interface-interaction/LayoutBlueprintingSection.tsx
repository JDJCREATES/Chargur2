import React from 'react';
import { Layout, Plus, Grid, Monitor, Tablet, Smartphone, Layers } from 'lucide-react';
import { LayoutBlock } from '../../../../types';

interface LayoutBlueprintingSectionProps {
  previewMode: string;
  layoutBlocks: LayoutBlock[];
  onUpdatePreviewMode: (mode: string) => void;
  onAddLayoutBlock?: () => void;
  onAddLofiLayoutNode?: () => void;
}

export const LayoutBlueprintingSection: React.FC<LayoutBlueprintingSectionProps> = ({
  previewMode,
  layoutBlocks,
  onUpdatePreviewMode,
  onAddLayoutBlock,
  onAddLofiLayoutNode
}) => {
  return (
    <div className="space-y-4">
      {/* Viewport Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preview Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'desktop', label: 'Desktop', icon: Monitor },
            { value: 'tablet', label: 'Tablet', icon: Tablet },
            { value: 'mobile', label: 'Mobile', icon: Smartphone },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => onUpdatePreviewMode(mode.value)}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  previewMode === mode.value
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Canvas */}
      <div className="bg-gray-100 rounded-lg p-4 min-h-64 relative">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-800">Layout Canvas</h4>
          <div className="flex gap-2">
            <button
              onClick={onAddLofiLayoutNode}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Layers className="w-3 h-3" />
              Add Lo-fi Layout
            </button>
          </div>
        </div>
        
        {/* Information about Lo-fi Layouts */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-2">Lo-fi Layout Nodes</h4>
          <p className="text-sm text-blue-700 mb-3">
            Lo-fi layout nodes allow you to create and visualize screen layouts directly on the canvas.
            Click the "Add Lo-fi Layout" button to create a new layout node.
          </p>
          <div className="text-xs text-blue-600">
            <p>• Choose from 10 predefined layout templates</p>
            <p>• Customize layouts by adding and moving cards</p>
            <p>• Preview layouts in desktop, tablet, and mobile views</p>
            <p>• Connect layouts to other nodes to show relationships</p>
          </div>
        </div>
      </div>
    </div>
  );
};