import React from 'react';
import { Code, Edit3 } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

const TechStackNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const techStack = data?.techStack || [];
  const isPlaceholder = !techStack.length;

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
        relative w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-indigo-400 shadow-lg' : 'border-indigo-200'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-indigo-200">
          <Code className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-800">Tech Stack</span>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {isPlaceholder ? (
            <div className="text-sm text-indigo-400 italic">
              No technologies selected yet
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <div 
                  key={index} 
                  className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                >
                  {tech}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {data?.editable && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // This would open a tech selection modal in a real implementation
                console.log('Edit tech stack');
              }}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TechStackNode;