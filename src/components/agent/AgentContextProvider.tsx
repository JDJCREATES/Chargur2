/**
 * AgentContextProvider.tsx
 * 
 * Provides AI Agent context throughout the application:
 * - Manages agent state and memory across stages
 * - Handles cross-stage intelligence and suggestions
 * - Provides agent capabilities to all components
 * - Manages persistent agent memory and learning
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AgentState {
  isActive: boolean;
  currentStageId: string;
  memory: { [stageId: string]: any };
  crossStageInsights: string[];
  autoSuggestions: { [stageId: string]: any };
  learningData: { [key: string]: any };
}

interface AgentMemory {
  stageData: { [stageId: string]: any };
  completedStages: string[];
  userPreferences: { [key: string]: any };
  crossStageInsights: string[];
  lastUpdated: string;
}

interface AgentRecommendation {
  id: string;
  type: 'suggestion' | 'warning' | 'feature-pack' | 'security' | 'optimization';
  content: string;
  priority: 'low' | 'medium' | 'high';
  stageId: string;
  data?: any;
  timestamp: string;
}

interface AgentContextType {
  agentState: AgentState;
  updateAgentMemory: (stageId: string, memory: any) => void;
  addCrossStageInsight: (insight: string) => void;
  getStageRecommendations: (stageId: string) => any[];
  triggerAutoSuggestion: (stageId: string, data: any) => void;
  resetAgent: () => void;
  isAgentThinking: boolean;
  setIsAgentThinking: (thinking: boolean) => void;
  memory: AgentMemory;
  recommendations: AgentRecommendation[];
  updateMemory: (updates: Partial<AgentMemory>) => void;
  updateRecommendations: (recommendations: AgentRecommendation[]) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

interface AgentContextProviderProps {
  children: ReactNode;
}

export const AgentContextProvider: React.FC<AgentContextProviderProps> = ({ children }) => {
  const [agentState, setAgentState] = useState<AgentState>({
    isActive: true,
    currentStageId: 'ideation-discovery',
    memory: {},
    crossStageInsights: [],
    autoSuggestions: {},
    learningData: {},
  });

  const [isAgentThinking, setIsAgentThinking] = useState(false);

  const [memory, setMemory] = useState<AgentMemory>({
    stageData: {},
    completedStages: [],
    userPreferences: {},
    crossStageInsights: [],
    lastUpdated: new Date().toISOString(),
  });

  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);

  // Load agent state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('chargur-agent-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setAgentState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Failed to load agent state');
      }
    }
  }, []);

  // Save agent state to localStorage
  useEffect(() => {
    localStorage.setItem('chargur-agent-state', JSON.stringify(agentState));
  }, [agentState]);

  const updateAgentMemory = (stageId: string, memory: any) => {
    setAgentState(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        [stageId]: {
          ...prev.memory[stageId],
          ...memory,
          lastUpdated: new Date().toISOString(),
        }
      }
    }));
  };

  const addCrossStageInsight = (insight: string) => {
    setAgentState(prev => ({
      ...prev,
      crossStageInsights: [...prev.crossStageInsights, insight].slice(-10) // Keep last 10
    }));
  };

  const getStageRecommendations = (stageId: string): any[] => {
    const recommendations = [];
    
    // Cross-stage intelligence examples
    if (stageId === 'feature-planning') {
      const ideationMemory = agentState.memory['ideation-discovery'];
      if (ideationMemory?.targetUsers?.includes('mobile')) {
        recommendations.push({
          type: 'suggestion',
          content: 'Consider mobile-first features like push notifications and offline support',
          priority: 'high'
        });
      }
      
      if (ideationMemory?.appCategory === 'social') {
        recommendations.push({
          type: 'feature-pack',
          content: 'Social features pack recommended based on your app category',
          data: { suggestedPacks: ['social', 'communication'] }
        });
      }
    }

    if (stageId === 'user-auth-flow') {
      const featureMemory = agentState.memory['feature-planning'];
      if (featureMemory?.selectedFeaturePacks?.includes('commerce')) {
        recommendations.push({
          type: 'security',
          content: 'E-commerce features require enhanced security measures',
          data: { requiredSecurity: ['email-verification', 'rate-limiting', '2fa'] }
        });
      }
    }

    return recommendations;
  };

  const triggerAutoSuggestion = (stageId: string, data: any) => {
    setAgentState(prev => ({
      ...prev,
      autoSuggestions: {
        ...prev.autoSuggestions,
        [stageId]: {
          ...prev.autoSuggestions[stageId],
          ...data,
          timestamp: new Date().toISOString(),
        }
      }
    }));
  };

  const resetAgent = () => {
    setAgentState({
      isActive: true,
      currentStageId: 'ideation-discovery',
      memory: {},
      crossStageInsights: [],
      autoSuggestions: {},
      learningData: {},
    });
    localStorage.removeItem('chargur-agent-state');
  };

  const updateMemory = useCallback((updates: Partial<AgentMemory>) => {
    setMemory(prev => ({ ...prev, ...updates, lastUpdated: new Date().toISOString() }))
  }, [])

  const updateRecommendations = useCallback((newRecommendations: AgentRecommendation[]) => {
    setRecommendations(newRecommendations)
  }, [])

  const contextValue: AgentContextType = {
    agentState,
    updateAgentMemory,
    addCrossStageInsight,
    getStageRecommendations,
    triggerAutoSuggestion,
    resetAgent,
    isAgentThinking,
    setIsAgentThinking,
    memory,
    recommendations,
    updateMemory,
    updateRecommendations,
  };

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentContextProvider');
  }
  return context;
};