import React from 'react';
import { FolderTree } from 'lucide-react';
import { FileStructure } from './types';

interface ProjectFileStructureProps {
  fileStructure: FileStructure;
}

export const ProjectFileStructure: React.FC<ProjectFileStructureProps> = ({
  fileStructure
}) => {
  const renderFileStructure = (structure: FileStructure, indent: number = 0): JSX.Element[] => {
    return Object.entries(structure).flatMap(([key, value]) => {
      const elements: JSX.Element[] = [];
      
      // Add directory
      elements.push(
        <div key={key} style={{ marginLeft: `${indent * 8}px` }} className="text-green-400">
          {key}
        </div>
      );
      
      // Add subdirectories or files
      if (Array.isArray(value)) {
        // Files
        value.forEach((file, index) => {
          elements.push(
            <div key={`${key}-${index}`} style={{ marginLeft: `${(indent + 1) * 8}px` }} className="text-green-400">
              {file}
            </div>
          );
        });
      } else {
        // Subdirectories
        elements.push(...renderFileStructure(value, indent + 1));
      }
      
      return elements;
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Organized folder structure for your project</p>
      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs">
        {renderFileStructure(fileStructure)}
      </div>
    </div>
  );
};