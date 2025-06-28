import React from 'react';
import { CheckCircle } from 'lucide-react';
import { FormData } from './types';

interface StructureSummaryProps {
  formData: FormData;
  onComplete: () => void;
}

export const StructureSummary: React.FC<StructureSummaryProps> = ({
  formData,
  onComplete
}) => {
  const generateArchitectureSummary = () => {
    return `
**Architecture Overview**

**Screens (${formData.screens.length}):**
${formData.screens.map((s) => `- ${s.name} (${s.type})`).join('\n')}

**Data Models (${formData.dataModels.length}):**
${formData.dataModels.map((m) => `- ${m.name}: ${m.fields.join(', ')}`).join('\n')}

**User Flows (${formData.userFlows.length}):**
${formData.userFlows.map((f) => `- ${f.name}: ${f.steps.length} steps`).join('\n')}

**Components (${formData.components.length}):**
${formData.components.map((c) => `- <${c.name} /> (${c.type})`).join('\n')}

**State Management:** ${formData.stateManagement}

**Data Flow Pattern:** ${formData.dataFlow}
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