import React from 'react';
import { Code, Plus } from 'lucide-react';
import { Component } from './types';

interface ModularUICompositionProps {
  components: Component[];
  onAddComponent: () => void;
}

export const ModularUIComposition: React.FC<ModularUICompositionProps> = ({
  components,
  onAddComponent
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Reusable component architecture</p>
        <button
          onClick={onAddComponent}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <Plus className="w-3 h-3" />
          Add Component
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {components.map((component: Component) => (
          <div key={component.id} className="p-2 bg-teal-50 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-teal-800">{`<${component.name} />`}</span>
              <span className="text-xs px-1 py-0.5 bg-teal-200 text-teal-700 rounded">
                {component.type}
              </span>
            </div>
            <div className="text-xs text-teal-600 ml-2">
              Props: {component.props.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};