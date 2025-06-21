import React from 'react';
import { motion } from 'framer-motion';
import { Stage } from '../../../types';

interface ComingSoonContentProps {
  stage: Stage;
}

export const ComingSoonContent: React.FC<ComingSoonContentProps> = ({ stage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon</h3>
      <p className="text-gray-600 mb-4">
        <strong>{stage.title}</strong> is currently under development.
      </p>
      <p className="text-gray-500 mb-6">
        {stage.description}
      </p>
      <div className="text-sm text-gray-500">
        Stay tuned for updates
      </div>
    </motion.div>
  );
};