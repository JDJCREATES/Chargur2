import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Feature, PriorityBucket } from './types';

interface FeaturePrioritizationProps {
  priorityBuckets: PriorityBucket[];
  customFeatures: Feature[];
  mvpMode: boolean;
  onToggleMvpMode: (value: boolean) => void;
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
}

export const FeaturePrioritization: React.FC<FeaturePrioritizationProps> = ({
  priorityBuckets,
  customFeatures,
  mvpMode,
  onToggleMvpMode,
  onUpdateFeature
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Drag features into priority buckets</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mvpMode}
            onChange={(e) => onToggleMvpMode(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          MVP Mode (Show only "Must Have")
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {priorityBuckets.map((bucket) => (
          <div key={bucket.id} className={`bg-${bucket.color}-50 border-2 border-dashed border-${bucket.color}-200 rounded-lg p-3 min-h-32`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full bg-${bucket.color}-500`}></div>
              <h4 className={`font-medium text-sm text-${bucket.color}-800`}>{bucket.label}</h4>
            </div>
            <p className={`text-xs text-${bucket.color}-600 mb-3`}>{bucket.description}</p>
            
            <div className="space-y-1">
              {customFeatures
                .filter((f: Feature) => f.priority === bucket.id)
                .map((feature: Feature) => (
                  <div key={feature.id} className={`text-xs p-2 bg-white rounded border border-${bucket.color}-200 text-${bucket.color}-700`}>
                    {feature.name}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};