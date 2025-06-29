import React from 'react';
import { Monitor, Smartphone, Tablet, Edit3 } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

const PlatformNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const platform = data?.platform || '';
  const isPlaceholder = !platform;

  // Get platform icon and label
  const getPlatformIcon = () => {
    switch (platform) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'web':
        return <Monitor className="w-5 h-5 text-blue-600" />;
      case 'both':
        return <Tablet className="w-5 h-5 text-blue-600" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPlatformLabel = () => {
    switch (platform) {
      case 'mobile':
        return 'Mobile App';
      case 'web':
        return 'Web Application';
      case 'both':
        return 'Web & Mobile';
      default:
        return 'Platform not set';
    }
  };

  const getPlatformDescription = () => {
    switch (platform) {
      case 'mobile':
        return 'Native mobile experience for iOS and Android';
      case 'web':
        return 'Browser-based application with responsive design';
      case 'both':
        return 'Cross-platform solution for web and mobile devices';
      default:
        return 'Select a target platform for your application';
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
        relative bg-gradient-to-br from-blue-50 to-cyan-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-blue-400 shadow-lg' : 'border-blue-200'}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
        {/* Main Content */}
        <div className="p-3 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            {getPlatformIcon()}
            <h3 className="font-medium text-sm text-blue-800">{getPlatformLabel()}</h3>
          </div>
          
          <p className="text-xs text-blue-600 flex-1">
            {getPlatformDescription()}
          </p>
          
          {/* Edit Button */}
          {data?.editable && (
            <div className="mt-auto pt-2 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // This would open a platform selection modal in a real implementation
                  console.log('Edit platform');
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                Change
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlatformNode;