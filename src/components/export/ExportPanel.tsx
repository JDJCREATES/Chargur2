import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Code, Figma, Copy, ExternalLink } from 'lucide-react';
import { Stage, StageData } from '../../types';

interface ExportPanelProps {
  stages: Stage[];
  stageData: StageData;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ stages, stageData }) => {
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'json' | 'figma' | 'bolt'>('bolt');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const generateBoltPrompt = () => {
    const ideationData = stageData['ideation-discovery'] || {};
    const uxFlowData = stageData['ux-flow-structure'] || {};
    
    const prompt = `Create a ${ideationData.targetPlatform || 'web'} application for ${ideationData.appCategory || 'productivity'}.

App Concept: ${ideationData.appIdea || 'A modern application'}

Key Requirements:
- Platform: ${ideationData.targetPlatform || 'Web'}
- Category: ${ideationData.appCategory || 'Productivity'}
- Monetization: ${ideationData.monetization || 'Freemium'}
- Navigation: ${uxFlowData.navigationStyle || 'Bottom tabs'}
- Complexity: ${uxFlowData.userFlowComplexity || 'Standard'}

Features to Include:
${ideationData.includeAuth ? '- User authentication and profiles' : ''}
${ideationData.includePayments ? '- Payment processing integration' : ''}
${ideationData.includeAI ? '- AI/ML powered features' : ''}
${uxFlowData.includeOnboarding ? '- User onboarding flow' : ''}
${uxFlowData.includeSettings ? '- Settings and preferences' : ''}

Technical Specifications:
- Use React with TypeScript
- Implement responsive design with Tailwind CSS
- Use Lucide React for icons
- Include proper error handling and loading states
- Follow modern web development best practices
- Ensure accessibility compliance

Please create a fully functional application with:
1. Clean, modern UI design
2. Proper component structure
3. State management
4. Responsive layout
5. Interactive features
6. Professional styling

Make it production-ready with attention to detail, smooth animations, and excellent user experience.`;

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const exportFormats = [
    {
      id: 'bolt',
      label: 'Bolt.new Prompt',
      icon: Code,
      description: 'Generate optimized prompt for Bolt.new',
      color: 'blue',
    },
    {
      id: 'markdown',
      label: 'Markdown Report',
      icon: FileText,
      description: 'Comprehensive project documentation',
      color: 'green',
    },
    {
      id: 'json',
      label: 'JSON Export',
      icon: Download,
      description: 'Raw project data for integration',
      color: 'purple',
    },
    {
      id: 'figma',
      label: 'Figma Handoff',
      icon: Figma,
      description: 'Design specifications for Figma',
      color: 'orange',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Export & Handoff</h3>
        <p className="text-sm text-gray-600">Export your project in various formats</p>
      </div>

      {/* Export Format Selection */}
      <div className="grid grid-cols-2 gap-3">
        {exportFormats.map((format) => (
          <button
            key={format.id}
            onClick={() => setSelectedFormat(format.id as any)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedFormat === format.id
                ? `border-${format.color}-200 bg-${format.color}-50`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <format.icon className={`w-4 h-4 ${
                selectedFormat === format.id ? `text-${format.color}-600` : 'text-gray-600'
              }`} />
              <span className="font-medium text-sm text-gray-800">{format.label}</span>
            </div>
            <p className="text-xs text-gray-600">{format.description}</p>
          </button>
        ))}
      </div>

      {/* Bolt.new Prompt Generator */}
      {selectedFormat === 'bolt' && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Bolt.new Prompt</h4>
            <button
              onClick={generateBoltPrompt}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Prompt
            </button>
          </div>
          
          {generatedPrompt && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-md p-3 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{generatedPrompt}</pre>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generatedPrompt)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
                <a
                  href="https://bolt.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Bolt.new
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Export Options */}
      {selectedFormat !== 'bolt' && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🚧</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Coming Soon</h4>
            <p className="text-sm text-gray-600">
              {exportFormats.find(f => f.id === selectedFormat)?.label} export is under development
            </p>
          </div>
        </div>
      )}
    </div>
  );
};