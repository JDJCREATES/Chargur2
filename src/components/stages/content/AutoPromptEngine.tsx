import React, { useState, useEffect, useRef, useMemo } from 'react';

import { 
  Zap, 
  Code, 
  Copy, 
  ExternalLink, 
  FileText, 
  Download, 
  RefreshCw,
  Eye,
  CheckCircle,
  Layers,
  GitBranch,
  Database,
  Shield,
  Palette,
  Brain,
  Target,
  Archive,
  History,
  Send,
  Wand2
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage, StageData } from '../../../types';
import { debounce } from '../../../utils/debounce';

interface AutoPromptEngineProps {
  stage: Stage;
  stages: Stage[];
  stageData: StageData;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

interface PromptModule {
  id: string;
  name: string;
  category: 'foundation' | 'features' | 'auth' | 'ui' | 'data' | 'integration';
  description: string;
  dependencies: string[];
  priority: number;
  estimatedTokens: number;
  status: 'pending' | 'generated' | 'sent' | 'completed';
  prompt: string;
  lastGenerated?: Date;
}

interface PromptHistory {
  id: string;
  moduleId: string;
  prompt: string;
  timestamp: Date;
  version: number;
  changes: string[];
}

export const AutoPromptEngine: React.FC<AutoPromptEngineProps> = ({
  stage,
  stages,
  stageData,
  initialFormData,
  onComplete,
  onUpdateData,
}) => {
  const defaultFormData = {
    promptMode: 'single-full',
    selectedModules: [] as string[],
    customInstructions: '',
    targetPlatform: 'bolt',
    includeComments: true,
    includeTypeScript: true,
    includeTesting: false,
    optimizeForTokens: true,
    autoSend: false,
    lastGenerated: null as Date | null,
  };
  
  const [formData, setFormData] = useState(defaultFormData);
  const initializedRef = useRef(false);

  // Initialize from props only once
  useEffect(() => {
    if (!initializedRef.current && initialFormData && Object.keys(initialFormData).length > 0) {
      console.log('Initializing AutoPromptEngine formData from initialFormData');
      setFormData(prev => ({ ...prev, ...initialFormData }));
      initializedRef.current = true;
    }
  }, []); // Empty dependency - only run once

  // Create debounced callback
  const debouncedOnFormDataChange = useMemo(
    () => debounce((data: any) => {
      if (initializedRef.current) { // Only call after initialization
        onUpdateData(data); // Call onUpdateData directly instead of onFormDataChange
      }
    }, 300),
    [onUpdateData] // Change from [onFormDataChange] to [onUpdateData]
  );

  // Handle form data changes
  useEffect(() => {
    if (initializedRef.current) {
      debouncedOnFormDataChange(formData);
    }
  }, [formData, debouncedOnFormDataChange]);

  const [promptModules, setPromptModules] = useState<PromptModule[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Sync formData with initialFormData when it changes
  useEffect(() => {
    if (initialFormData && initializedRef.current) { // Add initializedRef check
      console.log('Updating AutoPromptEngine formData from initialFormData');
      setFormData(prev => ({
        ...prev,
        ...initialFormData
      }));
    }
  }, [initialFormData]); // This dependency is correct

  useEffect(() => {
    generatePromptModules();
  }, [stageData]);

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  const generatePromptModules = () => {
    const modules: PromptModule[] = [];
    
    // Foundation Module
    modules.push({
      id: 'foundation',
      name: 'Project Foundation',
      category: 'foundation',
      description: 'Basic project setup, dependencies, and configuration',
      dependencies: [],
      priority: 1,
      estimatedTokens: 300,
      status: 'pending',
      prompt: generateFoundationPrompt(),
    });

    // Auth Module (if auth features exist)
    const authData = stageData['user-auth-flow'];
    if (authData?.authMethods?.some((m: any) => m.enabled)) {
      modules.push({
        id: 'auth',
        name: 'Authentication System',
        category: 'auth',
        description: 'User authentication, roles, and session management',
        dependencies: ['foundation'],
        priority: 2,
        estimatedTokens: 500,
        status: 'pending',
        prompt: generateAuthPrompt(),
      });
    }

    // Database Module
    const architectureData = stageData['architecture-design'];
    if (architectureData?.databaseSchema?.length > 0) {
      modules.push({
        id: 'database',
        name: 'Database Schema',
        category: 'data',
        description: 'Database models, migrations, and API endpoints',
        dependencies: ['foundation'],
        priority: 2,
        estimatedTokens: 400,
        status: 'pending',
        prompt: generateDatabasePrompt(),
      });
    }

    // UI Components Module
    const interfaceData = stageData['interface-interaction'];
    if (interfaceData?.selectedDesignSystem) {
      modules.push({
        id: 'ui-components',
        name: 'UI Components',
        category: 'ui',
        description: 'Design system, components, and styling',
        dependencies: ['foundation'],
        priority: 3,
        estimatedTokens: 600,
        status: 'pending',
        prompt: generateUIPrompt(),
      });
    }

    // Features Module
    const featureData = stageData['feature-planning'];
    if (featureData?.selectedFeaturePacks?.length > 0 || featureData?.customFeatures?.length > 0) {
      modules.push({
        id: 'features',
        name: 'Core Features',
        category: 'features',
        description: 'Main application features and functionality',
        dependencies: ['foundation', 'ui-components'],
        priority: 4,
        estimatedTokens: 800,
        status: 'pending',
        prompt: generateFeaturesPrompt(),
      });
    }

    // Integration Module
    if (architectureData?.integrations?.length > 0) {
      modules.push({
        id: 'integrations',
        name: 'Third-party Integrations',
        category: 'integration',
        description: 'External APIs and service integrations',
        dependencies: ['foundation', 'features'],
        priority: 5,
        estimatedTokens: 300,
        status: 'pending',
        prompt: generateIntegrationsPrompt(),
      });
    }

    setPromptModules(modules);
    updateFormData('selectedModules', modules.map(m => m.id));
  };

  const generateFoundationPrompt = () => {
    const ideationData = stageData['ideation-discovery'] || {};
    const architectureData = stageData['architecture-design'] || {};
    
    return `Create a modern ${ideationData.platform || 'web'} application called "${ideationData.appName || 'MyApp'}".

**Project Overview:**
${ideationData.appIdea || 'A modern web application'}

**Technical Requirements:**
- Use React with TypeScript
- Use Vite as the build tool
- Use Tailwind CSS for styling
- Use Lucide React for icons
- Implement responsive design
- Follow modern web development best practices

**Project Structure:**
- Organized component architecture
- Clean folder structure with logical separation
- Proper TypeScript types and interfaces
- Error boundaries and loading states

**Key Features to Include:**
${getSelectedFeatures().slice(0, 3).map(f => `- ${f}`).join('\n')}

Please create a well-structured, production-ready application with clean code, proper error handling, and excellent user experience.`;
  };

  const generateAuthPrompt = () => {
    const authData = stageData['user-auth-flow'] || {};
    const enabledMethods = authData.authMethods?.filter((m: any) => m.enabled) || [];
    
    return `Add a complete authentication system to the application using Supabase Auth.

**Authentication Methods:**
${enabledMethods.map((m: any) => `- ${m.name}${m.provider ? ` (${m.provider})` : ''}`).join('\n')}

**User Roles:**
${authData.userRoles?.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') || '- User: Standard authenticated user\n- Admin: Full access administrator'}

**Security Features:**
- Email verification on signup
- Password strength requirements
- Rate limiting on auth endpoints
- Secure session management
- Role-based access control (RBAC)

**Implementation Requirements:**
- Create useAuth hook for authentication state
- Implement protected routes
- Add login/signup forms with validation
- Include user profile management
- Set up proper error handling
- Add loading states for auth operations

Use Supabase's built-in authentication with proper TypeScript types and modern React patterns.`;
  };

  const generateDatabasePrompt = () => {
    const architectureData = stageData['architecture-design'] || {};
    const databaseSchema = architectureData.databaseSchema || [];
    
    return `Set up the database schema and API endpoints using Supabase.

**Database Tables:**
${databaseSchema.map((table: any) => `
- ${table.name}:
  ${table.fields?.map((field: any) => `  - ${field.name}: ${field.type}${field.required ? ' (required)' : ''}${field.unique ? ' (unique)' : ''}`).join('\n') || ''}
`).join('\n')}

**API Endpoints:**
${architectureData.apiEndpoints?.map((endpoint: any) => `- ${endpoint.method} ${endpoint.path}: ${endpoint.description}`).join('\n') || ''}

**Requirements:**
- Enable Row Level Security (RLS) on all tables
- Create appropriate policies for user access
- Set up proper foreign key relationships
- Add indexes for performance
- Include created_at and updated_at timestamps
- Use UUID for primary keys

**Client Integration:**
- Create TypeScript types for all database models
- Set up API client with proper error handling
- Implement CRUD operations with optimistic updates
- Add proper loading and error states

Generate the SQL migrations and TypeScript client code for seamless database integration.`;
  };

  const generateUIPrompt = () => {
    const interfaceData = stageData['interface-interaction'] || {};
    const structureData = stageData['structure-flow'] || {};
    
    return `Create a beautiful, responsive UI using ${interfaceData.selectedDesignSystem || 'Tailwind CSS'} components.

**Design System:**
- Primary Color: ${interfaceData.customBranding?.primaryColor || '#3B82F6'}
- Secondary Color: ${interfaceData.customBranding?.secondaryColor || '#10B981'}
- Font Family: ${interfaceData.customBranding?.fontFamily || 'Inter'}
- Border Radius: ${interfaceData.customBranding?.borderRadius || 'medium'}

**Key Screens:**
${structureData.screens?.map((screen: any) => `- ${screen.name} (${screen.type})`).join('\n') || ''}

**Component Requirements:**
- Responsive design for mobile, tablet, and desktop
- Consistent spacing using 8px grid system
- Smooth animations and micro-interactions
- Accessible components with proper ARIA labels
- Loading states and error handling
- Dark mode support (optional)

**Layout Features:**
- Modern navigation (${interfaceData.navigationBehavior?.sidebarType || 'responsive'})
- Clean typography hierarchy
- Consistent button styles and hover states
- Form validation with inline feedback
- Modal dialogs and toast notifications

Create components that are reusable, well-documented, and follow modern design principles for an excellent user experience.`;
  };

  const generateFeaturesPrompt = () => {
    const featureData = stageData['feature-planning'] || {};
    const selectedPacks = featureData.selectedFeaturePacks || [];
    const customFeatures = featureData.customFeatures || [];
    
    return `Implement the core application features with full functionality.

**Feature Packs:**
${selectedPacks.map((pack: string) => `- ${pack.charAt(0).toUpperCase() + pack.slice(1)} features`).join('\n')}

**Custom Features:**
${customFeatures.map((feature: any) => `- ${feature.name}: ${feature.description}`).join('\n')}

**Implementation Requirements:**
- Full CRUD operations for all data entities
- Real-time updates where appropriate
- Proper state management
- Error handling and validation
- Loading states and optimistic updates
- Mobile-responsive design
- Accessibility compliance

**Technical Specifications:**
- Use React hooks for state management
- Implement proper TypeScript types
- Add comprehensive error boundaries
- Include proper loading indicators
- Use Supabase for backend operations
- Follow React best practices

Create fully functional features that provide excellent user experience and are ready for production use.`;
  };

  const generateIntegrationsPrompt = () => {
    const architectureData = stageData['architecture-design'] || {};
    const integrations = architectureData.integrations || [];
    
    return `Add third-party integrations and external service connections.

**Integrations:**
${integrations.map((integration: string) => `- ${integration}`).join('\n')}

**Implementation Requirements:**
- Secure API key management using environment variables
- Proper error handling for external service failures
- Rate limiting and retry logic
- Caching where appropriate
- TypeScript types for all API responses
- Comprehensive logging for debugging

**Environment Variables:**
${architectureData.envVariables?.map((env: any) => `- ${env.name}: ${env.description}`).join('\n') || ''}

Set up all integrations with proper error handling, security best practices, and excellent developer experience.`;
  };

  const getSelectedFeatures = () => {
    const featureData = stageData['feature-planning'] || {};
    const features: string[] = [];
    
    if (featureData.selectedFeaturePacks) {
      featureData.selectedFeaturePacks.forEach((pack: string) => {
        switch (pack) {
          case 'auth':
            features.push('User Authentication');
            break;
          case 'crud':
            features.push('Data Management');
            break;
          case 'social':
            features.push('Social Features');
            break;
          case 'commerce':
            features.push('E-commerce');
            break;
          default:
            features.push(pack.charAt(0).toUpperCase() + pack.slice(1));
        }
      });
    }
    
    if (featureData.customFeatures) {
      featureData.customFeatures.forEach((feature: any) => {
        features.push(feature.name);
      });
    }
    
    return features;
  };

  const generateSingleFullPrompt = () => {
    const ideationData = stageData['ideation-discovery'] || {};
    const featureData = stageData['feature-planning'] || {};
    const structureData = stageData['structure-flow'] || {};
    const interfaceData = stageData['interface-interaction'] || {};
    const architectureData = stageData['architecture-design'] || {};
    const authData = stageData['user-auth-flow'] || {};

    return `Create a complete ${ideationData.platform || 'web'} application called "${ideationData.appName || 'MyApp'}".

## Project Overview
**App Concept:** ${ideationData.appIdea || 'A modern web application'}
**Tagline:** ${ideationData.tagline || 'Building something amazing'}
**Target Users:** ${ideationData.targetUsers || 'General users'}
**Value Proposition:** ${ideationData.valueProposition || 'Solving user problems efficiently'}

## Technical Stack
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel/Netlify ready

## Core Features
${getSelectedFeatures().map(f => `- ${f}`).join('\n')}

## Authentication & Users
${authData.authMethods?.filter((m: any) => m.enabled).map((m: any) => `- ${m.name}`).join('\n') || '- Email/Password authentication'}

**User Roles:**
${authData.userRoles?.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') || '- User: Standard access\n- Admin: Full access'}

## Database Schema
${architectureData.databaseSchema?.map((table: any) => `
**${table.name} Table:**
${table.fields?.map((field: any) => `- ${field.name}: ${field.type}${field.required ? ' (required)' : ''}${field.unique ? ' (unique)' : ''}`).join('\n') || ''}
`).join('\n') || ''}

## UI/UX Requirements
- **Design System:** ${interfaceData.selectedDesignSystem || 'Modern Tailwind components'}
- **Primary Color:** ${interfaceData.customBranding?.primaryColor || '#3B82F6'}
- **Navigation:** ${interfaceData.navigationBehavior?.sidebarType || 'Responsive navigation'}
- **Responsive:** Mobile-first design approach

## Key Screens
${structureData.screens?.map((screen: any) => `- ${screen.name} (${screen.type})`).join('\n') || ''}

## Implementation Requirements
1. **Security:** Implement proper authentication, authorization, and data validation
2. **Performance:** Optimize for fast loading and smooth interactions
3. **Accessibility:** Follow WCAG guidelines for inclusive design
4. **Error Handling:** Comprehensive error boundaries and user feedback
5. **Testing:** Include basic error handling and validation
6. **Documentation:** Clear code comments and component documentation

## Custom Instructions
${formData.customInstructions || 'Follow modern React best practices and create a production-ready application.'}

Please create a fully functional, production-ready application with clean architecture, excellent user experience, and modern development practices. Include proper TypeScript types, error handling, loading states, and responsive design.`;
  };

  const generateMultiStepPrompts = () => {
    const selectedModules = promptModules.filter(m => formData.selectedModules.includes(m.id));
    return selectedModules.sort((a, b) => a.priority - b.priority);
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    
    try {
      if (formData.promptMode === 'single-full') {
        const prompt = generateSingleFullPrompt();
        setGeneratedPrompt(prompt);
        
        // Add to history
        const historyEntry: PromptHistory = {
          id: Date.now().toString(),
          moduleId: 'full-app',
          prompt,
          timestamp: new Date(),
          version: promptHistory.filter(h => h.moduleId === 'full-app').length + 1,
          changes: ['Generated full application prompt'],
        };
        setPromptHistory(prev => [historyEntry, ...prev]);
      } else {
        // Multi-step mode - generate individual module prompts
        const modules = generateMultiStepPrompts();
        setPromptModules(prev => prev.map(m => ({
          ...m,
          status: formData.selectedModules.includes(m.id) ? 'generated' : m.status,
          lastGenerated: formData.selectedModules.includes(m.id) ? new Date() : m.lastGenerated,
        })));
      }
      
      updateFormData('lastGenerated', new Date());
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleSendToBolt = (prompt: string) => {
    const boltUrl = `https://bolt.new?prompt=${encodeURIComponent(prompt)}`;
    window.open(boltUrl, '_blank');
  };

  const handleRegenerateModule = (moduleId: string) => {
    setPromptModules(prev => prev.map(m => 
      m.id === moduleId 
        ? { ...m, status: 'generated', lastGenerated: new Date() }
        : m
    ));
  };

  const getModuleIcon = (category: string) => {
    switch (category) {
      case 'foundation': return <Code className="w-4 h-4" />;
      case 'auth': return <Shield className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'ui': return <Palette className="w-4 h-4" />;
      case 'features': return <Zap className="w-4 h-4" />;
      case 'integration': return <GitBranch className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getModuleColor = (category: string) => {
    switch (category) {
      case 'foundation': return 'blue';
      case 'auth': return 'red';
      case 'data': return 'green';
      case 'ui': return 'purple';
      case 'features': return 'orange';
      case 'integration': return 'teal';
      default: return 'gray';
    }
  };

  const totalEstimatedTokens = promptModules
    .filter(m => formData.selectedModules.includes(m.id))
    .reduce((sum, m) => sum + m.estimatedTokens, 0);

  

  return (
    <div className="p-4 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-Prompt Engine</h3>
        <p className="text-sm text-gray-600">Transform your UX design into intelligent, Bolt-ready prompts</p>
      </div>

      {/* 8.1 Prompt Generator Core */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">Prompt Generator Core</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Project Data Summary */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-3">Project Data Consolidation</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-purple-700 mb-1">Completed Stages:</div>
                  <div className="text-purple-600">{stages.filter(s => s.completed).length}/{stages.length}</div>
                </div>
                <div>
                  <div className="font-medium text-purple-700 mb-1">Total Features:</div>
                  <div className="text-purple-600">{getSelectedFeatures().length}</div>
                </div>
                <div>
                  <div className="font-medium text-purple-700 mb-1">Database Tables:</div>
                  <div className="text-purple-600">{stageData['architecture-design']?.databaseSchema?.length || 0}</div>
                </div>
                <div>
                  <div className="font-medium text-purple-700 mb-1">Auth Methods:</div>
                  <div className="text-purple-600">{stageData['user-auth-flow']?.authMethods?.filter((m: any) => m.enabled).length || 0}</div>
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
              <textarea
                value={formData.customInstructions}
                onChange={(e) => updateFormData('customInstructions', e.target.value)}
                placeholder="Add any specific requirements or preferences for the generated code..."
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Generation Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Platform</label>
                <select
                  value={formData.targetPlatform}
                  onChange={(e) => updateFormData('targetPlatform', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="bolt">Bolt.new</option>
                  <option value="claude">Claude</option>
                  <option value="gpt4">GPT-4</option>
                  <option value="cursor">Cursor</option>
                </select>
              </div>
              
              <div className="space-y-2">
                {[
                  { key: 'includeComments', label: 'Include Code Comments' },
                  { key: 'includeTypeScript', label: 'TypeScript Types' },
                  { key: 'includeTesting', label: 'Testing Setup' },
                  { key: 'optimizeForTokens', label: 'Optimize for Tokens' },
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData[option.key as keyof typeof formData] as boolean}
                      onChange={(e) => updateFormData(option.key, e.target.checked)}
                      className="w-3 h-3 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 8.2 Prompt Modes */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Prompt Modes</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Generation Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateFormData('promptMode', 'single-full')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    formData.promptMode === 'single-full'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium text-sm">Single Full Prompt</span>
                  </div>
                  <p className="text-xs">Complete app in one comprehensive prompt</p>
                  <div className="text-xs mt-2 opacity-75">Best for: MVP apps, prototyping</div>
                </button>

                <button
                  onClick={() => updateFormData('promptMode', 'multi-step')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    formData.promptMode === 'multi-step'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4" />
                    <span className="font-medium text-sm">Multi-Step Series</span>
                  </div>
                  <p className="text-xs">Modular prompts for complex apps</p>
                  <div className="text-xs mt-2 opacity-75">Best for: Complex apps, iterative development</div>
                </button>
              </div>
            </div>

            {/* Multi-Step Module Selection */}
            {formData.promptMode === 'multi-step' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm text-gray-800">Prompt Modules</h4>
                  <div className="text-xs text-gray-600">
                    Estimated tokens: {totalEstimatedTokens.toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {promptModules.map((module) => {
                    const color = getModuleColor(module.category);
                    const Icon = getModuleIcon(module.category);
                    
                    return (
                      <div key={module.id} className={`p-3 bg-${color}-50 rounded-lg border border-${color}-200`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.selectedModules.includes(module.id)}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...formData.selectedModules, module.id]
                                    : formData.selectedModules.filter(id => id !== module.id);
                                  updateFormData('selectedModules', updated);
                                }}
                                className={`w-4 h-4 text-${color}-600 rounded focus:ring-${color}-500`}
                              />
                              <div className={`text-${color}-600`}>
                                {Icon}
                              </div>
                              <span className={`font-medium text-sm text-${color}-800`}>{module.name}</span>
                            </label>
                            <span className={`text-xs px-2 py-1 bg-${color}-200 text-${color}-700 rounded`}>
                              Priority {module.priority}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{module.estimatedTokens} tokens</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              module.status === 'completed' ? 'bg-green-100 text-green-700' :
                              module.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              module.status === 'generated' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {module.status}
                            </span>
                          </div>
                        </div>
                        
                        <p className={`text-xs text-${color}-600 mt-2`}>{module.description}</p>
                        
                        {module.dependencies.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Depends on: {module.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 8.3 Live Preview & Edit */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Live Preview & Edit</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Generation Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGeneratePrompt}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isGenerating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Prompt
                  </>
                )}
              </button>
              
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </button>
              
              {formData.lastGenerated && (
                <span className="text-xs text-gray-500">
                  Last generated: {formData.lastGenerated.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Generated Prompt Preview */}
            {(generatedPrompt || previewMode) && (
              <div className="bg-gray-900 text-green-400 rounded-lg">
                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                  <h4 className="font-medium text-green-300">Generated Bolt Prompt</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyPrompt(generatedPrompt)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button
                      onClick={() => handleSendToBolt(generatedPrompt)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Send to Bolt
                    </button>
                  </div>
                </div>
                <div className="p-3 max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {generatedPrompt || generateSingleFullPrompt()}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 8.4 Send to Bolt */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-orange-600" />
            <Typography className="font-medium text-sm">Send to Bolt</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-2">Bolt.new Integration</h4>
              <p className="text-sm text-orange-700 mb-3">
                Send your generated prompts directly to Bolt.new for instant app scaffolding and development.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => generatedPrompt && handleSendToBolt(generatedPrompt)}
                  disabled={!generatedPrompt}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    generatedPrompt
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Bolt.new
                </button>
                
                <button
                  onClick={() => generatedPrompt && handleCopyPrompt(generatedPrompt)}
                  disabled={!generatedPrompt}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    generatedPrompt
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </button>
              </div>
            </div>

            {/* Auto-send Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoSend}
                onChange={(e) => updateFormData('autoSend', e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <label className="text-sm text-gray-700">
                Auto-open Bolt.new after generating prompts
              </label>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 8.5 Post-Prompt Confirmation */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <Typography className="font-medium text-sm">Post-Prompt Confirmation</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-medium text-teal-800 mb-2">Prompt Status Tracking</h4>
              <div className="space-y-2">
                {formData.promptMode === 'multi-step' ? (
                  promptModules.filter(m => formData.selectedModules.includes(m.id)).map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                      <span className="text-sm text-teal-800">{module.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          module.status === 'completed' ? 'bg-green-100 text-green-700' :
                          module.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          module.status === 'generated' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {module.status}
                        </span>
                        {module.status === 'generated' && (
                          <button
                            onClick={() => handleRegenerateModule(module.id)}
                            className="text-xs px-2 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
                          >
                            Re-send
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                    <span className="text-sm text-teal-800">Full Application Prompt</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      generatedPrompt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {generatedPrompt ? 'Generated' : 'Pending'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 8.6 Re-Prompting from History */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <Typography className="font-medium text-sm">Re-Prompting from History</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            {promptHistory.length > 0 ? (
              <div className="space-y-2">
                {promptHistory.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-indigo-800">
                        {entry.moduleId === 'full-app' ? 'Full Application' : entry.moduleId}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-600">v{entry.version}</span>
                        <span className="text-xs text-indigo-600">
                          {entry.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-indigo-600 mb-2">
                      Changes: {entry.changes.join(', ')}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyPrompt(entry.prompt)}
                        className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleSendToBolt(entry.prompt)}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Send to Bolt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No prompt history yet</p>
                <p className="text-xs">Generate your first prompt to see history</p>
              </div>
            )}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 8.7 Output & Complete */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Output & Complete</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Auto-Prompt Engine Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-700">Mode:</div>
                  <div className="text-green-600">{formData.promptMode === 'single-full' ? 'Single Full Prompt' : 'Multi-Step Series'}</div>
                </div>
                <div>
                  <div className="font-medium text-green-700">Target Platform:</div>
                  <div className="text-green-600">{formData.targetPlatform}</div>
                </div>
                <div>
                  <div className="font-medium text-green-700">Modules Selected:</div>
                  <div className="text-green-600">{formData.selectedModules.length}</div>
                </div>
                <div>
                  <div className="font-medium text-green-700">Estimated Tokens:</div>
                  <div className="text-green-600">{totalEstimatedTokens.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Export Prompts
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <Archive className="w-4 h-4" />
                Save Project
              </button>
              <button
                onClick={() => generatedPrompt && handleSendToBolt(generatedPrompt)}
                disabled={!generatedPrompt}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  generatedPrompt
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                Deploy to Bolt
              </button>
              <button
                onClick={onComplete}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Engine
              </button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};