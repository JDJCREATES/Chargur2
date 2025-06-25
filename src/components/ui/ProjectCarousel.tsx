import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Folder } from 'lucide-react';
import { supabase } from '../../lib/auth/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Project } from '../../types';

interface ProjectCarouselProps {
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  currentProjectId: string | null;
}

export const ProjectCarousel: React.FC<ProjectCarouselProps> = ({
  onSelectProject,
  onCreateProject,
  currentProjectId
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();

  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        setProjects(data || []);
        
        // Find index of current project
        if (currentProjectId && data) {
          const index = data.findIndex(p => p.id === currentProjectId);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user, currentProjectId]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < projects.length - 1 ? prev + 1 : prev));
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleProjectSelect = (projectId: string) => {
    // Clear canvas before switching projects
    onSelectProject(projectId);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 text-sm">{error}</div>
        <button 
          onClick={onCreateProject}
          className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Create New Project
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Your Projects</h3>
        <button
          onClick={onCreateProject}
          className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          title="Create New Project"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Folder className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">No projects yet</p>
          <button
            onClick={onCreateProject}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Carousel Navigation */}
          {projects.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full ${
                  currentIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === projects.length - 1}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full ${
                  currentIndex === projects.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Project Cards */}
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: -currentIndex * 100 + '%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  className={`min-w-full p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                    project.id === currentProjectId
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                  onClick={() => onSelectProject(project.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="font-medium text-gray-800 mb-1 truncate">{project.name}</h4>
                  <p className="text-xs text-gray-500 mb-2 truncate">{project.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600 font-medium">
                      {getStageLabel(project.current_stage_id)}
                    </span>
                    <span className="text-gray-400">
                      {formatDate(project.updated_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots */}
          {projects.length > 1 && (
            <div className="flex justify-center mt-3 gap-1.5">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get a user-friendly stage label
function getStageLabel(stageId: string): string {
  const stageLabels: Record<string, string> = {
    'ideation-discovery': 'Ideation',
    'feature-planning': 'Features',
    'structure-flow': 'Structure',
    'interface-interaction': 'Interface',
    'architecture-design': 'Architecture',
    'user-auth-flow': 'Auth Flow',
    'ux-review-check': 'UX Review',
    'auto-prompt-engine': 'Prompts',
    'export-handoff': 'Export'
  };
  
  return stageLabels[stageId] || stageId;
}