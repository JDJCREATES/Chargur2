import React from 'react';
import { Lightbulb } from 'lucide-react';
import { FeaturePack } from './types';

interface FeatureCollectionProps {
  naturalLanguageFeatures: string;
  onUpdateNaturalLanguageFeatures: (value: string) => void;
  featurePacks: FeaturePack[];
  selectedFeaturePacks: string[];
  onToggleFeaturePack: (packId: string) => void;
}

export const FeatureCollection: React.FC<FeatureCollectionProps> = ({
  naturalLanguageFeatures,
  onUpdateNaturalLanguageFeatures,
  featurePacks,
  selectedFeaturePacks,
  onToggleFeaturePack
}) => {
  return (
    <div className="space-y-4">
      {/* Natural Language Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your App's Features</label>
        <textarea
          value={naturalLanguageFeatures}
          onChange={(e) => onUpdateNaturalLanguageFeatures(e.target.value)}
          placeholder="e.g., 'Users can upload case files, comment on theories, vote on solutions, and get AI-powered insights...'"
          rows={4}
          className="w-full p-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {/* Feature Packs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Common Feature Packs</label>
        <div className="grid grid-cols-2 gap-2">
          {featurePacks.map((pack) => {
            const Icon = pack.icon;
            const isSelected = selectedFeaturePacks.includes(pack.id);
            return (
              <button
                key={pack.id}
                onClick={() => onToggleFeaturePack(pack.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{pack.name}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{pack.description}</p>
                <div className="text-xs">
                  <span className="font-medium">{pack.features.length} features:</span>
                  <span className="ml-1">{pack.features.slice(0, 2).join(', ')}{pack.features.length > 2 ? '...' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};