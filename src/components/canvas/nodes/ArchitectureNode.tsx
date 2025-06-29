import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowDown, Monitor, Globe, Code, Box, ChevronDown, ChevronRight } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

const ArchitectureNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    screens: boolean;
    api: boolean;
    components: boolean;
  }>({
    screens: true,
    api: true,
    components: true
  });

  const toggleSection = (section: 'screens' | 'api' | 'components') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extract architecture data from node
  const architectureData = {
    screens: Array.isArray(data?.metadata?.architectureData?.screens) 
      ? data.metadata.architectureData.screens 
      : [],
    apiRoutes: Array.isArray(data?.metadata?.architectureData?.apiRoutes) 
      ? data.metadata.architectureData.apiRoutes 
      : [],
    components: Array.isArray(data?.metadata?.architectureData?.components) 
      ? data.metadata.architectureData.components 
      : []
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-yellow-100 text-yellow-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getComponentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'layout': return 'bg-purple-100 text-purple-700';
      case 'ui': return 'bg-blue-100 text-blue-700';
      case 'form': return 'bg-yellow-100 text-yellow-700';
      case 'display': return 'bg-green-100 text-green-700';
      default: return 'bg-indigo-100 text-indigo-700';
    }
  };

  const getScreenTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'core': return 'bg-blue-100 text-blue-700';
      case 'secondary': return 'bg-purple-100 text-purple-700';
      case 'modal': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderComponent = (component: any, depth = 0) => (
    <div key={component.name} className="mb-1">
      <div 
        className={`p-1 rounded ${getComponentTypeColor(component.type)} text-xs`}
        style={{ marginLeft: `${depth * 8}px` }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono">{`<${component.name} />`}</span>
          {component.type && (
            <span className="text-xs opacity-75">{component.type}</span>
          )}
        </div>
      </div>
      {component.subComponents && component.subComponents.length > 0 && (
        <div className="pl-2 border-l border-dashed border-indigo-200 ml-2 mt-0.5">
          {component.subComponents.map((subComponent: any) => 
            renderComponent(subComponent, depth + 1)
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-indigo-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-indigo-500"
      />

      <div className={`
        relative bg-white 
        rounded-lg shadow-md border-2 transition-all duration-300 overflow-hidden
        ${selected ? 'border-indigo-400 shadow-lg' : 'border-indigo-200'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-2 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-medium text-sm text-indigo-800">Architecture Blueprint</h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 40px)' }}>
          {/* Screens Section */}
          <div className="mb-2">
            <div 
              className="flex items-center gap-1 cursor-pointer" 
              onClick={() => toggleSection('screens')}
            >
              {expandedSections.screens ? 
                <ChevronDown className="w-3 h-3 text-indigo-600" /> : 
                <ChevronRight className="w-3 h-3 text-indigo-600" />
              }
              <div className="flex items-center gap-1">
                <Monitor className="w-3 h-3 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">Screens</span>
                <span className="text-xs px-1 py-0.5 bg-indigo-100 rounded-full text-indigo-700">
                  {architectureData.screens.length}
                </span>
              </div>
            </div>
            
            {expandedSections.screens && Array.isArray(architectureData.screens) && architectureData.screens.length > 0 && (
              <div className="mt-1 pl-5 space-y-1">
                {architectureData.screens.map((screen: any, index: number) => (
                  <div 
                    key={index} 
                    className={`text-xs p-1 rounded ${getScreenTypeColor(screen.type)}`}
                  >
                    <span className="font-medium">{screen.name}</span>
                    {screen.type && (
                      <span className="ml-1 opacity-75">({screen.type})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* API Routes Section */}
          <div className="mb-2">
            <div 
              className="flex items-center gap-1 cursor-pointer" 
              onClick={() => toggleSection('api')}
            >
              {expandedSections.api ? 
                <ChevronDown className="w-3 h-3 text-indigo-600" /> : 
                <ChevronRight className="w-3 h-3 text-indigo-600" />
              }
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">API Routes</span>
                <span className="text-xs px-1 py-0.5 bg-indigo-100 rounded-full text-indigo-700">
                  {architectureData.apiRoutes.length}
                </span>
              </div>
            </div>
            
            {expandedSections.api && Array.isArray(architectureData.apiRoutes) && architectureData.apiRoutes.length > 0 && (
              <div className="mt-1 pl-5 space-y-1">
                {architectureData.apiRoutes.map((route: any, index: number) => (
                  <div 
                    key={index} 
                    className={`text-xs p-1 rounded ${getMethodColor(route.method)}`}
                  >
                    <span className="font-mono">{route.path}</span>
                    {route.method && (
                      <span className="ml-1 font-bold">{route.method}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Components Section */}
          <div className="mb-2">
            <div 
              className="flex items-center gap-1 cursor-pointer" 
              onClick={() => toggleSection('components')}
            >
              {expandedSections.components ? 
                <ChevronDown className="w-3 h-3 text-indigo-600" /> : 
                <ChevronRight className="w-3 h-3 text-indigo-600" />
              }
              <div className="flex items-center gap-1">
                <Code className="w-3 h-3 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">Components</span>
                <span className="text-xs px-1 py-0.5 bg-indigo-100 rounded-full text-indigo-700">
                  {architectureData.components.length}
                </span>
              </div>
            </div>
            
            {expandedSections.components && Array.isArray(architectureData.components) && architectureData.components.length > 0 && (
              <div className="mt-1 pl-5 space-y-1">
                {architectureData.components.map((component: any) => 
                  renderComponent(component)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ArchitectureNode;