import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Layers, Navigation, Workflow, Users, ArrowRight, Settings } from 'lucide-react';
import { Stage } from '../../../types';

interface UXFlowStructureProps {
  stage: Stage;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

export const UXFlowStructure: React.FC<UXFlowStructureProps> = ({
  stage,
  onComplete,
  onUpdateData,
}) => {
  const [options, setOptions] = useState({
    includeOnboarding: true,
    includeAuth: true,
    includeSettings: true,
    navigationStyle: 'bottom-tabs',
    userFlowComplexity: 'standard',
    screenDepth: 'moderate',
  });

  const handleOptionChange = (key: string, value: any) => {
    const updatedOptions = { ...options, [key]: value };
    setOptions(updatedOptions);
    onUpdateData(updatedOptions);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">UX Flow & Structure</h3>
        <p className="text-sm text-gray-600">Configure your app's navigation and user journey</p>
      </div>

      {/* Navigation Style */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-blue-600" />
          <h4 className="font-medium text-gray-800">Navigation Style</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'bottom-tabs', label: 'Bottom Tabs' },
            { value: 'side-drawer', label: 'Side Drawer' },
            { value: 'top-tabs', label: 'Top Tabs' },
            { value: 'stack-only', label: 'Stack Only' },
          ].map((nav) => (
            <button
              key={nav.value}
              onClick={() => handleOptionChange('navigationStyle', nav.value)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                options.navigationStyle === nav.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Flow Features */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-green-600" />
          <h4 className="font-medium text-gray-800">User Flow Features</h4>
        </div>
        <div className="space-y-2">
          {[
            { key: 'includeOnboarding', label: 'Include Onboarding Flow' },
            { key: 'includeAuth', label: 'Include Authentication Flow' },
            { key: 'includeSettings', label: 'Include Settings/Profile Flow' },
          ].map((feature) => (
            <label key={feature.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options[feature.key as keyof typeof options] as boolean}
                onChange={(e) => handleOptionChange(feature.key, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Flow Complexity */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="w-4 h-4 text-purple-600" />
          <h4 className="font-medium text-gray-800">Flow Complexity</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'simple', label: 'Simple' },
            { value: 'standard', label: 'Standard' },
            { value: 'complex', label: 'Complex' },
          ].map((complexity) => (
            <button
              key={complexity.value}
              onClick={() => handleOptionChange('userFlowComplexity', complexity.value)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                options.userFlowComplexity === complexity.value
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {complexity.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Depth */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-orange-600" />
          <h4 className="font-medium text-gray-800">Screen Hierarchy Depth</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'shallow', label: 'Shallow (2-3 levels)' },
            { value: 'moderate', label: 'Moderate (4-5 levels)' },
            { value: 'deep', label: 'Deep (6+ levels)' },
          ].map((depth) => (
            <button
              key={depth.value}
              onClick={() => handleOptionChange('screenDepth', depth.value)}
              className={`p-2 text-xs rounded-md border transition-colors ${
                options.screenDepth === depth.value
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {depth.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complete Button */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Generate UX Flow</h4>
            <p className="text-xs text-gray-600">AI will create your user journey maps</p>
          </div>
          <button
            onClick={onComplete}
            className="px-3 py-1.5 text-sm rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};