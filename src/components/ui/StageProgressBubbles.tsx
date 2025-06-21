import React from 'react';
import { motion } from 'framer-motion';
import { Stage } from '../../types';

interface StageProgressBubblesProps {
  stages: Stage[];
  onStageClick: (stageId: string) => void;
}

export const StageProgressBubbles: React.FC<StageProgressBubblesProps> = ({
  stages,
  onStageClick,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200">
      {stages.map((stage, index) => (
        <motion.button
          key={stage.id}
          onClick={() => onStageClick(stage.id)}
          disabled={stage.comingSoon}
          whileHover={!stage.comingSoon ? { scale: 1.05 } : {}}
          whileTap={!stage.comingSoon ? { scale: 0.95 } : {}}
          className={`
            relative flex items-center justify-center rounded-full font-medium text-sm transition-all
            ${stage.active 
              ? 'w-12 h-12 bg-blue-600 text-white shadow-lg' 
              : stage.completed
              ? 'w-10 h-10 bg-green-500 text-white'
              : stage.comingSoon
              ? 'w-10 h-10 bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'w-10 h-10 bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          title={stage.title}
        >
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: stage.active ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {index + 1}
          </motion.span>
          {stage.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white">✓</span>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
};