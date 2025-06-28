import React from 'react';
import { GitBranch } from 'lucide-react';

interface StateDataFlowProps {
  stateManagement: string;
  dataFlow: string;
  onUpdateStateManagement: (value: string) => void;
  onUpdateDataFlow: (value: string) => void;
}

export const StateDataFlow: React.FC<StateDataFlowProps> = ({
  stateManagement,
  dataFlow,
  onUpdateStateManagement,
  onUpdateDataFlow
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">State Management Style</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'local', label: 'Local State' },
            { value: 'context', label: 'React Context' },
            { value: 'zustand', label: 'Zustand' },
            { value: 'redux', label: 'Redux Toolkit' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdateStateManagement(option.value)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                stateManagement === option.value
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Flow Pattern</label>
        <input
          type="text"
          value={dataFlow}
          onChange={(e) => onUpdateDataFlow(e.target.value)}
          placeholder="Describe your data flow..."
          className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>
  );
};