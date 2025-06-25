import { useCallback } from 'react';
import { Stage } from '../types';
import { useAppStore } from '../store/useAppStore';

/**
 * A wrapper hook around useAppStore that provides the same interface as the old useStageManager
 * This allows for a smoother transition to Zustand without changing all component interfaces
 */
export const useStageManager = () => {
  const {
    // State
    stages,
    currentStageId,
    stageData,
    projectId,
    currentProject,
    canvasNodes,
    canvasConnections,
    isLoading,
    error,
    
    // Computed values
    getCurrentStage,
    getNextStage,
    
    // Actions
    loadProject,
    createAndLoadNewProject,
    goToStage,
    completeStage,
    updateStageData,
    updateCanvasNodes,
    updateCanvasConnections,
    clearCanvasData
  } = useAppStore();

  // Get current stage (for backward compatibility)
  const currentStage = getCurrentStage();

  // Get stage data for a specific stage (for backward compatibility)
  const getStageData = useCallback((stageId: string) => {
    return stageData[stageId] || {};
  }, [stageData]);

  return {
    stages,
    currentStageId,
    currentStage,
    stageData,
    projectId,
    currentProject,
    canvasNodes,
    canvasConnections,
    isLoading,
    error,
    goToStage,
    completeStage,
    updateStageData,
    getStageData,
    getNextStage,
    loadProject,
    createAndLoadNewProject,
    updateCanvasNodes,
    updateCanvasConnections,
    clearCanvasData,
  };
};