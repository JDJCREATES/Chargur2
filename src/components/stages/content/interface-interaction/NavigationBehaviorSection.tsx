import React from 'react';
import { Navigation } from 'lucide-react';

interface NavigationBehaviorProps {
  navigationBehavior: {
    sidebarType: string;
    modalTriggers: string[];
    tabLogic: string;
  };
  onUpdateNavigationBehavior: (updates: Partial<{ sidebarType: string; modalTriggers: string[]; tabLogic: string }>) => void;
}

export const NavigationBehaviorSection: React.FC<NavigationBehaviorProps> = ({
  navigationBehavior,
  onUpdateNavigationBehavior
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'persistent', label: 'Persistent' },
              { value: 'collapsible', label: 'Collapsible' },
              { value: 'off-canvas', label: 'Off-Canvas' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => onUpdateNavigationBehavior({ sidebarType: type.value })}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  navigationBehavior.sidebarType === type.value
                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tab Logic</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'wizard-steps', label: 'Wizard Steps' },
              { value: 'free-navigation', label: 'Free Navigation' },
            ].map((logic) => (
              <button
                key={logic.value}
                onClick={() => onUpdateNavigationBehavior({ tabLogic: logic.value })}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  navigationBehavior.tabLogic === logic.value
                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {logic.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};