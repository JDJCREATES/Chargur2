import React from 'react';
import { motion } from 'framer-motion';
import { Stage } from '../../types';

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
  const sizeClasses = {
    sm: {
      bubble: 'w-8 h-8',
      activeBubble: 'w-10 h-10',
      text: 'text-xs',
      checkmark: 'w-3 h-3',
      gap: 'gap-2',
    },
    md: {
      bubble: 'w-10 h-10',
      activeBubble: 'w-12 h-12',
      text: 'text-sm',
      checkmark: 'w-4 h-4',
      gap: 'gap-2',
    },
    lg: {
      bubble: 'w-12 h-12',
      activeBubble: 'w-14 h-14',
      text: 'text-base',
      checkmark: 'w-5 h-5',
      gap: 'gap-3',
    },
  };

  const containerClasses = orientation === 'vertical' 
    ? `flex flex-col ${sizeClasses[size].gap}` 
    : `flex flex-wrap ${sizeClasses[size].gap}`;

  return (
    <div className={containerClasses}>
      {stages.map((stage, index) => {
        const isActive = stage.active;
        const isCompleted = stage.completed;
        
        return (
          <motion.div
            key={stage.id}
            className={orientation === 'vertical' ? 'flex items-center gap-3' : 'relative'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <motion.button
              onClick={() => onStageClick(stage.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex items-center justify-center rounded-full font-medium transition-all duration-300 group
                ${isActive 
                  ? `${sizeClasses[size].activeBubble} shadow-lg` 
                  : sizeClasses[size].bubble
                }
                ${isCompleted
                  ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md hover:shadow-lg'
                  : isActive
                  ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 hover:shadow-md'
                }
              `}
              title={stage.title}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: isCompleted 
                    ? 'linear-gradient(45deg, #10b981, #059669)' 
                    : isActive 
                    ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)'
                    : 'linear-gradient(45deg, #6b7280, #4b5563)'
                }}
              />
              
              {/* Stage number or checkmark */}
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className={`relative z-10 ${sizeClasses[size].text}`}
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className={sizeClasses[size].checkmark}
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

              {/* Completion indicator */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <span className="text-xs text-white">✓</span>
                </motion.div>
              )}

              {/* Active pulse effect */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.button>

            {/* Stage label for vertical orientation */}
            {orientation === 'vertical' && showLabels && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex-1 min-w-0"
              >
                <div className={`font-medium text-gray-800 truncate ${sizeClasses[size].text}`}>
                  {stage.title}
                </div>
              </motion.div>
            )}

            {/* Connection line for vertical orientation */}
            {orientation === 'vertical' && index < stages.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                className="absolute left-1/2 top-full w-0.5 h-4 bg-gradient-to-b from-gray-300 to-gray-200 transform -translate-x-1/2 z-0"
                style={{ marginTop: '8px', marginBottom: '8px' }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};