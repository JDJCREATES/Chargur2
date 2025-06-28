import React from 'react';
import { Sparkles, Brain } from 'lucide-react';

interface AIEnhancementsProps {
  aiEnhancements: string[];
  onSuggestAIEnhancements: () => void;
}

export const AIEnhancements: React.FC<AIEnhancementsProps> = ({
  aiEnhancements,
  onSuggestAIEnhancements
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">AI-powered versions of your features</p>
        <button
          onClick={onSuggestAIEnhancements}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          <Brain className="w-3 h-3" />
          Suggest AI Features
        </button>
      </div>

      <div className="space-y-2">
        {aiEnhancements.map((enhancement: string, index: number) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <span className="text-sm text-pink-700">{enhancement}</span>
            <div className="ml-auto flex gap-1">
              <span className="text-xs px-2 py-1 bg-pink-200 text-pink-700 rounded">Medium</span>
              <span className="text-xs px-2 py-1 bg-pink-200 text-pink-700 rounded">High Value</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};