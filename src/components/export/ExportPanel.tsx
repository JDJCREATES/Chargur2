import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Code, Figma, Copy, ExternalLink, Zap, Terminal, Sparkles, Loader } from 'lucide-react';
import { Stage, StageData } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface ExportPanelProps {
  stages: Stage[];
  stageData: StageData;
  onSendMessage?: (message: string) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ 
  stages, 
  stageData,
  onSendMessage 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'bolt' | 'markdown' | 'json' | 'figma'>('bolt');
  const [boltSystemPrompt, setBoltSystemPrompt] = useState('');
  const [boltProjectPrompt, setBoltProjectPrompt] = useState('');
  const [fullScaffoldingPrompt, setFullScaffoldingPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePromptTab, setActivePromptTab] = useState<'system' | 'project' | 'full'>('full');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get project data from store
  const { currentProject } = useAppStore();

  // Generate system prompt for Bolt.new
  const generateBoltSystemPrompt = () => {
    const systemPrompt = `You are an expert full-stack developer tasked with implementing a complete application based on detailed specifications. Your goal is to create production-ready, maintainable code that follows best practices.

DEVELOPMENT GUIDELINES:
- Write clean, well-organized code with proper error handling
- Follow modern React patterns and TypeScript best practices
- Implement responsive design for all screen sizes
- Ensure accessibility compliance (WCAG 2.1 AA)
- Add comprehensive comments for complex logic
- Create reusable components and utilities
- Implement proper state management
- Add loading states and error boundaries
- Follow security best practices

CODING STANDARDS:
- Use TypeScript with strict type checking
- Follow ESLint and Prettier configurations
- Implement proper error handling and validation
- Write semantic HTML with appropriate ARIA attributes
- Use CSS-in-JS or utility classes consistently
- Create modular, testable components
- Follow the DRY principle (Don't Repeat Yourself)
- Implement proper data fetching with loading/error states

I'll provide detailed specifications for the application. Please implement it completely and correctly.`;

    setBoltSystemPrompt(systemPrompt);
    return systemPrompt;
  };

  // Generate project prompt for Bolt.new
  const generateBoltProjectPrompt = () => {
    const ideationData = stageData['ideation-discovery'] || {};
    const structureData = stageData['structure-flow'] || {};
    const featureData = stageData['feature-planning'] || {};
    const interfaceData = stageData['interface-interaction'] || {};
    
    const projectPrompt = `Create a ${ideationData.platform || 'web'} application called "${ideationData.appName || 'My App'}".

${ideationData.tagline ? `Tagline: "${ideationData.tagline}"` : ''}

App Concept: ${ideationData.appIdea || 'A modern application'}

Problem Statement: ${ideationData.problemStatement || 'Solving user pain points'}

Target Users: ${Array.isArray(ideationData.userPersonas) 
  ? ideationData.userPersonas.map((p: any) => p.name).join(', ') 
  : ideationData.targetUsers || 'General users'}

Value Proposition: ${ideationData.valueProposition || 'Providing unique value to users'}

Key Features:
${Array.isArray(featureData.selectedFeaturePacks) 
  ? featureData.selectedFeaturePacks.map((pack: string) => `- ${pack.charAt(0).toUpperCase() + pack.slice(1)}`).join('\n')
  : '- Core functionality'}
${Array.isArray(featureData.customFeatures) 
  ? featureData.customFeatures.map((feature: any) => `- ${feature.name}: ${feature.description}`).join('\n')
  : ''}

Technical Stack:
- Platform: ${ideationData.platform || 'Web'}
- Frontend: React with TypeScript
- Styling: ${interfaceData?.selectedDesignSystem || 'Tailwind CSS'}
- State Management: ${structureData?.stateManagement || 'React Context'}
- Database: Supabase (PostgreSQL)
- Authentication: ${stageData['user-auth-flow']?.authMethods?.some((m: any) => m.enabled) ? 'Supabase Auth' : 'None'}

UI/UX Requirements:
- Design System: ${interfaceData?.selectedDesignSystem || 'Modern components'}
- Color Scheme: Primary ${interfaceData?.customBranding?.primaryColor || '#3B82F6'}, Secondary ${interfaceData?.customBranding?.secondaryColor || '#10B981'}
- Typography: ${interfaceData?.customBranding?.fontFamily || 'Inter'} font family
- Responsive Design: Mobile, tablet, and desktop support
- Accessibility: WCAG 2.1 AA compliance

Please implement a complete, production-ready application based on these specifications.`;

    setBoltProjectPrompt(projectPrompt);
    return projectPrompt;
  };

  // Generate full scaffolding prompt for Bolt.new
  const generateFullScaffoldingPrompt = () => {
    setIsGenerating(true);
    
    try {
      // Generate system and project prompts if they don't exist
      const systemPrompt = boltSystemPrompt || generateBoltSystemPrompt();
      const projectPrompt = boltProjectPrompt || generateBoltProjectPrompt();
      
      // Get additional data from all stages
      const ideationData = stageData['ideation-discovery'] || {};
      const featureData = stageData['feature-planning'] || {};
      const structureData = stageData['structure-flow'] || {};
      const interfaceData = stageData['interface-interaction'] || {};
      const architectureData = stageData['architecture-design'] || {};
      const authData = stageData['user-auth-flow'] || {};
      
      // Combine all data into a comprehensive prompt
      const fullPrompt = `${systemPrompt}

${projectPrompt}

## Detailed Specifications

### Database Schema
${architectureData.databaseSchema 
  ? architectureData.databaseSchema.map((table: any) => 
      `- ${table.name} Table: ${table.fields?.map((f: any) => `${f.name} (${f.type}${f.required ? ', required' : ''}${f.unique ? ', unique' : ''})`).join(', ')}`)
    .join('\n')
  : 'Use appropriate database schema based on features'}

### API Endpoints
${architectureData.apiEndpoints 
  ? architectureData.apiEndpoints.map((endpoint: any) => 
      `- ${endpoint.method} ${endpoint.path}: ${endpoint.description}${endpoint.auth ? ' (requires auth)' : ''}`)
    .join('\n')
  : 'Implement RESTful API endpoints for all CRUD operations'}

### Screens & Navigation
${structureData.screens 
  ? structureData.screens.map((screen: any) => 
      `- ${screen.name} (${screen.type}): ${screen.description || ''}`)
    .join('\n')
  : 'Implement all necessary screens based on features'}

### User Authentication
${authData.authMethods 
  ? `Methods: ${authData.authMethods.filter((m: any) => m.enabled).map((m: any) => m.name).join(', ')}\nRoles: ${authData.userRoles?.map((r: any) => r.name).join(', ') || 'User, Admin'}`
  : 'Implement secure authentication if required by features'}

### File Structure
${structureData.fileStructure 
  ? 'Follow the defined project structure' 
  : 'Organize code using best practices for React applications'}

### Implementation Notes
- Use Vite for the build system
- Implement responsive design for all screen sizes
- Add proper error handling and loading states
- Ensure accessibility compliance
- Include comprehensive comments
- Follow security best practices

Please implement this application completely and correctly, following all specifications and best practices.`;

      setFullScaffoldingPrompt(fullPrompt);
      setIsGenerating(false);
      return fullPrompt;
    } catch (error) {
      console.error('Error generating scaffolding prompt:', error);
      setIsGenerating(false);
      return '';
    }
  };

  // Open Bolt.new with the generated prompt
  const openBoltNewWithPrompt = (prompt: string) => {
    if (!prompt) {
      alert('Please generate a prompt first');
      return;
    }
    
    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Open Bolt.new in a new tab with the prompt
    window.open(`https://bolt.new?prompt=${encodedPrompt}`, '_blank');
  };

  // Copy prompt to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text');
    }
  };

  // Generate prompts when the component mounts
  useEffect(() => {
    if (!boltSystemPrompt) {
      generateBoltSystemPrompt();
    }
    if (!boltProjectPrompt) {
      generateBoltProjectPrompt();
    }
  }, [stageData]);

  // Auto-scroll textarea to bottom when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [activePromptTab, boltSystemPrompt, boltProjectPrompt, fullScaffoldingPrompt]);

  // Handle sending prompt to agent
  const handleSendToAgent = () => {
    if (onSendMessage && fullScaffoldingPrompt) {
      onSendMessage(`Generate a detailed Bolt.new prompt for this project: ${currentProject?.name || 'My App'}`);
    }
  };

  // Get the active prompt based on the selected tab
  const getActivePrompt = (): string => {
    switch (activePromptTab) {
      case 'system':
        return boltSystemPrompt;
      case 'project':
        return boltProjectPrompt;
      case 'full':
        return fullScaffoldingPrompt;
      default:
        return fullScaffoldingPrompt;
    }
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
      <div className="grid grid-cols-2 gap-2">
        {exportFormats.map((format) => (
          <button
            key={format.id}
            onClick={() => setSelectedFormat(format.id as any)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedFormat === format.id
                ? `border-${format.color}-200 bg-${format.color}-50`
                : 'border-gray-200 bg-white hover:border-gray-300'
            } flex flex-col justify-between`}
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
        <div className="space-y-4">
          {/* Prompt Tabs */}
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActivePromptTab('full')}
              className={`px-4 py-2 text-sm font-medium ${
                activePromptTab === 'full' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Full Scaffolding Prompt
            </button>
            <button 
              onClick={() => setActivePromptTab('system')}
              className={`px-4 py-2 text-sm font-medium ${
                activePromptTab === 'system' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              System Prompt
            </button>
            <button 
              onClick={() => setActivePromptTab('project')}
              className={`px-4 py-2 text-sm font-medium ${
                activePromptTab === 'project' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Project Prompt
            </button>
          </div>

          {/* Prompt Content */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">
                {activePromptTab === 'system' ? 'Bolt System Prompt' : 
                 activePromptTab === 'project' ? 'Bolt Project Prompt' : 
                 'Full Scaffolding Prompt'}
              </h4>
              <div className="flex gap-2">
                {activePromptTab === 'system' && (
                  <button
                    onClick={generateBoltSystemPrompt}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Terminal className="w-3 h-3" />
                    Generate System Prompt
                  </button>
                )}
                {activePromptTab === 'project' && (
                  <button
                    onClick={generateBoltProjectPrompt}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Code className="w-3 h-3" />
                    Generate Project Prompt
                  </button>
                )}
                {activePromptTab === 'full' && (
                  <button
                    onClick={generateFullScaffoldingPrompt}
                    disabled={isGenerating}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate Full Prompt
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-md border border-gray-200">
                <textarea
                  ref={textareaRef}
                  value={getActivePrompt()}
                  onChange={(e) => {
                    // Allow editing of prompts
                    switch (activePromptTab) {
                      case 'system':
                        setBoltSystemPrompt(e.target.value);
                        break;
                      case 'project':
                        setBoltProjectPrompt(e.target.value);
                        break;
                      case 'full':
                        setFullScaffoldingPrompt(e.target.value);
                        break;
                    }
                  }}
                  className="w-full h-64 p-3 text-xs text-gray-700 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
                  placeholder={`Generate ${
                    activePromptTab === 'system' ? 'system' : 
                    activePromptTab === 'project' ? 'project' : 
                    'full scaffolding'
                  } prompt...`}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyToClipboard(getActivePrompt())}
                  disabled={!getActivePrompt()}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Copy className="w-3 h-3" />
                  Copy to Clipboard
                </button>
                
                <button
                  onClick={() => openBoltNewWithPrompt(getActivePrompt())}
                  disabled={!getActivePrompt()}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Bolt.new
                </button>
                
                {onSendMessage && (
                  <button
                    onClick={handleSendToAgent}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    Ask Chargur for Help
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Instructions */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-medium text-sm text-blue-800 mb-2">Using Bolt.new Prompts</h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal pl-4">
              <li>Generate the full scaffolding prompt using the button above</li>
              <li>Click "Open in Bolt.new" to automatically open Bolt with your prompt</li>
              <li>Bolt.new will generate a complete application based on your specifications</li>
              <li>You can edit any of the prompts to customize the output</li>
              <li>For more complex projects, consider breaking down into multiple prompts</li>
            </ol>
          </div>
        </div>
      )}

      {/* Other Export Options */}
      {selectedFormat !== 'bolt' && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Coming Soon</h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {exportFormats.find(f => f.id === selectedFormat)?.label} export is under development
            </p>
          </div>
        </div>
      )}
      
      <div className="text-center text-xs text-gray-500 mt-6">
        <p>Need help with your export? Ask Chargur for assistance or visit <a href="https://bolt.new/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bolt.new documentation</a>.</p>
      </div>
    </div>
  );
};