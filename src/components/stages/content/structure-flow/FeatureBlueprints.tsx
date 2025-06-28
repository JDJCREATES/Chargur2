import React from 'react';
import { Component, Plus } from 'lucide-react';
import { FeatureBlueprint } from './types';

interface FeatureBlueprintsProps {
  featureBlueprints: FeatureBlueprint[];
  onAddFeatureBlueprint: () => void;
}

export const FeatureBlueprints: React.FC<FeatureBlueprintsProps> = ({
  featureBlueprints,
  onAddFeatureBlueprint
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Break down features into components and API needs</p>
        <button
          onClick={onAddFeatureBlueprint}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          <Plus className="w-3 h-3" />
          Add Blueprint
        </button>
      </div>

      {featureBlueprints.length > 0 ? (
        <div className="space-y-3">
          {featureBlueprints.map((blueprint) => (
            <div key={blueprint.id} className="bg-orange-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-orange-800 mb-2">{blueprint.name}</h4>
              <p className="text-xs text-orange-700 mb-2">{blueprint.description}</p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-orange-700">Components:</span>
                  <span className="ml-2 text-orange-600">{blueprint.components.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-orange-700">APIs:</span>
                  <span className="ml-2 text-orange-600">{blueprint.apis.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-orange-700">Context:</span>
                  <span className="ml-2 text-orange-600">{blueprint.context}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    blueprint.category === 'core' ? 'bg-orange-200 text-orange-800' :
                    blueprint.category === 'secondary' ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {blueprint.category.charAt(0).toUpperCase() + blueprint.category.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-orange-50 rounded-lg p-3">
          <h4 className="font-medium text-sm text-orange-800 mb-2">Real-time Chat Feature</h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium text-orange-700">Components:</span>
              <span className="ml-2 text-orange-600">ChatInput, MessageList, MessageBubble</span>
            </div>
            <div>
              <span className="font-medium text-orange-700">APIs:</span>
              <span className="ml-2 text-orange-600">sendMessage(), getMessages(), subscribeToChat()</span>
            </div>
            <div>
              <span className="font-medium text-orange-700">Context:</span>
              <span className="ml-2 text-orange-600">Chat page, embedded in project view</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};