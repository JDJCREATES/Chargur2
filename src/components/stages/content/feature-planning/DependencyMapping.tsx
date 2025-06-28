import React, { useState } from 'react';
import { GitBranch, Plus } from 'lucide-react';
import { Feature } from './types';
import { FeatureDependency, FeatureDependencyType } from './FeatureDependency';
import { v4 as uuidv4 } from 'uuid';

interface DependencyMappingProps {
  features: Feature[];
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
}

export const DependencyMapping: React.FC<DependencyMappingProps> = ({
  features,
  onUpdateFeature
}) => {
  const [newDependency, setNewDependency] = useState<{
    sourceId: string;
    targetId: string;
    type: 'requires' | 'enhances' | 'conflicts';
  }>({
    sourceId: '',
    targetId: '',
    type: 'requires'
  });

  // Get all dependencies from all features
  const getAllDependencies = () => {
    const allDependencies: Array<{
      dependency: FeatureDependencyType;
      sourceFeature: Feature;
      targetFeature: Feature;
    }> = [];

    features.forEach(feature => {
      if (feature.dependencies && feature.dependencies.length > 0) {
        feature.dependencies.forEach(dep => {
          const targetFeature = features.find(f => f.id === dep.dependsOn);
          if (targetFeature) {
            allDependencies.push({
              dependency: dep,
              sourceFeature: feature,
              targetFeature
            });
          }
        });
      }
    });

    return allDependencies;
  };

  const handleAddDependency = () => {
    if (newDependency.sourceId && newDependency.targetId && newDependency.sourceId !== newDependency.targetId) {
      const sourceFeature = features.find(f => f.id === newDependency.sourceId);
      
      if (sourceFeature) {
        const newDep: FeatureDependencyType = {
          id: uuidv4(),
          featureId: newDependency.sourceId,
          dependsOn: newDependency.targetId,
          type: newDependency.type
        };
        
        const updatedDependencies = [...(sourceFeature.dependencies || []), newDep];
        
        onUpdateFeature(newDependency.sourceId, {
          dependencies: updatedDependencies
        });
        
        // Reset form
        setNewDependency({
          sourceId: '',
          targetId: '',
          type: 'requires'
        });
      }
    }
  };

  const handleRemoveDependency = (featureId: string, dependencyId: string) => {
    const feature = features.find(f => f.id === featureId);
    
    if (feature && feature.dependencies) {
      const updatedDependencies = feature.dependencies.filter(dep => dep.id !== dependencyId);
      
      onUpdateFeature(featureId, {
        dependencies: updatedDependencies
      });
    }
  };

  const allDependencies = getAllDependencies();

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Visual links between features that depend on each other</p>
      
      {/* Add New Dependency Form */}
      <div className="bg-purple-50 rounded-lg p-4">
        <h4 className="font-medium text-sm text-purple-800 mb-3">Add Dependency</h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-purple-700 mb-1">Source Feature</label>
              <select
                value={newDependency.sourceId}
                onChange={(e) => setNewDependency({...newDependency, sourceId: e.target.value})}
                className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select feature...</option>
                {features.map(feature => (
                  <option key={feature.id} value={feature.id}>{feature.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-700 mb-1">Target Feature</label>
              <select
                value={newDependency.targetId}
                onChange={(e) => setNewDependency({...newDependency, targetId: e.target.value})}
                className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={!newDependency.sourceId}
              >
                <option value="">Select feature...</option>
                {features
                  .filter(f => f.id !== newDependency.sourceId)
                  .map(feature => (
                    <option key={feature.id} value={feature.id}>{feature.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-purple-700 mb-1">Dependency Type</label>
            <select
              value={newDependency.type}
              onChange={(e) => setNewDependency({...newDependency, type: e.target.value as 'requires' | 'enhances' | 'conflicts'})}
              className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="requires">Requires (cannot function without)</option>
              <option value="enhances">Enhances (works better with)</option>
              <option value="conflicts">Conflicts (has issues with)</option>
            </select>
          </div>
          
          <button
            onClick={handleAddDependency}
            disabled={!newDependency.sourceId || !newDependency.targetId}
            className={`flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-md transition-colors ${
              !newDependency.sourceId || !newDependency.targetId
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Plus className="w-3 h-3" />
            Add Dependency
          </button>
        </div>
      </div>

      {/* Dependency List */}
      <div className="space-y-2">
        {allDependencies.length > 0 ? (
          allDependencies.map(({ dependency, sourceFeature, targetFeature }) => (
            <FeatureDependency
              key={dependency.id}
              dependency={dependency}
              sourceFeatureName={sourceFeature.name}
              targetFeatureName={targetFeature.name}
              onRemove={() => handleRemoveDependency(sourceFeature.id, dependency.id)}
            />
          ))
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <GitBranch className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No dependencies defined yet</p>
            <p className="text-xs text-gray-400 mt-1">Add dependencies to show relationships between features</p>
          </div>
        )}
      </div>

      {/* Common Dependencies Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-4 h-4 text-yellow-600" />
          <h4 className="font-medium text-sm text-yellow-800">Common Dependencies</h4>
        </div>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Social features require Authentication</li>
          <li>• File uploads require Storage configuration</li>
          <li>• Real-time features need WebSocket setup</li>
          <li>• E-commerce requires Payment processing</li>
          <li>• Analytics enhances with User Authentication</li>
        </ul>
      </div>
    </div>
  );
};