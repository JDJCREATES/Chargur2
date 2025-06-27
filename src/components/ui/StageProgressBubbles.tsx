import React from 'react';
import { motion } from 'framer-motion';
import { Stage } from '../../types'; 
import { Zap, FileText } from 'lucide-react';

interface StageProgressBubblesProps {
  stages: Stage[];
  onStageClick: (stageId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const StageProgressBubbles: React.FC<StageProgressBubblesProps> = ({
  stages,
  onStageClick,
  orientation = 'horizontal',
  size = 'md',
  showLabels = false,
}) => {
  // Only show the first 7 stages for the battery visualization
  const batteryStages = stages.slice(0, 7);
  const remainingStages = stages.slice(7);

  // Calculate completion percentage
  const completedStages = batteryStages.filter(stage => stage.completed).length;
  const completionPercentage = Math.round((completedStages / batteryStages.length) * 100);

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center gap-3`}>
      {/* Battery Container */}
      <div className="relative flex items-center">
        {/* Battery Body */}
        <div className="relative flex items-center bg-gray-200 rounded-lg border-2 border-gray-300 p-1">
          {/* Battery Stages */}
          <div className="flex gap-1">
            {batteryStages.map((stage, index) => (
              <motion.button
                key={stage.id}
                onClick={() => onStageClick(stage.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-8 h-12 rounded transition-all duration-300 border
                  ${stage.completed 
                    ? 'bg-gradient-to-r from-teal-400 to-green-500 border-teal-500 shadow-sm' 
                    : stage.active
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-500 shadow-sm'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }
                  hover:scale-105 cursor-pointer
                `}
                aria-label={`Stage ${index + 1} ${stage.completed ? 'completed' : 'pending'}`}
                title={stage.title}
              >
                {/* Stage number or checkmark */}
                <div className="h-full flex items-center justify-center">
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: stage.active ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 text-xs font-medium text-white"
                  >
                    {stage.completed ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    ) : (
                      index + 1
                    )}
                  </motion.span>
                </div>

                {/* Active indicator */}
                {stage.active && !stage.completed && (
                  <motion.div
                    className="absolute inset-0 rounded bg-blue-400"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Battery Terminal/Tip */}
        <div className="w-2 h-6 bg-gray-300 rounded-r border-r-2 border-t-2 border-b-2 border-gray-400"></div>
      </div>

      {/* Progress Info */}
      {orientation === 'horizontal' && (
        <div className="text-gray-700">
          <div className="text-sm font-semibold">{completedStages}/{batteryStages.length} Stages</div>
          <div className="text-xs text-gray-500">
            {completionPercentage}% Complete
          </div>
        </div>
      )}

      {/* Additional Buttons for Auto-Prompt and Export */}
      {remainingStages.length > 0 && (
        <div className="flex gap-2">
          <motion.button
            onClick={() => onStageClick(remainingStages[0].id)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
            title={remainingStages[0].title}
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm">Auto-Prompt</span>
          </motion.button>

          {remainingStages.length > 1 && (
            <motion.button
              onClick={() => onStageClick(remainingStages[1].id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors"
              title={remainingStages[1].title}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};