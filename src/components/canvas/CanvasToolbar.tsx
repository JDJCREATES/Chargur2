import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Grid,
  Eye,
  Camera
} from 'lucide-react';
import { 
  GiBroom,
  GiSave,
  GiSmashArrows,
  GiCrown,
  GiQuill,
  GiThink,
  GiBullseye,
  GiPerson,
  GiDiamonds,
  GiCrossedSwords,
  GiDatabase,
  GiConversation,
  GiCube,
  GiAtom,
  GiMagicSwirl,
  GiTreeBranch,
  GiCircuitry
} from 'react-icons/gi';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { CanvasNodeData } from './CanvasNode';

interface CanvasToolbarProps {
  onAddNode: (type: CanvasNodeData['type']) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSave: () => void;
  onExport: () => void;
  onToggleGrid: () => void;
  onScreenshot: () => void;
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
  onScreenshot,
  onAutoLayout,
  onClearCanvas,
  showGrid,
  scale,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const nodeTypes = [
    // Context nodes
    { type: 'appName' as const, label: 'App Name', icon: GiCrown, color: 'text-blue-600', category: 'context' },
    { type: 'tagline' as const, label: 'Tagline', icon: GiQuill, color: 'text-purple-600', category: 'context' },
    { type: 'coreProblem' as const, label: 'Core Problem', icon: GiThink, color: 'text-orange-600', category: 'context' },
    { type: 'mission' as const, label: 'Mission', icon: GiBullseye, color: 'text-green-600', category: 'context' },
    { type: 'valueProp' as const, label: 'Value Prop', icon: GiDiamonds, color: 'text-emerald-600', category: 'context' },
    
    // User nodes
    { type: 'userPersona' as const, label: 'User Persona', icon: GiPerson, color: 'text-blue-600', category: 'user' },
    { type: 'competitor' as const, label: 'Competitor', icon: GiCrossedSwords, color: 'text-red-600', category: 'user' },
    
    // System nodes
    { type: 'ux-flow' as const, label: 'UX Flow', icon: GiPerson, color: 'text-green-600', category: 'system' },
    { type: 'system' as const, label: 'System', icon: GiDatabase, color: 'text-red-600', category: 'system' },
    { type: 'agent-output' as const, label: 'AI Output', icon: GiConversation, color: 'text-gray-600', category: 'system' },
  ];

  const layoutTools = [
    { action: onResetView, icon: RotateCcw, label: 'Reset View', active: false },
    { action: onToggleGrid, icon: Grid, label: 'Toggle Grid', active: showGrid },
    { action: onAutoLayout, icon: GiTreeBranch, label: 'Auto Layout', active: false },
  ];

  const actionTools = [
    { action: onSave, icon: GiSave, label: 'Save Canvas' },
    { action: onExport, icon: GiSmashArrows, label: 'Export Canvas' },
    { action: onScreenshot, icon: Camera, label: 'Screenshot Canvas' },
    ...(onClearCanvas ? [{ action: onClearCanvas, icon: GiBroom, label: 'Clear Canvas' }] : []),
  ];

  const handleToolAction = (action: () => void, label: string) => {
    try {
      action();
    } catch (error) {
      // Silent error handling - could add toast notification here if needed
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute bottom-2 left-4 z-20"
    >
      {/* Toggle Button - Always Visible */}
      <motion.button
        onClick={onToggleCollapse}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg mb-2"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronUp className="w-5 h-5 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Toolbar Content */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              staggerChildren: 0.05
            }}
            className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 space-y-4 min-w-64"
          >
            {/* Add Node Section - Context Nodes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-b border-gray-200 border-opacity-50"
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ChevronDown className="w-4 h-4 text-gray-500" />}
                  aria-controls="context-nodes-content"
                  id="context-nodes-header"
                >
                  <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    <GiCube className="w-3 h-3" />
                    Context Nodes
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="grid grid-cols-2 gap-1">
                    {nodeTypes
                      .filter(nodeType => nodeType.category === 'context')
                      .map((nodeType, index) => {
                        const Icon = nodeType.icon;
                        return (
                          <motion.button
                            key={nodeType.type}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToolAction(() => onAddNode(nodeType.type), `Add ${nodeType.label}`)}
                            className={`
                              flex items-center gap-1 px-2 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-all duration-200
                              ${nodeType.color} hover:shadow-sm
                            `}
                            title={`Add ${nodeType.label} node`}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="font-medium">{nodeType.label}</span>
                          </motion.button>
                        );
                      })}
                  </div>
                </AccordionDetails>
              </Accordion>
            </motion.div>
            
            {/* User Nodes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="border-b border-gray-200 border-opacity-50"
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ChevronDown size={16} />}
                  aria-controls="user-nodes-content"
                  id="user-nodes-header"
                >
                  <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    <GiPerson className="w-3 h-3" />
                    User Nodes
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="grid grid-cols-2 gap-1">
                    {nodeTypes
                      .filter(nodeType => nodeType.category === 'user')
                      .map((nodeType, index) => {
                        const Icon = nodeType.icon;
                        return (
                          <motion.button
                            key={nodeType.type}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToolAction(() => onAddNode(nodeType.type), `Add ${nodeType.label}`)}
                            className={`
                              flex items-center gap-1 px-2 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-all duration-200
                              ${nodeType.color} hover:shadow-sm
                            `}
                            title={`Add ${nodeType.label} node`}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="font-medium">{nodeType.label}</span>
                          </motion.button>
                        );
                      })}
                  </div>
                </AccordionDetails>
              </Accordion>
            </motion.div>
            
            {/* System Nodes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-b border-gray-200 border-opacity-50"
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ChevronDown size={16} />}
                  aria-controls="system-nodes-content"
                  id="system-nodes-header"
                >
                  <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    <GiDatabase className="w-3 h-3" />
                    System Nodes
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="grid grid-cols-2 gap-1">
                    {nodeTypes
                      .filter(nodeType => nodeType.category === 'system')
                      .map((nodeType, index) => {
                        const Icon = nodeType.icon;
                        return (
                          <motion.button
                            key={nodeType.type}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToolAction(() => onAddNode(nodeType.type), `Add ${nodeType.label}`)}
                            className={`
                              flex items-center gap-1 px-2 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-all duration-200
                              ${nodeType.color} hover:shadow-sm
                            `}
                            title={`Add ${nodeType.label} node`}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="font-medium">{nodeType.label}</span>
                          </motion.button>
                        );
                      })}
                  </div>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            {/* View Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-b border-gray-200 border-opacity-50 pb-3"
            >
              <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Eye className="w-3 h-3" />
                View
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToolAction(onZoomIn, 'Zoom In')}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToolAction(onZoomOut, 'Zoom Out')}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </motion.button>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded-md font-mono min-w-12 text-center"
                >
                  {Math.round(scale * 100)}%
                </motion.div>
              </div>
            </motion.div>

            {/* Layout Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-b border-gray-200 border-opacity-50 pb-3"
            >
              <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GiAtom className="w-3 h-3" />
                Layout
              </div>
              <div className="flex gap-1">
                {layoutTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.1, y: -1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToolAction(tool.action, tool.label)}
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        tool.active 
                          ? 'bg-blue-100 text-blue-600 shadow-sm' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title={tool.label}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GiMagicSwirl className="w-3 h-3" />
                Actions
              </div>
              <div className="flex gap-1">
                {actionTools.map((tool, index) => {
                  const Icon = tool.icon;
                  const isDestructive = tool.icon === GiBroom;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.1, y: -1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToolAction(tool.action, tool.label)}
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        isDestructive
                          ? 'hover:bg-red-100 text-red-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title={tool.label}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Action Buttons when toolbar is collapsed */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="absolute bottom-16 left-4 flex items-center gap-2"
        >
          {actionTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleToolAction(tool.action, tool.label)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};