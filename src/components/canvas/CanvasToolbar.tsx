import React from 'react';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Save, 
  Download,
  Lightbulb,
  Zap,
  Users,
  Layout,
  Database,
  MessageSquare,
  Grid,
  Move,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CanvasNodeData } from './CanvasNode';

interface CanvasToolbarProps {
  onAddNode: (type: CanvasNodeData['type']) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSave: () => void;
  onExport: () => void;
  onToggleGrid: () => void;
  onAutoLayout: () => void;
  onClearCanvas?: () => void;
  showGrid: boolean;
  scale: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddNode,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSave,
  onExport,
  onToggleGrid,
  onAutoLayout,
  onClearCanvas,
  showGrid,
  scale,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const nodeTypes = [
    { type: 'concept' as const, label: 'Concept', icon: Lightbulb, color: 'text-yellow-600' },
    { type: 'feature' as const, label: 'Feature', icon: Zap, color: 'text-blue-600' },
    { type: 'ux-flow' as const, label: 'UX Flow', icon: Users, color: 'text-green-600' },
    { type: 'wireframe' as const, label: 'Wireframe', icon: Layout, color: 'text-purple-600' },
    { type: 'system' as const, label: 'System', icon: Database, color: 'text-red-600' },
    { type: 'agent-output' as const, label: 'AI Output', icon: MessageSquare, color: 'text-gray-600' },
  ];

  return (
    <div className="absolute top-4 left-4 z-20 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 transition-all duration-300">
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-2 w-6 h-6 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      <div className={`flex flex-col gap-2 p-2 transition-all duration-300 ${isCollapsed ? 'w-0 overflow-hidden p-0' : 'w-auto'}`}>
        {/* Add Node Section */}
        <div className="border-b border-gray-200 border-opacity-50 pb-2">
          <div className="text-xs font-medium text-gray-700 mb-2">Add Node</div>
          <div className="grid grid-cols-2 gap-1">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <button
                  key={nodeType.type}
                  onClick={() => onAddNode(nodeType.type)}
                  className={`
                    flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-50 transition-colors
                    ${nodeType.color}
                  `}
                  title={`Add ${nodeType.label} node`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{nodeType.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Controls */}
        <div className="border-b border-gray-200 border-opacity-50 pb-2">
          <div className="text-xs font-medium text-gray-700 mb-2">View</div>
          <div className="flex gap-1">
            <button
              onClick={onZoomIn}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onZoomOut}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onResetView}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <div className="px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded">
              {Math.round(scale * 100)}%
            </div>
          </div>
        </div>

        {/* Layout Controls */}
        <div className="border-b border-gray-200 border-opacity-50 pb-2">
          <div className="text-xs font-medium text-gray-700 mb-2">Layout</div>
          <div className="flex gap-1">
            <button
              onClick={onToggleGrid}
              className={`p-1 rounded transition-colors ${
                showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={onAutoLayout}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Auto Layout"
            >
              <Move className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Actions</div>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Save Canvas"
            >
              <Save className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onExport}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Export Canvas"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            {onClearCanvas && (
              <button
                onClick={onClearCanvas}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Clear Canvas"
              >
                <RotateCcw className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};