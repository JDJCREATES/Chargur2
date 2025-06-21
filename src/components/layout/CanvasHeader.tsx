import React from 'react';
import { motion } from 'framer-motion';
import { Stage } from '../../types';

interface CanvasHeaderProps {
  currentStage?: Stage;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({ currentStage }) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {currentStage ? (
          <>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <motion.h1
                  key={currentStage.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {currentStage.title}
                </motion.h1>
                <motion.p
                  key={`${currentStage.id}-desc`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600"
                >
                  {currentStage.description}
                </motion.p>
              </div>
              
              {/* Canvas Instructions */}
              <div className="ml-6 bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-1">Spatial Design Canvas</h3>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>• Drag nodes to rearrange</div>
                  <div>• Connect ideas with link tool</div>
                  <div>• Zoom with mouse wheel</div>
                  <div>• Pan with Cmd/Ctrl + drag</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Chargur</h1>
              <p className="text-gray-600">Your AI-powered UX agent and app architecture planner</p>
            </div>
            
            {/* Canvas Instructions */}
            <div className="ml-6 bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Spatial Design Canvas</h3>
              <div className="text-xs text-blue-600 space-y-1">
                <div>• Drag nodes to rearrange</div>
                <div>• Connect ideas with link tool</div>
                <div>• Zoom with mouse wheel</div>
                <div>• Pan with Cmd/Ctrl + drag</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};