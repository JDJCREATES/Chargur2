import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, ArrowRight, ArrowDown, Home, User, Settings, ShoppingCart } from 'lucide-react';

interface FlowNode {
  id: string;
  title: string;
  type: 'screen' | 'decision' | 'action';
  icon?: React.ComponentType<any>;
  children?: string[];
  position: { x: number; y: number };
}

interface AppFlowchartProps {
  nodes: FlowNode[];
  connections: Array<{ from: string; to: string; label?: string }>;
}

export const AppFlowchart: React.FC<AppFlowchartProps> = ({ nodes, connections }) => {
  const getNodeIcon = (type: string, icon?: React.ComponentType<any>) => {
    if (icon) return icon;
    
    switch (type) {
      case 'screen': return Home;
      case 'decision': return Workflow;
      case 'action': return ArrowRight;
      default: return Home;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'screen': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'decision': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'action': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-6">
        <Workflow className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">App Flowchart</h3>
      </div>

      <div className="relative min-h-96 bg-gray-50 rounded-lg p-4 overflow-auto">
        {/* Render Nodes */}
        {nodes.map((node) => {
          const NodeIcon = getNodeIcon(node.type, node.icon);
          
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`absolute w-32 h-20 rounded-lg border-2 flex flex-col items-center justify-center p-2 ${getNodeColor(node.type)}`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
            >
              <NodeIcon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">
                {node.title}
              </span>
            </motion.div>
          );
        })}

        {/* Render Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((connection, index) => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;
            
            const fromX = fromNode.position.x + 64; // Center of node
            const fromY = fromNode.position.y + 40;
            const toX = toNode.position.x + 64;
            const toY = toNode.position.y + 40;
            
            return (
              <g key={index}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {connection.label && (
                  <text
                    x={(fromX + toX) / 2}
                    y={(fromY + toY) / 2 - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {connection.label}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#9CA3AF"
              />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-200"></div>
          <span className="text-gray-600">Screens</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-200"></div>
          <span className="text-gray-600">Decisions</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-200"></div>
          <span className="text-gray-600">Actions</span>
        </div>
      </div>
    </motion.div>
  );
};