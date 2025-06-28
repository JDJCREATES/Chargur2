import React from 'react';
import { Workflow, Plus } from 'lucide-react';
import { UserFlow } from './types';

interface UserFlowsProps {
  userFlows: UserFlow[];
  onAddUserFlow: () => void;
}

export const UserFlows: React.FC<UserFlowsProps> = ({
  userFlows,
  onAddUserFlow
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Map out key user journeys</p>
        <button
          onClick={onAddUserFlow}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <Plus className="w-3 h-3" />
          Add Flow
        </button>
      </div>
            
      {userFlows.map((flow: UserFlow) => (
        <div key={flow.id} className="p-3 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-sm text-purple-800 mb-2">{flow.name}</h4>
          <div className="flex items-center gap-2 text-xs">
            {flow.steps.map((step: string, index: number) => (
              <React.Fragment key={index}>
                <span className="px-2 py-1 bg-white rounded text-purple-700">{step}</span>
                {index < flow.steps.length - 1 && <span className="text-purple-400">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};