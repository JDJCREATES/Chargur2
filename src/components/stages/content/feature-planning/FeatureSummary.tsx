import React from 'react';
import { CheckCircle, Download, Workflow, Zap } from 'lucide-react';
import { Feature, FeaturePack } from './types';

interface FeatureSummaryProps {
  generateFeatureSummary: () => string;
  onComplete: () => void;
  customFeatures: Feature[];
  selectedFeaturePacks: string[];
}

export const FeatureSummary: React.FC<FeatureSummaryProps> = ({
  generateFeatureSummary,
  onComplete,
  customFeatures,
  selectedFeaturePacks
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-medium text-sm text-gray-800 mb-2">Feature Planning Summary</h4>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateFeatureSummary()}</pre>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
          <Workflow className="w-4 h-4" />
          Export Markdown
        </button>
        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700">
          <Zap className="w-4 h-4" />
          Bolt Prompt
        </button>
      </div>
      
      <button
        onClick={onComplete}
        disabled={customFeatures.length === 0 && selectedFeaturePacks.length === 0}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          customFeatures.length > 0 || selectedFeaturePacks.length > 0
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Complete Feature Planning
      </button>
    </div>
  );
};