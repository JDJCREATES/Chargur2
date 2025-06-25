import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Edit, Trash2, Check, X } from 'lucide-react';
import { ProjectCarousel } from './ProjectCarousel';
import { useStageManager } from '../../hooks/useStageManager';

interface ProjectManagerProps {
  onClose?: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onClose }) => {
  const { 
    loadProject, 
    createAndLoadNewProject, 
    projectId: currentProjectId,
    currentProject,
    clearCanvasData // This is now available from useStageManager
  } = useStageManager();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = async () => {
    if (isCreating) {
      // Submit new project
      if (newProjectName.trim()) {
        await createAndLoadNewProject(newProjectName.trim(), newProjectDescription.trim()); // This now handles canvas clearing internally
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

  const handleEditProject = async () => {
    if (isEditing && currentProject) {
      // Submit edit
      // This would need to be implemented in useStageManager
      // For now, we'll just close the form
      setIsEditing(false);
    } else if (currentProject) {
      // Show edit form
      setNewProjectName(currentProject.name);
      setNewProjectDescription(currentProject.description || '');
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleSelectProject = async (projectId: string) => {
    console.log('Project selected in ProjectManager:', projectId);
    // First clear the canvas to ensure a clean state
    clearCanvasData();
    // Then load the selected project
    await loadProject(projectId); // loadProject now handles canvas clearing internally
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Project Carousel */}
      <ProjectCarousel 
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        currentProjectId={currentProjectId}
      />
      
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
      
      {/* Current Project Actions */}
      {currentProject && !isCreating && !isEditing && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={handleEditProject}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Project
            </button>
            <button
              onClick={handleCreateProject}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};