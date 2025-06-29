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
        <label className="block text-sm font-medium text-gray-700 mb-2">State Management Approach</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
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

      <div className="bg-red-50 rounded-lg p-3 border border-red-100 mb-3">
        <h4 className="text-sm font-medium text-red-700 mb-2">State Management Description</h4>
        <p className="text-xs text-red-600">
          {stateManagement === 'local' && 'Component-level state with useState and useReducer hooks. Best for simple apps with minimal shared state.'}
          {stateManagement === 'context' && 'App-wide state using React Context API. Good for medium complexity apps with shared state needs.'}
          {stateManagement === 'zustand' && 'Lightweight state management with minimal boilerplate. Excellent for most apps with good performance.'}
          {stateManagement === 'redux' && 'Robust state management with middleware support. Best for complex apps with extensive state requirements.'}
          {!['local', 'context', 'zustand', 'redux'].includes(stateManagement) && 'Custom state management approach.'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Flow Pattern</label>
        <input
          type="text"
          value={dataFlow}
          placeholder="e.g., User action → API call → State update → UI refresh"
          onChange={(e) => onUpdateDataFlow(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describe how data flows through your application, from user actions to UI updates.
          Use arrows (→) to separate steps in the flow.
        </p>
      </div>
    </div>
  );
};