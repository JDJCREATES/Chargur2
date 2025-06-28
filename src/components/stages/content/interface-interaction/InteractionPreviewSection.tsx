import React from 'react';
import { Eye } from 'lucide-react';

export const InteractionPreviewSection: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="bg-indigo-50 rounded-lg p-4 text-center">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Eye className="w-6 h-6 text-indigo-600" />
        </div>
        <h4 className="font-medium text-indigo-800 mb-2">High-Fidelity Preview</h4>
        <p className="text-sm text-indigo-600 mb-4">
          Preview all screens with styled components and simulated interactions
        </p>
        <div className="flex gap-2 justify-center">
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Eye className="w-4 h-4" />
            Launch Preview
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">
            <span className="w-4 h-4">✏️</span>
            Add Comments
          </button>
        </div>
      </div>
    </div>
  );
};