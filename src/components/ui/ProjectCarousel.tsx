import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Folder } from 'lucide-react';
import { Project } from '../../types';


interface ProjectCarouselProps {
  onSelectProject: (projectId: string) => void;
  currentProjectId: string | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}
export const ProjectCarousel: React.FC<ProjectCarouselProps> = ({
  onSelectProject,
  currentProjectId,
  projects,
  isLoading,
  error
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Update current index when projects or currentProjectId changes
  useEffect(() => {
    if (projects.length > 0 && currentProjectId) {
      const index = projects.findIndex(p => p.id === currentProjectId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [currentProjectId, projects]);

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
        <div className="text-red-500 text-sm mb-2">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {projects.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <Folder className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No projects yet</p>
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
                  onClick={() => handleProjectSelect(project.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="font-medium text-gray-800 mb-1 truncate">{project.name}</h4>
                  <p className="text-xs text-gray-500 mb-2 truncate">{project.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-blue-600 font-medium">
                      {getStageLabel(project.current_stage_id)}
                    </span>
                    <span>
                      {formatDate(project.updated_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots */}
          {projects.length > 1 && (
            <div className="flex justify-center mt-2 gap-1">
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