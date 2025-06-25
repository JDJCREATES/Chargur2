import { useState, useCallback, useEffect } from 'react';
import { Stage, StageData, Project, Connection } from '../types';
import { supabase } from '../lib/auth/supabase';
import { useAuth } from './useAuth'; 
import { CanvasNodeData } from '../components/canvas/CanvasNode';
import { debounce } from '../utils/debounce';

// Helper function to create empty initial state
const getEmptyCanvasState = () => ({
  nodes: [],
  connections: []
});

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
  const { user, loading: authLoading } = useAuth();
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [currentStageId, setCurrentStageId] = useState<string>('ideation-discovery');
  const [stageData, setStageData] = useState<StageData>({});
  const [projectId, setProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [canvasNodes, setCanvasNodes] = useState<CanvasNodeData[]>(getEmptyCanvasState().nodes);
  const [canvasConnections, setCanvasConnections] = useState<Connection[]>(getEmptyCanvasState().connections);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentStage = useCallback(() => {
    return stages.find(stage => stage.id === currentStageId);
  }, [stages, currentStageId]);

  // Clear canvas data (used when switching projects)
  const clearCanvasData = useCallback(() => {
    const emptyState = getEmptyCanvasState();
    console.log('Clearing canvas data');
    setCanvasNodes(emptyState.nodes);
    setCanvasConnections(emptyState.connections); 
    console.log('Canvas data cleared');
  }, []);

  // Load project from Supabase
  const loadProject = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reset canvas state before loading new project
      clearCanvasData();
      console.log('Canvas state cleared before loading project:', id);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProjectId(data.id);
        setCurrentProject(data);
        
        // Update stage data and current stage ID first
        const newStageData = data.stage_data || {};
        setStageData(newStageData);
        
        // Then update current stage ID
        const newStageId = data.current_stage_id || 'ideation-discovery';
        setCurrentStageId(newStageId);
        
        // Update stages active state
        setStages(prev => prev.map(s => ({
          ...s,
          active: s.id === newStageId,
          completed: s.id in newStageData && Object.keys(newStageData[s.id] || {}).length > 0
        })));
        
        // Update canvas data
        setCanvasNodes(data.canvas_nodes || []);
        setCanvasConnections(data.canvas_connections || []);
        console.log('Canvas data updated from project:', data.id, 'with', data.canvas_nodes?.length || 0, 'nodes');
        console.log('Project loaded successfully:', data.id, 'with', data.canvas_nodes?.length || 0, 'nodes');
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [clearCanvasData]);

  // Create a new project
  const createAndLoadNewProject = useCallback(async (name = 'New Project', description = '') => {
    try {
      if (!user || !user.id) {
        throw new Error('User must be logged in to create a project');
      }
      
      setIsLoading(true);
      setError(null);
      
      // Reset canvas state before creating new project
      clearCanvasData();
      
      const { data, error } = await supabase
        .from('projects')
        .insert({ 
          name,
          description,
          user_id: user.id,
          current_stage_id: 'ideation-discovery',
          stage_data: {},
          canvas_nodes: [],
          canvas_connections: []
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        await loadProject(data.id);
        console.log('New project created and loaded:', data.id);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  }, [user, loadProject, clearCanvasData]);

  // Save project to Supabase (debounced)
  const saveProject = useCallback(debounce(async () => {
    try {
      if (!projectId || !user) {
        console.log('Cannot save project: missing projectId or user');
        return;
      }

      if (canvasNodes.length === 0 && canvasConnections.length === 0) {
        console.log('Skipping save - empty canvas state');
      }
      
      const { error } = await supabase
        .from('projects')
        .update({
          current_stage_id: currentStageId,
          stage_data: stageData,
          canvas_nodes: canvasNodes,
          canvas_connections: canvasConnections,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      console.log('Project saved with stage data:', Object.keys(stageData));
      console.log('Project saved successfully:', projectId, 'with', canvasNodes.length, 'nodes');
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  }, 1000), [projectId, user, currentStageId, stageData, canvasNodes, canvasConnections]);

  const goToStage = useCallback((stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      setStages(prev => prev.map(s => ({
        ...s,
        active: s.id === stageId
      })));
      setCurrentStageId(stageId);
      
      // Save the updated current stage to the project
      if (projectId) {
        saveProject();
      }
    }
  }, [stages, projectId, saveProject]);

  const completeStage = useCallback((stageId: string) => {
    setStages(prev => prev.map(s => 
      s.id === stageId ? { ...s, completed: true } : s
    ));
    
    // Save the updated stages to the project
    if (projectId) {
      saveProject();
    }
  }, [projectId, saveProject]);

  const updateStageData = useCallback((stageId: string, data: any) => {
    setStageData(prev => ({
      ...prev,
      [stageId]: { ...prev[stageId], ...data }
    }));
    
    // Save the updated stage data to the project
    if (projectId) {
      saveProject();
    }
  }, [projectId, saveProject]);

  const updateCanvasNodes = useCallback((nodes: CanvasNodeData[]) => {
    setCanvasNodes(nodes);
    
    // Save the updated canvas nodes to the project
    if (projectId) {
      saveProject();
    }
  }, [projectId, saveProject]);

  const updateCanvasConnections = useCallback((connections: Connection[]) => {
    setCanvasConnections(connections);
    
    // Save the updated canvas connections to the project
    if (projectId) {
      saveProject();
    }
  }, [projectId, saveProject]);

  const getStageData = useCallback((stageId: string) => {
    return stageData[stageId] || {};
  }, [stageData]);

  const getNextStage = useCallback(() => {
    const currentIndex = stages.findIndex(s => s.id === currentStageId);
    if (currentIndex >= 0 && currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    return null;
  }, [stages, currentStageId]);

  // Initialize project on component mount
  useEffect(() => {
    const initializeProject = async () => {
      // Wait for auth to complete before proceeding
      if (authLoading) {
        console.log('Waiting for auth to complete...');
        return;
      }
      
      // If auth is complete but no user is logged in, set loading to false
      if (!user) {
        console.log('No user logged in, skipping project initialization');
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if user has any existing projects
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0 && data[0]?.id) {
          // User has an existing project, load it
          console.log('Found existing project, loading:', data[0].id);
          await loadProject(data[0].id);
        } else {
          // User has no projects, create a new one
          await createAndLoadNewProject();
        }
      } catch (err) {
        console.error('Failed to initialize project:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize project');
        setIsLoading(false);
      }
    };
    
    initializeProject();
  }, [user, authLoading, loadProject, createAndLoadNewProject]);

  return {
    stages,
    currentStageId,
    currentStage: getCurrentStage(),
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