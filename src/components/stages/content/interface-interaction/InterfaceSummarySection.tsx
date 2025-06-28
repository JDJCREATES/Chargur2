import React from 'react';
import { CheckCircle, Download, FileText, Copy, Zap } from 'lucide-react';
import { FormData } from './types';

interface InterfaceSummaryProps {
  formData: FormData;
  onComplete: () => void;
}

export const InterfaceSummarySection: React.FC<InterfaceSummaryProps> = ({
  formData,
  onComplete
}) => {
  const generateDesignSummary = () => {
    const designSystem = {
      'shadcn': 'ShadCN/UI',
      'mui': 'Material-UI',
      'chakra': 'Chakra UI',
      'radix': 'Radix UI',
      'custom': 'Custom Tailwind'
    }[formData.selectedDesignSystem] || formData.selectedDesignSystem;

    return `
**Interface & Interaction Design Summary**

**Design System:** ${designSystem}

**Custom Branding:**
- Primary Color: ${formData.customBranding.primaryColor}
- Secondary Color: ${formData.customBranding.secondaryColor}
- Font Family: ${formData.customBranding.fontFamily}
- Border Radius: ${formData.customBranding.borderRadius}

**Layout Blocks:** ${formData.layoutBlocks.length} components arranged
**Interaction Rules:** ${formData.interactionRules.length} behaviors defined
**Copywriting Items:** ${formData.copywriting.length} text elements customized

**Navigation Behavior:**
- Sidebar: ${formData.navigationBehavior.sidebarType}
- Modal Triggers: ${formData.navigationBehavior.modalTriggers.join(', ')}
- Tab Logic: ${formData.navigationBehavior.tabLogic}
    `.trim();
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-medium text-sm text-gray-800 mb-2">Design Summary</h4>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateDesignSummary()}</pre>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Export Figma
        </button>
        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
          <FileText className="w-4 h-4" />
          Export HTML
        </button>
        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
          <Copy className="w-4 h-4" />
          Copy JSON
        </button>
        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700">
          <Zap className="w-4 h-4" />
          Send to Bolt
        </button>
      </div>
      
      <button
        onClick={onComplete}
        className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        Complete Interface & Interaction Design
      </button>
    </div>
  );
};