import { useState, useCallback, useEffect } from 'react';
import { Stage, StageData, Project, Connection } from '../types';
import { supabase } from '../lib/auth/supabase';
import { useAuth } from './useAuth';
import { CanvasNodeData } from '../components/canvas/CanvasNode';
import { debounce } from '../utils/debounce';

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
  const { user } = useAuth();
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [currentStageId, setCurrentStageId] = useState<string>('ideation-discovery');
  const [stageData, setStageData] = useState<StageData>({});
  const [projectId, setProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [canvasNodes, setCanvasNodes] = useState<CanvasNodeData[]>([]);
  const [canvasConnections, setCanvasConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentStage = useCallback(() => {
    return stages.find(stage => stage.id === currentStageId);
  }, [stages, currentStageId]);

  // Load project from Supabase
  const loadProject = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProjectId(data.id);
        setCurrentProject(data);
        setCurrentStageId(data.current_stage_id || 'ideation-discovery');
        setStageData(data.stage_data || {});  
        setCanvasNodes(data.canvas_nodes || []);
        setCanvasConnections(data.canvas_connections || []);
        
        // Update stages active state based on current_stage_id
        setStages(prev => prev.map(s => ({
          ...s,
          active: s.id === data.current_stage_id
        })));
        
        console.log('Project loaded successfully:', data.id);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new project
  const createAndLoadNewProject = useCallback(async (name = 'New Project', description = '') => {
    try {
      if (!user) {
        throw new Error('User must be logged in to create a project');
      }
      
      setIsLoading(true);
      setError(null);
      
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
        console.log('New project created:', data.id);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  }, [user, loadProject]);

  // Save project to Supabase (debounced)
  const saveProject = useCallback(debounce(async () => {
    try {
      if (!projectId || !user) return;
      
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
      
      console.log('Project saved successfully:', projectId);
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
      if (!user) return;
      
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
  }, [user, loadProject, createAndLoadNewProject]);

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
  };
};