import React from 'react';
import { Palette, Edit3 } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

const UIStyleNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const uiStyle = data?.uiStyle || '';
  const uiStyleLabel = getUIStyleLabel(uiStyle);
  const uiStyleDesc = getUIStyleDescription(uiStyle);
  const isPlaceholder = !uiStyle;

  // Get color scheme based on UI style
  const getStyleColors = () => {
    switch (uiStyle) {
      case 'sleek-dark':
        return {
          bg: 'from-gray-800 to-gray-900',
          border: 'border-gray-700',
          text: 'text-gray-100',
          accent: 'bg-blue-500'
        };
      case 'fun-playful':
        return {
          bg: 'from-pink-100 to-purple-100',
          border: 'border-pink-300',
          text: 'text-purple-800',
          accent: 'bg-yellow-400'
        };
      case 'clean-minimal':
        return {
          bg: 'from-gray-50 to-white',
          border: 'border-gray-200',
          text: 'text-gray-800',
          accent: 'bg-blue-400'
        };
      case 'professional':
        return {
          bg: 'from-blue-50 to-gray-100',
          border: 'border-blue-200',
          text: 'text-blue-900',
          accent: 'bg-blue-600'
        };
      case 'accessible-first':
        return {
          bg: 'from-green-50 to-blue-50',
          border: 'border-green-200',
          text: 'text-green-800',
          accent: 'bg-green-500'
        };
      default:
        return {
          bg: 'from-gray-50 to-white',
          border: 'border-gray-200',
          text: 'text-gray-800',
          accent: 'bg-blue-400'
        };
    }
  };

  const colors = getStyleColors();

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-pink-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-pink-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-pink-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-pink-500"
      />

      <div className={`
        relative w-full h-full bg-gradient-to-br ${colors.bg}
        rounded-lg shadow-md border-2 ${colors.border} transition-all duration-300
        ${selected ? 'shadow-lg' : ''}
        ${isPlaceholder ? 'opacity-70' : 'opacity-100'}
      `}>
        {/* Header */}
        <div className={`flex items-center gap-2 p-3 border-b ${colors.border}`}>
          <Palette className={`w-4 h-4 ${colors.text}`} />
          <span className={`text-sm font-medium ${colors.text}`}>UI Style</span>
        </div>

        {/* Style Preview */}
        <div className="p-4">
          {isPlaceholder ? (
            <div className="text-sm text-gray-400 italic">
              No UI style selected yet
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className={`font-bold text-sm ${colors.text}`}>{uiStyleLabel}</h3>
              <p className={`text-xs opacity-80 ${colors.text}`}>{uiStyleDesc}</p>
              
              {/* Style Preview Elements */}
              <div className="flex gap-2 mt-3">
                <div className={`w-6 h-6 rounded-full ${colors.accent}`}></div>
                <div className={`w-6 h-6 rounded-full bg-opacity-70 ${colors.accent}`}></div>
                <div className={`w-6 h-6 rounded-full bg-opacity-40 ${colors.accent}`}></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {data?.editable && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // This would open a style selection modal in a real implementation
                console.log('Edit UI style');
              }}
              className={`flex items-center gap-1 text-xs ${colors.text} hover:opacity-80 transition-colors`}
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

// Helper functions to get UI style information
function getUIStyleLabel(styleId: string): string {
  const styles: Record<string, string> = {
    'sleek-dark': 'Sleek & Dark',
    'fun-playful': 'Fun & Playful',
    'clean-minimal': 'Clean & Minimal',
    'professional': 'Professional',
    'accessible-first': 'Accessible-First'
  };
  
  return styles[styleId] || 'Unknown Style';
}

function getUIStyleDescription(styleId: string): string {
  const descriptions: Record<string, string> = {
    'sleek-dark': 'Modern apps, developer tools, high-tech',
    'fun-playful': 'Consumer apps, kids, games, lifestyle',
    'clean-minimal': 'Startups, design-focused tools, UX-first apps',
    'professional': 'B2B, fintech, healthcare, enterprise',
    'accessible-first': 'Inclusive design, education, public services'
  };
  
  return descriptions[styleId] || '';
}

export default UIStyleNode;