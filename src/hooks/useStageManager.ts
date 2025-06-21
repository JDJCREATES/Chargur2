import { useState, useCallback } from 'react';
import { Stage, StageData, Project } from '../types';

const initialStages: Stage[] = [
  {
    id: 'ideation-discovery',
    title: 'Ideation & Discovery',
    description: 'App name, tagline, mission, core problem, target users, value proposition, and competitor analysis',
    completed: false,
    active: true,
  },
  {
    id: 'feature-planning',
    title: 'Feature Planning',
    description: 'Core features (MVP), optional features (v2+), feature prioritization, and UI library support',
    completed: false,
    active: false,
  },
  {
    id: 'structure-flow',
    title: 'Structure & Flow', 
    description: 'App architecture, screens, user journeys, and component design',
    completed: false,
    active: false,
  },
  {
    id: 'interface-interaction',
    title: 'Interface & Interaction Design',
    description: 'Layout blueprints, component styling, interaction mapping, and design system integration',
    completed: false,
    active: false,
  },
  {
    id: 'architecture-design', 
    title: 'Architecture Design',
    description: 'Page structure, folder conventions, state management, data modeling, and integration points',
    completed: false,
    active: false,
  },
  {
    id: 'user-auth-flow',
    title: 'User & Auth Flow',
    description: 'Sign-up/login methods, roles/permissions, and edge-case user scenarios',
    completed: false,
    active: false,
  },
  {
    id: 'ux-review-check',
    title: 'UX Review & User Check',
    description: 'Auto-check for missing elements, progress display, and completion suggestions',
    completed: false,
    active: false,
  },
  {
    id: 'auto-prompt-engine',
    title: 'Auto-Prompt Engine',
    description: 'One-click Bolt.new prompts, frontend/backend scaffolding, and re-prompting support',
    completed: false,
    active: false,
  },
  {
    id: 'export-handoff',
    title: 'Export & Handoff',
    description: 'Export to Figma/Markdown/README, JSON artifacts, and direct Bolt scaffolding trigger',
    completed: false,
    active: false,
  },
];

export const useStageManager = () => {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [currentStageId, setCurrentStageId] = useState<string>('ideation-discovery');
  const [stageData, setStageData] = useState<StageData>({});

  const getCurrentStage = useCallback(() => {
    return stages.find(stage => stage.id === currentStageId);
  }, [stages, currentStageId]);

  const goToStage = useCallback((stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage && !stage.comingSoon) {
      setStages(prev => prev.map(s => ({
        ...s,
        active: s.id === stageId
      })));
      setCurrentStageId(stageId);
    }
  }, [stages]);

  const completeStage = useCallback((stageId: string) => {
    setStages(prev => prev.map(s => 
      s.id === stageId ? { ...s, completed: true } : s
    ));
  }, []);

  const updateStageData = useCallback((stageId: string, data: any) => {
    setStageData(prev => ({
      ...prev,
      [stageId]: { ...prev[stageId], ...data }
    }));
  }, []);

  const getStageData = useCallback((stageId: string) => {
    return stageData[stageId] || {};
  }, [stageData]);

  return {
    stages,
    currentStageId,
    currentStage: getCurrentStage(),
    stageData,
    goToStage,
    completeStage,
    updateStageData,
    getStageData,
  };
};