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
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Chargur</h1>
            <p className="text-gray-600">Your AI-powered UX agent and app architecture planner</p>
          </>
        )}
      </div>
    </motion.div>
  );
};