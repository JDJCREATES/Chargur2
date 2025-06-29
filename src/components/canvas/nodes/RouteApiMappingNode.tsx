import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe, Monitor, ArrowRight, ChevronDown, ChevronRight, Lock, Unlock } from 'lucide-react';

interface Route {
  id: string;
  path: string;
  component: string;
  protected: boolean;
  description: string;
}

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  rateLimit: boolean;
  params: string[];
}

interface RouteApiMappingNodeData {
  route: Route;
  apiEndpoints: ApiEndpoint[];
  title?: string;
}

const RouteApiMappingNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const route: Route = data?.route || {
    id: '',
    path: '',
    component: '',
    protected: false,
    description: ''
  };
  
  const apiEndpoints: ApiEndpoint[] = data?.apiEndpoints || [];
  
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-700 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
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
        className="w-2 h-2 bg-cyan-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-cyan-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-cyan-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-cyan-500"
      />

      <div className={`
        relative w-full h-full bg-white 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-cyan-400 shadow-lg' : 'border-cyan-200'}
      `}>
        style={{ width: data.size?.width, height: data.size?.height }}
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 border-b border-cyan-100 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Monitor className="w-4 h-4 text-blue-600" />
              <Globe className="w-4 h-4 text-cyan-600" />
            </div>
            <h3 className="font-medium text-sm text-cyan-800">
              {data?.title || 'Route-API Mapping'}
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-cyan-100 rounded-full transition-colors"
          >
            {isExpanded ? 
              <ChevronDown className="w-4 h-4 text-cyan-600" /> : 
              <ChevronRight className="w-4 h-4 text-cyan-600" />
            }
          </button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-3">
            {/* Frontend Route Section */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-3 h-3 text-blue-600" />
                <h4 className="text-xs font-medium text-blue-700">Frontend Route</h4>
                {route.protected && (
                  <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Protected</span>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 rounded-md p-2 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-blue-700">{route.path || '/'}</span>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-700">{route.component || 'Component'}</span>
                </div>
                {route.description && (
                  <p className="text-xs text-blue-600 mt-1">{route.description}</p>
                )}
              </div>
            </div>
            
            {/* API Endpoints Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3 h-3 text-cyan-600" />
                <h4 className="text-xs font-medium text-cyan-700">API Endpoints</h4>
                <span className="text-xs px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">
                  {apiEndpoints.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {apiEndpoints.length > 0 ? (
                  apiEndpoints.map((endpoint) => (
                    <div 
                      key={endpoint.id} 
                      className={`p-2 rounded-md border ${getMethodColor(endpoint.method)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{endpoint.method}</span>
                          <span className="font-mono text-xs">{endpoint.path}</span>
                        </div>
                        {endpoint.auth && (
                          <Lock className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      {endpoint.description && (
                        <p className="text-xs mt-1">{endpoint.description}</p>
                      )}
                      {endpoint.params && endpoint.params.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {endpoint.params.map((param, index) => (
                            <span key={index} className="text-xs px-1.5 py-0.5 bg-white bg-opacity-50 rounded">
                              {param}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic text-center p-2 bg-gray-50 rounded-md">
                    No API endpoints associated with this route
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RouteApiMappingNode;