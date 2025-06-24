import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Zap } from 'lucide-react';

interface ConversationStartersProps {
  onSelect: (starter: string) => void;
}

export const ConversationStarters: React.FC<ConversationStartersProps> = ({ onSelect }) => {
  // Extensive list of app idea starters - mix of professional, fun, and unique ideas
  const starters = [
    // Professional Ideas
    "I want to build a project management tool for remote teams",
    "Help me design a CRM for small businesses",
    "I need an inventory management system for my store",
    "Let's create a healthcare appointment scheduler",
    "I want to build an employee onboarding platform",
    "Help me design a real estate listing app",
    "I need a financial budgeting tool",
    "Let's create a legal document generator",
    "I want to build an HR management system",
    
    // Creative/Fun Ideas
    "I want to build a plant care reminder app",
    "Help me design a recipe sharing platform",
    "I need a pet adoption matchmaker",
    "Let's create a travel itinerary generator",
    "I want to build a habit tracker with gamification",
    "Help me design a fantasy sports league manager",
    "I need a collaborative playlist maker",
    "Let's create a digital time capsule app",
    "I want to build a dream journal with AI analysis",
    
    // Unique/Niche Ideas
    "I want to build an app for finding quiet workspaces",
    "Help me design a tool for indie game developers",
    "I need an app for coordinating neighborhood events",
    "Let's create a platform for bartering skills",
    "I want to build a sustainable fashion marketplace",
    "Help me design a tool for urban gardeners",
    "I need an app for tracking wildlife sightings",
    "Let's create a platform for micro-volunteering",
    "I want to build a tool for collaborative fiction writing",
    
    // Tech-Focused Ideas
    "I want to build an AI-powered content moderator",
    "Help me design a no-code automation builder",
    "I need a blockchain-based voting system",
    "Let's create a privacy-focused social network",
    "I want to build a cross-platform notification manager",
    "Help me design a developer portfolio generator",
    "I need a tool for API testing and documentation",
    "Let's create a data visualization dashboard",
    
    // Educational Ideas
    "I want to build a language learning app with spaced repetition",
    "Help me design a platform for peer tutoring",
    "I need an interactive coding tutorial system",
    "Let's create a flashcard app with AI-generated questions",
    "I want to build a tool for teachers to create lesson plans",
    
    // Health & Wellness
    "I want to build a meditation timer with progress tracking",
    "Help me design a nutrition planning app",
    "I need a workout routine generator",
    "Let's create a mental health check-in journal",
    "I want to build a sleep quality tracker"
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-2"
      >
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-800">What would you like to build?</h3>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {starters.slice(0, 4).map((starter, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.03 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(starter)}
            className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full border border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-purple-100 transition-all shadow-sm"
          >
            {starter}
          </motion.button>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <button
          onClick={() => {
            // Show a different set of starters each time
            const randomStarter = starters[Math.floor(Math.random() * starters.length)];
            onSelect(randomStarter);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>Surprise me!</span>
        </button>
      </motion.div>
    </div>
  );
};