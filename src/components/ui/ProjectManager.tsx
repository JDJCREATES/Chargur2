import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ProjectCarousel } from './ProjectCarousel';

interface ProjectManagerProps {
  onClose?: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onClose }) => {
  // Replace useStageManager with useAppStore
  const {
    projectId: currentProjectId,
    currentProject,
    projects,
    isLoading,
    error,
    loadProject,
    createAndLoadNewProject,
    updateProject,
    fetchProjects
  } = useAppStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = () => {
    if (isCreating) {
      // Submit new project
      if (newProjectName.trim()) {
        createAndLoadNewProject(newProjectName.trim(), newProjectDescription.trim());
        setNewProjectName('');
        setNewProjectDescription('');
        setIsCreating(false);
        if (onClose) onClose();
      }
    } else {
      // Show create form
      setNewProjectName('New Project');
      setNewProjectDescription('');
      setIsCreating(true);
      setIsEditing(false);
    }
  };

  const handleEditProject = () => {
    if (isEditing && currentProject) {
      // Submit edit using store method
      if (updateProject) {
        updateProject(currentProject.id, {
          name: newProjectName.trim(),
          description: newProjectDescription.trim()
        });
      }
      setIsEditing(false);
    } else if (currentProject) {
      // Show edit form
      setNewProjectName(currentProject.name);
      setNewProjectDescription(currentProject.description || '');
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleSelectProject = (projectId: string) => {
    loadProject(projectId);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Project Carousel */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Your Projects</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditProject}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              title="Edit Project"
              disabled={!currentProject}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCreateProject}
              className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              title="Create New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <ProjectCarousel 
          onSelectProject={handleSelectProject}
          currentProjectId={currentProjectId}
          projects={projects}
          isLoading={isLoading}
          error={error}
        />
      </div>
      
      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || isEditing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {isCreating ? 'Create New Project' : 'Edit Project'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Awesome App"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your project"
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-md hover:bg-gray-50 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={isCreating ? handleCreateProject : handleEditProject}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-1"
                    disabled={!newProjectName.trim()}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isCreating ? 'Create' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};