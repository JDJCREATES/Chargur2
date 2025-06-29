import React, { useState } from 'react';
import { GitBranch, ChevronDown, ChevronRight, Code, Database, ArrowDown } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

interface StateDataFlowNodeProps extends NodeProps {
  data: {
    stateManagement: string;
    dataFlow: string;
    [key: string]: any;
  };
}

const StateDataFlowNode: React.FC<StateDataFlowNodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    stateManagement: true,
    dataFlow: true
  });

  const toggleSection = (section: 'stateManagement' | 'dataFlow') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get state management style color
  const getStateManagementColor = (style: string): string => {
    switch (style.toLowerCase()) {
      case 'local': return 'bg-green-100 text-green-700 border-green-200';
      case 'context': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'zustand': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'redux': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get state management label
  const getStateManagementLabel = (style: string): string => {
    switch (style.toLowerCase()) {
      case 'local': return 'Local State';
      case 'context': return 'React Context';
      case 'zustand': return 'Zustand';
      case 'redux': return 'Redux Toolkit';
      default: return style;
    }
  };

  // Get state management description
  const getStateManagementDescription = (style: string): string => {
    switch (style.toLowerCase()) {
      case 'local': return 'Component-level state with useState and useReducer';
      case 'context': return 'App-wide state using React Context API';
      case 'zustand': return 'Lightweight state management with minimal boilerplate';
      case 'redux': return 'Robust state management with middleware support';
      default: return 'Custom state management approach';
    }
  };

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-red-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-red-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-red-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-red-500"
      />

      <div className={`
        relative bg-white 
        rounded-lg shadow-md border-2 transition-all duration-300 overflow-hidden
        ${selected ? 'border-red-400 shadow-lg' : 'border-red-200'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 border-b border-red-100">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-sm text-red-800">State & Data Flow</h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-3 overflow-y-auto whitespace-normal break-words" style={{ maxHeight: 'calc(100% - 50px)' }}>
          {/* State Management Section */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between cursor-pointer mb-2" 
              onClick={() => toggleSection('stateManagement')}
            >
              <div className="flex items-center gap-2">
                {expandedSections.stateManagement ? 
                  <ChevronDown className="w-4 h-4 text-red-600" /> : 
                  <ChevronRight className="w-4 h-4 text-red-600" />
                }
                <h4 className="font-medium text-sm text-red-700">State Management</h4>
              </div>
            </div>
            
            {expandedSections.stateManagement && (
              <div className="space-y-2">
                {data.stateManagement ? (
                  <div className={`p-3 rounded-md border ${getStateManagementColor(data.stateManagement)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Code className="w-3 h-3" />
                        <span className="font-medium text-sm">{getStateManagementLabel(data.stateManagement)}</span>
                      </div>
                    </div>
                    <p className="text-xs">{getStateManagementDescription(data.stateManagement)}</p>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No state management approach defined yet</div>
                )}
              </div>
            )}
          </div>

          {/* Data Flow Section */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer mb-2" 
              onClick={() => toggleSection('dataFlow')}
            >
              <div className="flex items-center gap-2">
                {expandedSections.dataFlow ? 
                  <ChevronDown className="w-4 h-4 text-red-600" /> : 
                  <ChevronRight className="w-4 h-4 text-red-600" />
                }
                <h4 className="font-medium text-sm text-red-700">Data Flow Pattern</h4>
              </div>
            </div>
            
            {expandedSections.dataFlow && (
              <div className="space-y-2">
                {data.dataFlow ? (
                  <div className="bg-red-50 rounded-md p-3 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-3 h-3 text-red-600" />
                      <span className="font-medium text-xs text-red-700">Flow Pattern</span>
                    </div>
                    
                    {/* Visualize data flow as steps */}
                    <div className="space-y-2">
                      {data.dataFlow.split('→').map((step: string, index: number, array: string[]) => (
                        <React.Fragment key={index}>
                          <div className="bg-white p-2 rounded border border-red-100 text-xs text-red-700">
                            {step.trim()}
                          </div>
                          {index < array.length - 1 && (
                            <div className="flex justify-center">
                              <ArrowDown className="w-4 h-4 text-red-400" />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No data flow pattern defined yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StateDataFlowNode;