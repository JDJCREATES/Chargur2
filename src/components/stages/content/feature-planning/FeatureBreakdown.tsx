import React from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Feature, FeaturePack } from './types';

interface FeatureBreakdownProps {
  selectedFeaturePacks: string[];
  featurePacks: FeaturePack[];
  customFeatures: Feature[];
  onAddCustomFeature: () => void;
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
  onRemoveFeature: (featureId: string) => void;
}

export const FeatureBreakdown: React.FC<FeatureBreakdownProps> = ({
  selectedFeaturePacks,
  featurePacks,
  customFeatures,
  onAddCustomFeature,
  onUpdateFeature,
  onRemoveFeature
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Break down high-level features into sub-features</p>
        <button
          onClick={onAddCustomFeature}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-3 h-3" />
          Add Custom Feature
        </button>
      </div>

      {/* Selected Feature Packs Breakdown */}
      {selectedFeaturePacks.map((packId: string) => {
        const pack = featurePacks.find(p => p.id === packId);
        if (!pack) return null;
        
        return (
          <div key={packId} className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <pack.icon className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-sm text-blue-800">{pack.name}</h4>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {pack.features.map((feature: string, index: number) => (
                <div key={index} className="text-xs bg-white rounded px-2 py-1 text-blue-700">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Custom Features */}
      <div className="space-y-2">
        {customFeatures.map((feature: Feature) => (
          <div key={feature.id} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={feature.name}
                onChange={(e) => onUpdateFeature(feature.id, { name: e.target.value })}
                className="font-medium text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
              />
              <button
                onClick={() => onRemoveFeature(feature.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            
            <textarea
              value={feature.description}
              onChange={(e) => onUpdateFeature(feature.id, { description: e.target.value })}
              placeholder="Describe this feature..."
              rows={2}
              className="w-full p-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
            />

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={feature.type}
                  onChange={(e) => onUpdateFeature(feature.id, { type: e.target.value as Feature['type'] })}
                  className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="core">Core</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="optional">Optional</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={feature.category}
                  onChange={(e) => onUpdateFeature(feature.id, { category: e.target.value as Feature['category'] })}
                  className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="both">Both</option>
                  <option value="ai-assisted">AI-Assisted</option>
                  <option value="api-required">API Required</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Complexity</label>
                <select
                  value={feature.complexity}
                  onChange={(e) => onUpdateFeature(feature.id, { complexity: e.target.value as Feature['complexity'] })}
                  className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            {/* Sub-features section */}
            {feature.subFeatures && feature.subFeatures.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-1">Sub-features:</div>
                <div className="space-y-1">
                  {feature.subFeatures.map((subFeature, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                      <div className="text-gray-600">{subFeature}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};