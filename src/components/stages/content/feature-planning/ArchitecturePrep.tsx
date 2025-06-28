import React from 'react';
import { Layers, Zap, Monitor, Server, Code } from 'lucide-react';

interface ArchitecturePrepProps {
  architecturePrep: {
    screens: string[];
    apiRoutes: string[];
    components: string[];
  };
  onGenerateArchitecturePrep: () => void;
}

export const ArchitecturePrep: React.FC<ArchitecturePrepProps> = ({
  architecturePrep,
  onGenerateArchitecturePrep
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Generate screens, API routes, and components from features</p>
        <button
          onClick={onGenerateArchitecturePrep}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Zap className="w-3 h-3" />
          Generate
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-indigo-600" />
            <h4 className="font-medium text-sm text-indigo-800">Screens ({architecturePrep.screens.length})</h4>
          </div>
          <div className="space-y-1">
            {architecturePrep.screens.map((screen: string, index: number) => (
              <div key={index} className="text-xs bg-white rounded px-2 py-1 text-indigo-700">
                {screen}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-sm text-green-800">API Routes ({architecturePrep.apiRoutes.length})</h4>
          </div>
          <div className="space-y-1">
            {architecturePrep.apiRoutes.map((route: string, index: number) => (
              <div key={index} className="text-xs bg-white rounded px-2 py-1 text-green-700 font-mono">
                {route}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-orange-600" />
            <h4 className="font-medium text-sm text-orange-800">Components ({architecturePrep.components.length})</h4>
          </div>
          <div className="space-y-1">
            {architecturePrep.components.map((component: string, index: number) => (
              <div key={index} className="text-xs bg-white rounded px-2 py-1 text-orange-700">
                {`<${component} />`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};