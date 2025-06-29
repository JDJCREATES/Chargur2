import { create } from 'zustand';
import { Stage, StageData, Project } from '../types';
import { supabase } from '../lib/auth/supabase';
import { Node, Edge } from 'reactflow';
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

interface AppState {
  // State
  stages: Stage[];
  currentStageId: string;
  stageData: StageData;
  projectId: string | null;
  currentProject: Project | null;
  projects: Project[];
  canvasNodes: Node[];
  canvasConnections: Edge[];
  isLoading: boolean;
  error: string | null;
  updateProject: (projectId: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;

  
  // Computed values
  getCurrentStage: () => Stage | undefined;
  getNextStage: () => Stage | null;
  
  // Actions
  loadProject: (id: string) => Promise<void>;
  createAndLoadNewProject: (name?: string, description?: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  goToStage: (stageId: string) => void;
  completeStage: (stageId: string) => void;
  updateStageData: (stageId: string, data: any) => void;
  updateCanvasNodes: (nodes: Node[]) => void;
  updateCanvasConnections: (connections: Edge[]) => void;
  clearCanvasData: () => void;
  resetView: () => void;
  setError: (error: string | null) => void;
  initializeProject: (userId: string) => Promise<void>;

  // Agent state (add if missing)
  agentMemory: Record<string, any>;
  agentRecommendations: any[];
  isAgentThinking: boolean;
  
  // Agent actions (add if missing)
  updateAgentMemory: (stageId: string, data: any) => void;
  addCrossStageInsight: (insight: any) => void;
  getStageRecommendations: (stageId: string) => any[];
  resetAgent: () => void;
  setIsAgentThinking: (thinking: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  // Create debounced version of updateStageData
  const debouncedUpdateStageData = debounce((stageId: string, data: any) => {
    set(state => ({
      stageData: {
        ...state.stageData,
        [stageId]: { ...state.stageData[stageId], ...data }
      }
    }));
  }, 100); // Reduced from 300ms to 100ms for faster updates

  // Create debounced save function for project updates
  const debouncedSave = debounce(async () => {
    const state = get();
    if (state.projectId && state.currentProject) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({
            current_stage_id: state.currentStageId,
            stage_data: state.stageData,
            canvas_nodes: state.canvasNodes,
            canvas_connections: state.canvasConnections,
            updated_at: new Date().toISOString()
          })
          .eq('id', state.projectId);

        if (error) {
          console.error('Failed to save project:', error);
          set({ error: error.message });
        }
      } catch (err) {
        console.error('Error saving project:', err);
      }
    }
  }, 1000); // Save after 1 second of inactivity

  return {
    // Initial state
    stages: initialStages,
    currentStageId: 'ideation-discovery',
    stageData: {},
    projectId: null,
    currentProject: null,
    projects: [],
    canvasNodes: [],
    canvasConnections: [],
    isLoading: true,
    error: null,

    // Add missing agent state
    agentMemory: {},
    agentRecommendations: [],
    isAgentThinking: false,
   
    deleteProject: async (projectId: string) => {
      try {
        set({ error: null }); // Clear any existing errors
        
        // Store current state
        const state = get();
        
        // Get current user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User must be logged in to delete a project');
        }
        
        // Delete the project
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', user.id); // Ensure user can only delete their own projects

        if (error) throw error;

        // If the deleted project was the current project, clear current project state
        if (state.projectId === projectId) {
          set({
            projectId: null,
            currentProject: null,
            stageData: {},
            canvasNodes: [],
            canvasConnections: []
          });
        }

        // Refresh the projects list
        const { data: updatedProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        // Update projects in state
        set({ projects: updatedProjects || [] });
        
        // If we deleted the current project and there are other projects available,
        // automatically load the first available project
        if (state.projectId === projectId && updatedProjects && updatedProjects.length > 0) {
          console.log('Loading next available project after deletion:', updatedProjects[0].id);
          await get().loadProject(updatedProjects[0].id);
        }
        
        console.log('Project deleted successfully:', projectId);
      } catch (err) {
        console.error('Failed to delete project:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
        set({ error: errorMessage });
        
        // Optionally throw the error so the UI can handle it
        throw new Error(errorMessage);
      }
    },
    
    
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
    
    fetchProjects: async () => {
      try {
        set({ error: null }); // Clear any existing errors
        
        // Get current user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user found for fetching projects');
          set({ projects: [] });
          return;
        }
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(`Fetched ${data?.length || 0} projects for user ${user.id}`);
        set({ projects: data || [] });
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        set({ error: errorMessage });
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
          
          // Refresh the projects list
          await get().fetchProjects();
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
      // Use the debounced function
      // First update immediately for UI responsiveness
      set(state => ({
        stageData: {
          ...state.stageData,
          [stageId]: { ...state.stageData[stageId], ...data }
        }
      }));
      
      // Then use debounced save to prevent too many writes
      // Trigger save after stage data update
      debouncedSave();
    },
    
    updateCanvasNodes: (nodes: Node[]) => {
      // Directly update the nodes for immediate visual feedback
      set({ canvasNodes: nodes });
      // Trigger save after canvas update
      debouncedSave();
    },
    
    // Keep the original immediate version for when we need it
    updateStageDataImmediate: (stageId: string, data: any) => {
      set(state => ({
        stageData: {
          ...state.stageData,
          [stageId]: { ...state.stageData[stageId], ...data }
        }
      }));
    },
    
    updateCanvasConnections: (connections: Edge[]) => {
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
        
        // Fetch all user projects
        await get().fetchProjects();
        const projects = get().projects;
        
        if (projects.length > 0) {
          // User has an existing project, load it
          await get().loadProject(projects[0].id);
        } else {
          // User has no projects, but don't automatically create one
          // Just set loading to false and let the UI handle the empty state
          set({ 
            isLoading: false,
            projectId: null,
            currentProject: null
          });
        }
      } catch (err) {
        console.error('Failed to initialize project:', err);
        set({ 
          error: err instanceof Error ? err.message : 'Failed to initialize project',
          isLoading: false
        });
      }
    },
    
    updateProject: async (projectId: string, updates: { name?: string; description?: string }) => {
      try {
        set({ error: null }); // Clear any existing errors
        
        const { error } = await supabase
          .from('projects')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);

        if (error) throw error;

        // Update current project if it's the one being edited
        const currentProject = get().currentProject;
        if (currentProject && currentProject.id === projectId) {
          set({
            currentProject: {
              ...currentProject,
              ...updates,
              updated_at: new Date().toISOString()
            }
          });
        }
        
        // Refresh the projects list
        await get().fetchProjects();

        console.log('Project updated successfully:', projectId);
      } catch (err) {
        console.error('Failed to update project:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
        set({ error: errorMessage });
        
        // Optionally throw the error so the UI can handle it
        throw new Error(errorMessage);
      }
    },

    // Add missing agent actions
    updateAgentMemory: (stageId: string, data: any) => {
      set(state => ({
        agentMemory: {
          ...state.agentMemory,
          [stageId]: { ...state.agentMemory[stageId], ...data }
        }
      }));
    },
    
    addCrossStageInsight: (insight: any) => {
      set(state => ({
        agentRecommendations: [...state.agentRecommendations, insight]
      }));
    },
    
    getStageRecommendations: (stageId: string) => {
      const state = get();
      const recommendations = [];
      
      // Cross-stage intelligence
      if (stageId === 'feature-planning') {
        const ideationMemory = state.agentMemory['ideation-discovery'];
        if (ideationMemory?.targetUsers?.includes('mobile')) {
          recommendations.push({
            type: 'suggestion',
            content: 'Consider mobile-first features like push notifications',
            priority: 'high'
          });
        }
      }
      
      return recommendations;
    },
    
    resetAgent: () => {
      set({
        agentMemory: {},
        agentRecommendations: [],
        isAgentThinking: false
      });
    },
    
    setIsAgentThinking: (thinking: boolean) => {
      set({ isAgentThinking: thinking });
    },
  };
});