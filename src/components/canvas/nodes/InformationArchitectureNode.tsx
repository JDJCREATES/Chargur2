import React, { useState } from 'react';
import { Layers, Database, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

interface Screen {
  id: string;
  name: string;
  type: 'core' | 'secondary' | 'modal';
}

interface DataModel {
  id: string;
  name: string;
  fields: string[];
  relations?: string[];
}

const InformationArchitectureNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    screens: true,
    dataModels: true
  });

  const toggleSection = (section: 'screens' | 'dataModels') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extract screens and data models from node data
  const screens: Screen[] = data?.screens || [];
  const dataModels: DataModel[] = data?.dataModels || [];

  const getScreenTypeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'secondary': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'modal': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />

      <div className={`
        relative w-full h-full bg-white 
        rounded-lg shadow-md border-2 transition-all duration-300 overflow-hidden
        ${selected ? 'border-blue-400 shadow-lg' : 'border-blue-200'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-sm text-blue-800">Information Architecture</h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100% - 50px)' }}>
          {/* Screens Section */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between cursor-pointer mb-2" 
              onClick={() => toggleSection('screens')}
            >
              <div className="flex items-center gap-2">
                {expandedSections.screens ? 
                  <ChevronDown className="w-4 h-4 text-blue-600" /> : 
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                }
                <h4 className="font-medium text-sm text-blue-700">Core Screens</h4>
              </div>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {screens.length}
              </span>
            </div>
            
            {expandedSections.screens && (
              <div className="space-y-2">
                {screens.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {screens.map((screen) => (
                      <div 
                        key={screen.id} 
                        className={`px-2 py-1 rounded-md border text-xs ${getScreenTypeColor(screen.type)}`}
                      >
                        {screen.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No screens defined yet</div>
                )}
              </div>
            )}
          </div>

          {/* Data Models Section */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer mb-2" 
              onClick={() => toggleSection('dataModels')}
            >
              <div className="flex items-center gap-2">
                {expandedSections.dataModels ? 
                  <ChevronDown className="w-4 h-4 text-blue-600" /> : 
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                }
                <h4 className="font-medium text-sm text-blue-700">Data Models</h4>
              </div>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {dataModels.length}
              </span>
            </div>
            
            {expandedSections.dataModels && (
              <div className="space-y-2">
                {dataModels.length > 0 ? (
                  dataModels.map((model) => (
                    <div key={model.id} className="bg-blue-50 rounded-md p-2 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-xs text-blue-700">{model.name}</span>
                      </div>
                      <div className="pl-5 text-xs text-blue-600">
                        <div className="flex flex-wrap gap-1">
                          {model.fields.slice(0, 5).map((field, index) => (
                            <span key={index} className="bg-white px-1.5 py-0.5 rounded border border-blue-100">
                              {field}
                            </span>
                          ))}
                          {model.fields.length > 5 && (
                            <span className="text-blue-500">+{model.fields.length - 5} more</span>
                          )}
                        </div>
                        
                        {model.relations && model.relations.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-blue-700">Relations: </span>
                            {model.relations.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">No data models defined yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InformationArchitectureNode;