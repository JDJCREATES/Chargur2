import { create } from 'zustand';
import { Stage, StageData, Project, Connection } from '../types';
import { supabase } from '../lib/auth/supabase';
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

interface AppState {
  // State
  stages: Stage[];
  currentStageId: string;
  stageData: StageData;
  projectId: string | null;
  currentProject: Project | null;
  canvasNodes: CanvasNodeData[];
  canvasConnections: Connection[];
  isLoading: boolean;
  error: string | null;
  
  // Computed values
  getCurrentStage: () => Stage | undefined;
  getNextStage: () => Stage | null;
  
  // Actions
  loadProject: (id: string) => Promise<void>;
  createAndLoadNewProject: (name?: string, description?: string) => Promise<void>;
  goToStage: (stageId: string) => void;
  completeStage: (stageId: string) => void;
  updateStageData: (stageId: string, data: any) => void;
  updateCanvasNodes: (nodes: CanvasNodeData[]) => void;
  updateCanvasConnections: (connections: Connection[]) => void;
  clearCanvasData: () => void;
  resetView: () => void;
  setError: (error: string | null) => void;
  initializeProject: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => {
  // Create a debounced save function
  const debouncedSave = debounce(async () => {
    const { projectId, currentStageId, stageData, canvasNodes, canvasConnections } = get();
    
    if (!projectId) {
      console.log('Cannot save project: missing projectId');
      return;
    }
    
    try {
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
      
      console.log('Project saved successfully:', projectId, 'with', canvasNodes.length, 'nodes');
    } catch (err) {
      console.error('Failed to save project:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to save project' });
    }
  }, 1000);
  
  return {
    // Initial state
    stages: initialStages,
    currentStageId: 'ideation-discovery',
    stageData: {},
    projectId: null,
    currentProject: null,
    canvasNodes: [],
    canvasConnections: [],
    isLoading: true,
    error: null,
    
    // Computed values
    getCurrentStage: () => {
      const { stages, currentStageId } = get();
      return stages.find(stage => stage.id === currentStageId);
    },
    
    getNextStage: () => {
      const { stages, currentStageId } = get();
      const currentIndex = stages.findIndex(s => s.id === currentStageId);
      if (currentIndex >= 0 && currentIndex < stages.length - 1) {
        return stages[currentIndex + 1];
      }
      return null;
    },
    
    // Actions
    loadProject: async (id: string) => {
      try {
        set({ isLoading: true, error: null });
        
        // Clear canvas data first
        set({ 
          canvasNodes: [],
          canvasConnections: []
        });
        console.log('Canvas state cleared before loading project:', id);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Update stage data and current stage ID first
          const newStageData = data.stage_data || {};
          const newStageId = data.current_stage_id || 'ideation-discovery';
          
          // Update stages active and completed state
          const updatedStages = initialStages.map(s => ({
            ...s,
            active: s.id === newStageId,
            completed: s.id in newStageData && Object.keys(newStageData[s.id] || {}).length > 0
          }));
          
          // Update all state at once to prevent multiple renders
          set({
            projectId: data.id,
            currentProject: data,
            stageData: newStageData,
            currentStageId: newStageId,
            stages: updatedStages,
            canvasNodes: data.canvas_nodes || [],
            canvasConnections: data.canvas_connections || [],
            isLoading: false
          });
          
          console.log('Project loaded successfully:', data.id, 'with', data.canvas_nodes?.length || 0, 'nodes');
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        set({ 
          error: err instanceof Error ? err.message : 'Failed to load project',
          isLoading: false
        });
      }
    },
    
    createAndLoadNewProject: async (name = 'New Project', description = '') => {
      try {
        set({ isLoading: true, error: null });
        
        // Get current user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User must be logged in to create a project');
        }
        
        // Clear canvas data first
        set({ 
          canvasNodes: [],
          canvasConnections: []
        });
        
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
          // Load the newly created project
          await get().loadProject(data.id);
          console.log('New project created and loaded:', data.id);
        }
      } catch (err) {
        console.error('Failed to create project:', err);
        set({ 
          error: err instanceof Error ? err.message : 'Failed to create project',
          isLoading: false
        });
      }
    },
    
    goToStage: (stageId: string) => {
      const { stages } = get();
      const stage = stages.find(s => s.id === stageId);
      
      if (stage) {
        // Update stages active state
        const updatedStages = stages.map(s => ({
          ...s,
          active: s.id === stageId
        }));
        
        set({ 
          stages: updatedStages,
          currentStageId: stageId
        });
        
        // Save the updated current stage to the project
        debouncedSave();
      }
    },
    
    completeStage: (stageId: string) => {
      const { stages } = get();
      
      // Update stages completed state
      const updatedStages = stages.map(s => 
        s.id === stageId ? { ...s, completed: true } : s
      );
      
      set({ stages: updatedStages });
      
      // Save the updated stages to the project
      debouncedSave();
    },
    
    updateStageData: (stageId: string, data: any) => {
      const { stageData } = get();
      
      // Update stage data
      const updatedStageData = {
        ...stageData,
        [stageId]: { ...stageData[stageId], ...data }
      };
      
      set({ stageData: updatedStageData });
      
      // Save the updated stage data to the project
      debouncedSave();
    },
    
    updateCanvasNodes: (nodes: CanvasNodeData[]) => {
      set({ canvasNodes: nodes });
      
      // Save the updated canvas nodes to the project
      debouncedSave();
    },
    
    updateCanvasConnections: (connections: Connection[]) => {
      set({ canvasConnections: connections });
      
      // Save the updated canvas connections to the project
      debouncedSave();
    },
    
    clearCanvasData: () => {
      console.log('Clearing canvas data in store');
      set({ 
        canvasNodes: [],
        canvasConnections: []
      });
    },
    
    resetView: () => {
      // This would be used by the canvas to reset zoom and pan
      console.log('Reset view action called (to be implemented in canvas)');
    },
    
    setError: (error: string | null) => {
      set({ error });
    },
    
    initializeProject: async (userId: string) => {
      try {
        set({ isLoading: true, error: null });
        
        // Check if user has any existing projects
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0 && data[0]?.id) {
          // User has an existing project, load it
          await get().loadProject(data[0].id);
        } else {
          // User has no projects, create a new one
          await get().createAndLoadNewProject();
        }
      } catch (err) {
        console.error('Failed to initialize project:', err);
        set({ 
          error: err instanceof Error ? err.message : 'Failed to initialize project',
          isLoading: false
        });
      }
    }
  };
});