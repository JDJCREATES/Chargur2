/**
 * AgentQuickStart.tsx
 * 
 * Provides intelligent quick-start experience:
 * - Detects when user starts with "I want to build an app about..."
 * - Asks relevant follow-up questions
 * - Auto-fills initial stage data
 * - Guides user through first stage completion
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Lightbulb,
  Users,
  Target,
  Zap,
  X
} from 'lucide-react';

interface QuickStartQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  field: string;
  required: boolean;
}

interface AgentQuickStartProps {
  onComplete: (data: any) => void;
  onSkip: () => void;
  initialPrompt?: string;
}

export const AgentQuickStart: React.FC<AgentQuickStartProps> = ({
  onComplete,
  onSkip,
  initialPrompt = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [isVisible, setIsVisible] = useState(true);

  // Detect if this is an app idea prompt
  const isAppIdeaPrompt = initialPrompt.toLowerCase().includes('build an app') || 
                         initialPrompt.toLowerCase().includes('app about') ||
                         initialPrompt.toLowerCase().includes('create an app');

  const questions: QuickStartQuestion[] = [
    {
      id: 'app-idea',
      question: "Great! Tell me more about your app idea. What problem does it solve?",
      type: 'text',
      field: 'appIdea',
      required: true,
    },
    {
      id: 'app-name',
      question: "What would you like to call your app?",
      type: 'text',
      field: 'appName',
      required: true,
    },
    {
      id: 'target-users',
      question: "Who is your target audience?",
      type: 'multiselect',
      options: [
        'Students',
        'Professionals',
        'Small Business Owners',
        'Developers',
        'General Consumers',
        'Healthcare Workers',
        'Teachers',
        'Entrepreneurs',
      ],
      field: 'targetUsers',
      required: true,
    },
    {
      id: 'platform',
      question: "Which platform are you targeting?",
      type: 'select',
      options: ['Web', 'Mobile', 'Both'],
      field: 'platform',
      required: true,
    },
    {
      id: 'key-features',
      question: "What are the main features you envision?",
      type: 'multiselect',
      options: [
        'User Authentication',
        'Real-time Chat',
        'Payment Processing',
        'File Upload',
        'Social Features',
        'Analytics Dashboard',
        'Push Notifications',
        'Search & Filters',
        'Map Integration',
        'AI/ML Features',
      ],
      field: 'keyFeatures',
      required: false,
    },
  ];

  useEffect(() => {
    if (initialPrompt && isAppIdeaPrompt) {
      // Extract app idea from initial prompt
      const ideaMatch = initialPrompt.match(/(?:app about|build.*app.*about|create.*app.*about)\s+(.+)/i);
      if (ideaMatch) {
        setAnswers({ appIdea: ideaMatch[1].trim() });
        setCurrentStep(1); // Skip to app name question
      }
    }
  }, [initialPrompt, isAppIdeaPrompt]);

  if (!isVisible || !isAppIdeaPrompt) {
    return null;
  }

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.field]: value,
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      // Generate complete stage data
      const stageData = {
        appIdea: answers.appIdea || '',
        appName: answers.appName || '',
        targetUsers: Array.isArray(answers.targetUsers) ? answers.targetUsers.join(', ') : answers.targetUsers || '',
        platform: answers.platform?.toLowerCase() || 'web',
        keyFeatures: answers.keyFeatures || [],
        problemStatement: `Users need ${answers.appIdea || 'a solution'} because current options are insufficient.`,
        valueProposition: `${answers.appName || 'This app'} provides a unique solution by ${answers.appIdea || 'solving key problems'}.`,
        tagline: `${answers.appName || 'Your app'} - ${answers.appIdea?.split(' ').slice(0, 3).join(' ') || 'Innovation simplified'}`,
      };

      onComplete(stageData);
      setIsVisible(false);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
    setIsVisible(false);
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const answer = answers[currentQuestion.field];
    return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim().length > 0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Quick Start</h2>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {currentQuestion.question}
            </h3>

            {currentQuestion.type === 'text' && (
              <textarea
                value={answers[currentQuestion.field] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            )}

            {currentQuestion.type === 'select' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      answers[currentQuestion.field] === option
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multiselect' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option) => {
                  const selected = answers[currentQuestion.field]?.includes(option) || false;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        const current = answers[currentQuestion.field] || [];
                        const updated = selected
                          ? current.filter((item: string) => item !== option)
                          : [...current, option];
                        handleAnswer(updated);
                      }}
                      className={`w-full p-3 text-left border rounded-lg transition-colors flex items-center gap-2 ${
                        selected
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}>
                        {selected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip Setup
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                canProceed()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLastStep ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};