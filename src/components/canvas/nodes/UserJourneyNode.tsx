import React, { useState } from 'react';
import { Workflow, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';
import { UserFlow } from '../../stages/content/structure-flow/types';

const UserJourneyNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [expandedFlows, setExpandedFlows] = useState<Record<string, boolean>>({});

  const toggleFlow = (flowId: string) => {
    setExpandedFlows(prev => ({
      ...prev,
      [flowId]: !prev[flowId]
    }));
  };

  // Extract user flows from node data
  const userFlows: UserFlow[] = data?.userFlows || [];

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />

      <div className={`
        relative bg-white 
        rounded-lg shadow-md border-2 transition-all duration-300 overflow-hidden
        ${selected ? 'border-purple-400 shadow-lg' : 'border-purple-200'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-sm text-purple-800">User Journey Map</h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100% - 50px)' }}>
          {userFlows.length > 0 ? (
            <div className="space-y-3">
              {userFlows.map((flow) => (
                <div key={flow.id} className="bg-purple-50 rounded-lg border border-purple-200">
                  <div 
                    className="flex items-center justify-between p-2 cursor-pointer"
                    onClick={() => toggleFlow(flow.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedFlows[flow.id] ? 
                        <ChevronDown className="w-4 h-4 text-purple-600" /> : 
                        <ChevronRight className="w-4 h-4 text-purple-600" />
                      }
                      <h4 className="font-medium text-sm text-purple-700">{flow.name}</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {flow.steps.length} steps
                    </span>
                  </div>
                  
                  {expandedFlows[flow.id] && (
                    <div className="p-2 pt-0">
                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        {flow.steps.map((step, index) => (
                          <React.Fragment key={index}>
                            <span className="px-2 py-1 bg-white text-xs text-purple-700 rounded border border-purple-200">
                              {step}
                            </span>
                            {index < flow.steps.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-purple-400 flex-shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      {flow.description && (
                        <div className="mt-2 text-xs text-purple-600 italic">
                          {flow.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Workflow className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="text-sm text-purple-400">No user flows defined yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserJourneyNode;