import React from 'react';
import { Layout, Plus, Grid, Monitor, Tablet, Smartphone } from 'lucide-react';
import { LayoutBlock } from './types';

interface LayoutBlueprintingSectionProps {
  previewMode: string;
  layoutBlocks: LayoutBlock[];
  onUpdatePreviewMode: (mode: string) => void;
  onAddLayoutBlock: () => void;
}

export const LayoutBlueprintingSection: React.FC<LayoutBlueprintingSectionProps> = ({
  previewMode,
  layoutBlocks,
  onUpdatePreviewMode,
  onAddLayoutBlock
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
              onClick={onAddLayoutBlock}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-3 h-3" />
              Add Block
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700">
              <Grid className="w-3 h-3" />
              Grid
            </button>
          </div>
        </div>
        
        {/* Simplified Layout Visualization */}
        <div className="bg-white rounded border-2 border-dashed border-gray-300 h-48 relative">
          {layoutBlocks.map((block: LayoutBlock) => (
            <div
              key={block.id}
              className={`absolute border-2 rounded flex items-center justify-center text-xs font-medium ${
                block.locked ? 'border-red-300 bg-red-50 text-red-700' : 'border-blue-300 bg-blue-50 text-blue-700'
              }`}
              style={{
                left: `${block.position.x}%`,
                top: `${block.position.y}%`,
                width: `${block.size.width}%`,
                height: `${block.size.height}%`,
              }}
            >
              <div className="flex items-center gap-1">
                {block.locked && <span className="w-3 h-3 text-red-600">🔒</span>}
                <span>{block.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};