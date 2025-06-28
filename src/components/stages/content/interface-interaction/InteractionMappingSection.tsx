import React from 'react';
import { MousePointer, Plus } from 'lucide-react';
import { InteractionRule } from './types';

interface InteractionMappingSectionProps {
  interactionRules: InteractionRule[];
  onAddInteractionRule: () => void;
  onUpdateInteractionRule: (id: string, updates: Partial<InteractionRule>) => void;
}

export const InteractionMappingSection: React.FC<InteractionMappingSectionProps> = ({
  interactionRules,
  onAddInteractionRule,
  onUpdateInteractionRule
}) => {
  const animationPresets = [
    'fade-in', 'slide-up', 'slide-down', 'scale', 'bounce', 'shake', 'pulse', 'lift'
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Define component interactions and animations</p>
        <button
          onClick={onAddInteractionRule}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-3 h-3" />
          Add Rule
        </button>
      </div>
      
      <div className="space-y-2">
        {interactionRules.map((rule: InteractionRule) => (
          <div key={rule.id} className="p-3 bg-green-50 rounded-lg">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block font-medium text-green-700 mb-1">Component</label>
                <input
                  type="text"
                  value={rule.component}
                  readOnly={true}
                  className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block font-medium text-green-700 mb-1">Trigger</label>
                <select 
                  value={rule.trigger}
                  onChange={(e) => onUpdateInteractionRule(rule.id, { trigger: e.target.value })}
                  className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500">
                  <option value="click">Click</option>
                  <option value="hover">Hover</option>
                  <option value="focus">Focus</option>
                  <option value="submit">Submit</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-green-700 mb-1">Action</label>
                <input
                  type="text"
                  value={rule.action}
                  readOnly={true}
                  className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block font-medium text-green-700 mb-1">Animation</label>
                <select 
                  value={rule.animation}
                  onChange={(e) => onUpdateInteractionRule(rule.id, { animation: e.target.value })}
                  className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500">
                  {animationPresets.map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};