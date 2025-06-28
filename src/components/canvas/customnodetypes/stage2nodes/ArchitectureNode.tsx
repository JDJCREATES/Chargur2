import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Monitor, Globe, Code, Box, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { CanvasNodeData } from '../../CanvasNode';

interface ArchitectureNodeProps {
  node: CanvasNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  scale: number;
}

export const ArchitectureNode: React.FC<ArchitectureNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  scale
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

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSection = (section: 'screens' | 'api' | 'components') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Update node size when expanding/collapsing
    if (newExpanded) {
      onUpdate(node.id, { size: { width: 600, height: 500 } });
    } else {
      onUpdate(node.id, { size: { width: 400, height: 300 } });
    }
  };

  // Extract architecture data from node
  const architectureData = node.metadata?.architectureData || {
    screens: [],
    apiRoutes: [],
    components: []
  };

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

  const getScreenTypeColor = (type?: string) => {
    if (!type) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    switch (type.toLowerCase()) {
      case 'core': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'secondary': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'modal': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderComponent = (component: any, depth = 0) => {
    // Handle both string and object formats
    const componentName = typeof component === 'string' ? component : component.name;
    const componentType = typeof component === 'string' ? 'ui' : component.type;
    const componentDescription = typeof component === 'string' ? undefined : component.description;
    const subComponents = typeof component === 'string' ? undefined : component.subComponents;
    
    return (
      <div key={componentName} className="mb-1">
        <div 
          className={`p-1 rounded border ${getComponentTypeColor(componentType)}`}
          style={{ marginLeft: `${depth * 8}px` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs">{`<${componentName} />`}</span>
            {componentType && (
              <span className="text-xs px-1 py-0.5 rounded-full bg-white bg-opacity-50">
                {componentType}
              </span>
            )}
          </div>
          {componentDescription && (
            <div className="text-xs mt-0.5 opacity-75">{componentDescription}</div>
          )}
        </div>
        {subComponents && subComponents.length > 0 && (
          <div className="pl-2 border-l border-dashed border-indigo-200 ml-2 mt-0.5">
            {subComponents.map((subComponent: any) => 
              renderComponent(subComponent, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      relative w-full h-full bg-white 
      rounded-lg shadow-md border-2 transition-all duration-300 overflow-hidden
      ${isSelected ? 'border-indigo-400 shadow-lg' : 'border-indigo-200'}
    `}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-2 border-b border-indigo-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="font-medium text-sm text-indigo-800">Architecture Blueprint</h3>
        </div>
        <button
          onClick={toggleExpand}
          className="p-1 hover:bg-indigo-100 rounded-full transition-colors"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? 
            <Minimize2 className="w-3 h-3 text-indigo-600" /> : 
            <Maximize2 className="w-3 h-3 text-indigo-600" />
          }
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 40px)' }}>
        {/* Screens Section */}
        <div className="mb-3 border-b border-gray-100 pb-2">
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
              <span className="text-xs font-medium text-indigo-700">Screens Layer</span>
              <span className="text-xs px-1 py-0.5 bg-indigo-100 rounded-full text-indigo-700">
                {architectureData.screens.length}
              </span>
            </div>
          </div>
          
          {expandedSections.screens && architectureData.screens.length > 0 && (
            <div className="mt-1 pl-5 space-y-1">
              {architectureData.screens.map((screen: any, index: number) => {
                // Handle both string and object formats
                const screenName = typeof screen === 'string' ? screen : screen.name;
                const screenType = typeof screen === 'string' ? undefined : screen.type;
                const screenDescription = typeof screen === 'string' ? undefined : screen.description;
                
                return (
                  <div 
                    key={index} 
                    className={`text-xs p-1 rounded border ${getScreenTypeColor(screenType)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{screenName}</span>
                      {screenType && (
                        <span className="text-xs px-1 py-0.5 rounded-full bg-white bg-opacity-50">
                          {screenType}
                        </span>
                      )}
                    </div>
                    {screenDescription && (
                      <div className="text-xs mt-0.5 opacity-75">{screenDescription}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* API Routes Section */}
        <div className="mb-3 border-b border-gray-100 pb-2">
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
              <span className="text-xs font-medium text-indigo-700">API Layer</span>
              <span className="text-xs px-1 py-0.5 bg-indigo-100 rounded-full text-indigo-700">
                {architectureData.apiRoutes.length}
              </span>
            </div>
          </div>
          
          {expandedSections.api && architectureData.apiRoutes.length > 0 && (
            <div className="mt-1 pl-5 space-y-1">
              {architectureData.apiRoutes.map((route: any, index: number) => {
                // Handle both string and object formats
                const routePath = typeof route === 'string' ? route : route.path;
                const routeMethod = typeof route === 'string' ? 'GET' : route.method;
                const routeDescription = typeof route === 'string' ? undefined : route.description;
                
                return (
                  <div 
                    key={index} 
                    className={`text-xs p-1 rounded border ${getMethodColor(routeMethod)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{routePath}</span>
                      <span className="text-xs font-bold px-1 py-0.5 rounded-full bg-white bg-opacity-50">
                        {routeMethod}
                      </span>
                    </div>
                    {routeDescription && (
                      <div className="text-xs mt-0.5 opacity-75">{routeDescription}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Components Section */}
        <div>
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
              <span className="text-xs font-medium text-indigo-700">Components Layer</span>
              <span className="text-xs px-1 py-0.5 bg-indigo-100 rounded-full text-indigo-700">
                {architectureData.components.length}
              </span>
            </div>
          </div>
          
          {expandedSections.components && architectureData.components.length > 0 && (
            <div className="mt-1 pl-5 space-y-1">
              {architectureData.components.map((component: any, index: number) => (
                <div key={index}>
                  {renderComponent(component)}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Empty State */}
        {architectureData.screens.length === 0 && 
         architectureData.apiRoutes.length === 0 && 
         architectureData.components.length === 0 && (
          <div className="text-center py-8">
            <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No architecture data</p>
            <p className="text-xs text-gray-400 mt-1">Generate from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
};