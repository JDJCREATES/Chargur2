import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface FeatureDependencyType {
  id: string;
  featureId: string;
  dependsOn: string;
  type: 'requires' | 'enhances' | 'conflicts';
}

interface FeatureDependencyProps {
  dependency: FeatureDependencyType;
  sourceFeatureName: string;
  targetFeatureName: string;
  onRemove: (id: string) => void;
}

export const FeatureDependency: React.FC<FeatureDependencyProps> = ({
  dependency,
  sourceFeatureName,
  targetFeatureName,
  onRemove
}) => {
  // Get dependency type styling
  const getDependencyTypeStyle = (type: string) => {
    switch (type) {
      case 'requires':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'enhances':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'conflicts':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const typeStyle = getDependencyTypeStyle(dependency.type);

  return (
    <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
      <ArrowUpDown className="w-4 h-4 text-purple-600" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-700 font-medium">{sourceFeatureName}</span>
          <span className={`text-xs px-2 py-1 rounded-full border ${typeStyle}`}>
            {dependency.type}
          </span>
          <span className="text-sm text-purple-700 font-medium">{targetFeatureName}</span>
        </div>
      </div>
      <button
        onClick={() => onRemove(dependency.id)}
        className="p-1 text-red-600 hover:bg-red-50 rounded"
      >
        ×
      </button>
    </div>
  );
};