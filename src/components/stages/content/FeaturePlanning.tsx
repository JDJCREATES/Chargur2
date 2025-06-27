import React, { useState } from 'react';

import { 
  Lightbulb, 
  Package, 
  ArrowUpDown, 
  GitBranch, 
  Layers, 
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  Target,
  Zap,
  Database,
  Users,
  Shield,
  MessageSquare,
  BarChart,
  Upload,
  Download,
  CreditCard,
  Monitor,
  Brain,
  Code,
  Server,
  Workflow
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';

interface FeaturePlanningProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'core' | 'admin' | 'user' | 'optional' | 'stretch';
  priority: 'must' | 'should' | 'could' | 'wont';
  complexity: 'low' | 'medium' | 'high';
  category: 'frontend' | 'backend' | 'both' | 'ai-assisted' | 'api-required';
  subFeatures: string[];
  dependencies: string[];
  estimatedEffort: number; // 1-10 scale
}

interface FeaturePack {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  category: 'auth' | 'crud' | 'social' | 'commerce' | 'analytics' | 'ai' | 'media' | 'communication';
}

export const FeaturePlanning: React.FC<FeaturePlanningProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
}) => {
  const defaultFormData = {
    naturalLanguageFeatures: '',
    selectedFeaturePacks: [] as string[],
    customFeatures: [] as Feature[],
    mvpMode: false,
    aiEnhancements: [] as string[],
    architecturePrep: {
      screens: [] as string[],
      apiRoutes: [] as string[],
      components: [] as string[],
    },
  };
  
  const [formData, setFormData] = useState(() => ({
    ...defaultFormData,
    ...(initialFormData || {})
  }));

  const [draggedFeature, setDraggedFeature] = useState<string | null>(null);

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  const featurePacks: FeaturePack[] = [
    {
      id: 'auth',
      name: 'Authentication & Users',
      description: 'User registration, login, profiles, roles',
      icon: Shield,
      features: ['User Registration', 'Login/Logout', 'Password Reset', 'User Profiles', 'Role Management', 'Email Verification'],
      category: 'auth',
    },
    {
      id: 'crud',
      name: 'Data Management (CRUD)',
      description: 'Create, read, update, delete operations',
      icon: Database,
      features: ['Create Records', 'View/List Records', 'Edit Records', 'Delete Records', 'Search & Filter', 'Data Validation'],
      category: 'crud',
    },
    {
      id: 'social',
      name: 'Social Features',
      description: 'Comments, likes, sharing, following',
      icon: Users,
      features: ['Comments System', 'Like/Reactions', 'Social Sharing', 'Follow/Unfollow', 'Activity Feed', 'User Mentions'],
      category: 'social',
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Chat, notifications, messaging',
      icon: MessageSquare,
      features: ['Real-time Chat', 'Push Notifications', 'Email Notifications', 'Direct Messages', 'Group Chat', 'Message History'],
      category: 'communication',
    },
    {
      id: 'commerce',
      name: 'E-commerce',
      description: 'Payments, cart, orders, inventory',
      icon: CreditCard,
      features: ['Shopping Cart', 'Payment Processing', 'Order Management', 'Inventory Tracking', 'Product Catalog', 'Checkout Flow'],
      category: 'commerce',
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting',
      description: 'Dashboards, metrics, insights',
      icon: BarChart,
      features: ['Analytics Dashboard', 'User Metrics', 'Performance Reports', 'Data Visualization', 'Export Reports', 'Real-time Stats'],
      category: 'analytics',
    },
    {
      id: 'media',
      name: 'Media & Files',
      description: 'Upload, storage, processing',
      icon: Upload,
      features: ['File Upload', 'Image Processing', 'Video Streaming', 'File Storage', 'Media Gallery', 'Download Manager'],
      category: 'media',
    },
    {
      id: 'ai',
      name: 'AI & Automation',
      description: 'Smart features, recommendations, automation',
      icon: Brain,
      features: ['AI Recommendations', 'Smart Search', 'Content Generation', 'Auto-categorization', 'Predictive Analytics', 'Chatbot'],
      category: 'ai',
    },
  ];

  const priorityBuckets = [
    { id: 'must', label: 'Must Have', color: 'red', description: 'Critical for MVP' },
    { id: 'should', label: 'Should Have', color: 'orange', description: 'Important but not critical' },
    { id: 'could', label: 'Could Have', color: 'yellow', description: 'Nice to have' },
    { id: 'wont', label: "Won't Have (Yet)", color: 'gray', description: 'Future versions' },
  ];

  const complexityLevels = [
    { id: 'low', label: 'Low', color: 'green', description: '1-3 days' },
    { id: 'medium', label: 'Medium', color: 'yellow', description: '1-2 weeks' },
    { id: 'high', label: 'High', color: 'red', description: '2+ weeks' },
  ];

  const toggleFeaturePack = (packId: string) => {
    const updated = formData.selectedFeaturePacks.includes(packId)
      ? formData.selectedFeaturePacks.filter((id: string) => id !== packId)
      : [...formData.selectedFeaturePacks, packId];
    updateFormData('selectedFeaturePacks', updated);
  };

  const addCustomFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      name: 'New Feature',
      description: 'Describe this feature...',
      type: 'core',
      priority: 'should',
      complexity: 'medium',
      category: 'frontend',
      subFeatures: [],
      dependencies: [],
      estimatedEffort: 5,
    };
    updateFormData('customFeatures', [...formData.customFeatures, newFeature]);
  };

  const updateFeature = (featureId: string, updates: Partial<Feature>) => {
    const updated = formData.customFeatures.map((f: Feature) => 
      f.id === featureId ? { ...f, ...updates } : f
    );
    updateFormData('customFeatures', updated);
  };

  const removeFeature = (featureId: string) => {
    updateFormData('customFeatures', formData.customFeatures.filter((f: Feature) => f.id !== featureId));
  };

  const generateAIFeatureBreakdown = (featureName: string) => {
    // Simulate AI feature breakdown
    const commonBreakdowns: { [key: string]: string[] } = {
      'user profiles': ['view profile', 'edit profile', 'upload avatar', 'set preferences', 'privacy settings'],
      'real-time chat': ['send message', 'receive message', 'typing indicators', 'message history', 'emoji reactions'],
      'file upload': ['select files', 'upload progress', 'file validation', 'storage management', 'download files'],
      'notifications': ['push notifications', 'email notifications', 'in-app notifications', 'notification preferences', 'notification history'],
    };
    
    const key = featureName.toLowerCase();
    return commonBreakdowns[key] || ['sub-feature 1', 'sub-feature 2', 'sub-feature 3'];
  };

  const suggestAIEnhancements = () => {
    const suggestions = [
      'AI-powered search with natural language queries',
      'Smart content recommendations based on user behavior',
      'Automated content moderation and spam detection',
      'Intelligent form auto-completion',
      'Predictive analytics for user engagement',
      'AI chatbot for customer support',
      'Smart notification timing optimization',
      'Automated content categorization and tagging',
    ];
    
    updateFormData('aiEnhancements', suggestions.slice(0, 4));
  };

  const generateArchitecturePrep = () => {
    const selectedPacks = featurePacks.filter(pack => formData.selectedFeaturePacks.includes(pack.id));
    const allFeatures = [...selectedPacks.flatMap(pack => pack.features), ...formData.customFeatures.map((f: Feature) => f.name)];
    
    // Generate screens based on features
    const screens = [
      'Landing Page',
      'Dashboard',
      ...allFeatures.includes('User Registration') ? ['Login', 'Register', 'Profile'] : [],
      ...allFeatures.includes('Real-time Chat') ? ['Chat', 'Messages'] : [],
      ...allFeatures.includes('Shopping Cart') ? ['Products', 'Cart', 'Checkout'] : [],
      'Settings',
    ];

    // Generate API routes
    const apiRoutes = [
      '/api/health',
      ...allFeatures.includes('User Registration') ? ['/api/auth/login', '/api/auth/register', '/api/users'] : [],
      ...allFeatures.includes('Real-time Chat') ? ['/api/messages', '/api/chat/rooms'] : [],
      ...allFeatures.includes('File Upload') ? ['/api/upload', '/api/files'] : [],
      ...formData.customFeatures.map((f: Feature) => `/api/${f.name.toLowerCase().replace(/\s+/g, '-')}`),
    ];

    // Generate components
    const components = [
      'Header', 'Sidebar', 'Footer',
      ...allFeatures.includes('User Registration') ? ['LoginForm', 'UserProfile', 'AuthGuard'] : [],
      ...allFeatures.includes('Real-time Chat') ? ['ChatWindow', 'MessageBubble', 'ChatInput'] : [],
      ...allFeatures.includes('File Upload') ? ['FileUploader', 'FilePreview'] : [],
      ...formData.customFeatures.map((f: Feature) => `${f.name.replace(/\s+/g, '')}Component`),
    ];

    updateFormData('architecturePrep', { screens, apiRoutes, components });
  };

  const generateFeatureSummary = () => {
    const selectedPacks = featurePacks.filter(pack => formData.selectedFeaturePacks.includes(pack.id));
    const totalFeatures = selectedPacks.reduce((acc, pack) => acc + pack.features.length, 0) + formData.customFeatures.length;
    const mustHaveFeatures = formData.customFeatures.filter((f: Feature) => f.priority === 'must').length;
    
    return `
**Feature Planning Summary**

**Natural Language Description:**
${formData.naturalLanguageFeatures || 'No description provided'}

**Selected Feature Packs (${selectedPacks.length}):**
${selectedPacks.map(pack => `- ${pack.name}: ${pack.features.length} features`).join('\n')}

**Custom Features (${formData.customFeatures.length}):**
${formData.customFeatures.map((f: Feature) => `- ${f.name} (${f.priority}, ${f.complexity} complexity)`).join('\n')}

**Total Features:** ${totalFeatures}
**MVP Features:** ${mustHaveFeatures}
**AI Enhancements:** ${formData.aiEnhancements.length}

**Architecture Prep:**
- Screens: ${formData.architecturePrep.screens.length}
- API Routes: ${formData.architecturePrep.apiRoutes.length}
- Components: ${formData.architecturePrep.components.length}
    `.trim();
  };

  return (
    <div className="p-4 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Feature Planning</h3>
        <p className="text-sm text-gray-600">Define what your app does - core features, priorities, and architecture prep</p>
      </div>

      {/* 2.1 Feature Collection */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <Typography className="font-medium text-sm">Feature Collection</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Natural Language Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your App's Features</label>
              <textarea
                value={formData.naturalLanguageFeatures}
                onChange={(e) => updateFormData('naturalLanguageFeatures', e.target.value)}
                placeholder="e.g., 'Users can upload case files, comment on theories, vote on solutions, and get AI-powered insights...'"
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Feature Packs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Common Feature Packs</label>
              <div className="grid grid-cols-2 gap-2">
                {featurePacks.map((pack) => {
                  const Icon = pack.icon;
                  const isSelected = formData.selectedFeaturePacks.includes(pack.id);
                  return (
                    <button
                      key={pack.id}
                      onClick={() => toggleFeaturePack(pack.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{pack.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{pack.description}</p>
                      <div className="text-xs">
                        <span className="font-medium">{pack.features.length} features:</span>
                        <span className="ml-1">{pack.features.slice(0, 2).join(', ')}{pack.features.length > 2 ? '...' : ''}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.2 Feature Breakdown */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Feature Breakdown</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Break down high-level features into sub-features</p>
              <button
                onClick={addCustomFeature}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" />
                Add Custom Feature
              </button>
            </div>

            {/* Selected Feature Packs Breakdown */}
            {formData.selectedFeaturePacks.map((packId: string) => {
              const pack = featurePacks.find(p => p.id === packId);
              if (!pack) return null;
              
              return (
                <div key={packId} className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <pack.icon className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-sm text-blue-800">{pack.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {pack.features.map((feature: string, index: number) => (
                      <div key={index} className="text-xs bg-white rounded px-2 py-1 text-blue-700">
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Custom Features */}
            <div className="space-y-2">
              {formData.customFeatures.map((feature: Feature) => (
                <div key={feature.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) => updateFeature(feature.id, { name: e.target.value })}
                      className="font-medium text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    />
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                    placeholder="Describe this feature..."
                    rows={2}
                    className="w-full p-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  />

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={feature.type}
                        onChange={(e) => updateFeature(feature.id, { type: e.target.value as Feature['type'] })}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="core">Core</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="optional">Optional</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={feature.category}
                        onChange={(e) => updateFeature(feature.id, { category: e.target.value as Feature['category'] })}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="both">Both</option>
                        <option value="ai-assisted">AI-Assisted</option>
                        <option value="api-required">API Required</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Complexity</label>
                      <select
                        value={feature.complexity}
                        onChange={(e) => updateFeature(feature.id, { complexity: e.target.value as Feature['complexity'] })}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.3 Feature Prioritization */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Feature Prioritization (MoSCoW)</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Drag features into priority buckets</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.mvpMode}
                  onChange={(e) => updateFormData('mvpMode', e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                MVP Mode (Show only "Must Have")
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {priorityBuckets.map((bucket) => (
                <div key={bucket.id} className={`bg-${bucket.color}-50 border-2 border-dashed border-${bucket.color}-200 rounded-lg p-3 min-h-32`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${bucket.color}-500`}></div>
                    <h4 className={`font-medium text-sm text-${bucket.color}-800`}>{bucket.label}</h4>
                  </div>
                  <p className={`text-xs text-${bucket.color}-600 mb-3`}>{bucket.description}</p>
                  
                  <div className="space-y-1">
                    {formData.customFeatures
                      .filter((f: Feature) => f.priority === bucket.id)
                      .map((feature: Feature) => (
                        <div key={feature.id} className={`text-xs p-2 bg-white rounded border border-${bucket.color}-200 text-${bucket.color}-700`}>
                          {feature.name}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.4 Dependency Mapping */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">Dependency Mapping</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Visual links between features that depend on each other</p>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-sm text-purple-800 mb-3">Common Dependencies</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-700">Notifications → User Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-700">Comments → User Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-700">File Upload → Storage Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-700">Real-time Chat → WebSocket Connection</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-yellow-600" />
                <h4 className="font-medium text-sm text-yellow-800">Dependency Warnings</h4>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Missing User Authentication for Social Features</li>
                <li>• File Upload requires Storage Configuration</li>
                <li>• Real-time features need WebSocket setup</li>
              </ul>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.5 Architecture Prep */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <Typography className="font-medium text-sm">Architecture Prep</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Generate screens, API routes, and components from features</p>
              <button
                onClick={generateArchitecturePrep}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Zap className="w-3 h-3" />
                Generate
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-medium text-sm text-indigo-800">Screens ({formData.architecturePrep.screens.length})</h4>
                </div>
                <div className="space-y-1">
                  {formData.architecturePrep.screens.map((screen: string, index: number) => (
                    <div key={index} className="text-xs bg-white rounded px-2 py-1 text-indigo-700">
                      {screen}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-green-600" />
                  <h4 className="font-medium text-sm text-green-800">API Routes ({formData.architecturePrep.apiRoutes.length})</h4>
                </div>
                <div className="space-y-1">
                  {formData.architecturePrep.apiRoutes.map((route: string, index: number) => (
                    <div key={index} className="text-xs bg-white rounded px-2 py-1 text-green-700 font-mono">
                      {route}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium text-sm text-orange-800">Components ({formData.architecturePrep.components.length})</h4>
                </div>
                <div className="space-y-1">
                  {formData.architecturePrep.components.map((component: string, index: number) => (
                    <div key={index} className="text-xs bg-white rounded px-2 py-1 text-orange-700">
                      {`<${component} />`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.6 Optional Enhancements */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <Typography className="font-medium text-sm">AI Enhancements</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">AI-powered versions of your features</p>
              <button
                onClick={suggestAIEnhancements}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                <Brain className="w-3 h-3" />
                Suggest AI Features
              </button>
            </div>

            <div className="space-y-2">
              {formData.aiEnhancements.map((enhancement: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span className="text-sm text-pink-700">{enhancement}</span>
                  <div className="ml-auto flex gap-1">
                    <span className="text-xs px-2 py-1 bg-pink-200 text-pink-700 rounded">Medium</span>
                    <span className="text-xs px-2 py-1 bg-pink-200 text-pink-700 rounded">High Value</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.7 Hand-off Prep */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Feature Summary & Complete</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 mb-2">Feature Planning Summary</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateFeatureSummary()}</pre>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <Workflow className="w-4 h-4" />
                Export Markdown
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700">
                <Zap className="w-4 h-4" />
                Bolt Prompt
              </button>
            </div>
            
            <button
              onClick={onComplete}
              disabled={formData.customFeatures.length === 0 && formData.selectedFeaturePacks.length === 0}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.customFeatures.length > 0 || formData.selectedFeaturePacks.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Complete Feature Planning
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};