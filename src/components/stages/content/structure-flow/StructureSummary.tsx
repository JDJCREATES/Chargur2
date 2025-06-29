import React from 'react';
import { CheckCircle } from 'lucide-react';
import { FormData, Screen, DataModel, UserFlow, Component } from './types';

interface StructureSummaryProps {
  formData: FormData;
  onComplete: () => void;
}

export const StructureSummary: React.FC<StructureSummaryProps> = ({
  formData,
  onComplete
}) => {
  const generateArchitectureSummary = () => {
    // Add safe defaults for all arrays
    const screens = formData.screens || [];
    const dataModels = formData.dataModels || [];
    const userFlows = formData.userFlows || [];
    const components = formData.components || [];

    return `
*Architecture Overview*

**Screens (${screens.length}):**
${screens.map((s: Screen) => `- ${s.name} (${s.type})`).join('\n')}

**Data Models (${dataModels.length}):**
${dataModels.map((m: DataModel) => `- ${m.name}: ${m.fields.join(', ')}`).join('\n')}

**User Flows (${userFlows.length}):**
${userFlows.map((f: UserFlow) => `- ${f.name}: ${f.steps.length} steps`).join('\n')}

**Components (${components.length}):**
${components.map((c: Component) => `- <${c.name} /> (${c.type})`).join('\n')}

**State Management:** ${formData.stateManagement || 'Not specified'}

**Data Flow Pattern:** ${formData.dataFlow || 'Not specified'}
    `.trim();
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-medium text-sm text-gray-800 mb-2">Architecture Overview</h4>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateArchitectureSummary()}</pre>
      </div>
      
      <button
        onClick={onComplete}
        className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        Complete Structure & Flow
      </button>
    </div>
  );
};