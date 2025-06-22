import React from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface UserJourneyMapProps {
  journeySteps: Array<{
    id: string;
    title: string;
    description: string;
    touchpoints: string[];
    emotions: 'positive' | 'neutral' | 'negative';
    painPoints?: string[];
  }>;
}

export const UserJourneyMap: React.FC<UserJourneyMapProps> = ({ journeySteps }) => {
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'positive': return CheckCircle;
      case 'negative': return AlertCircle;
      default: return User;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">User Journey Map</h3>
      </div>

      <div className="space-y-6">
        {journeySteps.map((step, index) => {
          const EmotionIcon = getEmotionIcon(step.emotions);
          
          return (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < journeySteps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
              )}
              
              <div className="flex gap-4">
                {/* Step Icon */}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getEmotionColor(step.emotions)}`}>
                  <EmotionIcon className="w-5 h-5" />
                </div>
                
                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800">{step.title}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      Step {index + 1}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  
                  {/* Touchpoints */}
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Touchpoints:</h5>
                    <div className="flex flex-wrap gap-1">
                      {step.touchpoints.map((touchpoint, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {touchpoint}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Pain Points */}
                  {step.painPoints && step.painPoints.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Pain Points:</h5>
                      <div className="flex flex-wrap gap-1">
                        {step.painPoints.map((pain, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded">
                            {pain}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};