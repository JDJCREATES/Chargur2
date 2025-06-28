import React from 'react';
import { Layers, Zap, Monitor, Server, Code, ArrowDown, Database, Globe, Box } from 'lucide-react';

interface Component {
  name: string;
  type: string;
  description?: string;
  subComponents?: Component[];
}

interface Screen {
  name: string;
  type: string;
  description?: string;
}

interface ApiRoute {
  path: string;
  method: string;
  description?: string;
}

interface ArchitecturePrepProps {
  architectureData: {
    screens: Screen[];
    apiRoutes: ApiRoute[];
    components: Component[];
  };
  onGenerateArchitecturePrep: () => void;
  onSendMessage?: (message: string) => void;
}

export const ArchitecturePrep: React.FC<ArchitecturePrepProps> = ({
  architectureData,
  onGenerateArchitecturePrep,
  onSendMessage
}) => {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-700 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getComponentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'layout': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ui': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'form': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'display': return 'bg-green-100 text-green-700 border-green-200';
      case 'utility': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  const getScreenTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'core': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'secondary': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'modal': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderComponent = (component: Component, depth = 0) => (
    <div key={component.name} className="mb-2">
      <div 
        className={`p-2 rounded-md border ${getComponentTypeColor(component.type)} ${depth > 0 ? 'ml-4' : ''}`}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-3 h-3" />
            <span className="font-mono text-xs">{`<${component.name} />`}</span>
          </div>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white bg-opacity-50">
            {component.type}
          </span>
        </div>
        {component.description && (
          <div className="text-xs mt-1 opacity-75">{component.description}</div>
        )}
      </div>
      {component.subComponents && component.subComponents.length > 0 && (
        <div className="pl-4 border-l border-dashed border-indigo-200 ml-4 mt-1">
          {component.subComponents.map(subComponent => 
            renderComponent(subComponent, depth + 1)
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Generate architecture blueprint from features</p>
        <button
          onClick={onGenerateArchitecturePrep}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Zap className="w-3 h-3" />
          Generate
        </button>
      </div>

      {/* Architecture Diagram - Layered View */}
      <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-white">
        {/* Screens Layer */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-sm text-gray-800">Screens Layer</h4>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {architectureData.screens.length}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {architectureData.screens.map((screen, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md border ${getScreenTypeColor(screen.type)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs">{screen.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-white bg-opacity-50">
                    {screen.type}
                  </span>
                </div>
                {screen.description && (
                  <div className="text-xs opacity-75">{screen.description}</div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-2">
            <ArrowDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* API Routes Layer */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-sm text-gray-800">API Layer</h4>
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              {architectureData.apiRoutes.length}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {architectureData.apiRoutes.map((route, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md border ${getMethodColor(route.method)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs">{route.path}</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white bg-opacity-50">
                    {route.method}
                  </span>
                </div>
                {route.description && (
                  <div className="text-xs opacity-75">{route.description}</div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-2">
            <ArrowDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Components Layer */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-indigo-600" />
            <h4 className="font-medium text-sm text-gray-800">Components Layer</h4>
            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
              {architectureData.components.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {architectureData.components.map((component) => (
              renderComponent(component)
            ))}
          </div>
        </div>
      </div>
      
      {architectureData.screens.length === 0 && 
       architectureData.apiRoutes.length === 0 && 
       architectureData.components.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">No architecture data generated yet</p>
          <p className="text-xs text-gray-500">Click Generate to create an architecture blueprint</p>
        </div>
      )}
    </div>
  );
};