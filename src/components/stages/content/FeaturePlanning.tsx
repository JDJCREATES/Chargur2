import React, { useState } from 'react';

import { 
  Lightbulb, 
  Package, 
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
import { Tree } from 'react-arborist';
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
  dependencies: Array<{
    id: string;
    from: string;
    to: string;
    type: 'requires' | 'enhances' | 'conflicts';
  }>;
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

  const addDependency = (fromFeatureId: string, toFeatureId: string, type: 'requires' | 'enhances' | 'conflicts' = 'requires') => {
    const fromFeature = formData.customFeatures.find(f => f.id === fromFeatureId);
    if (fromFeature) {
      const newDependency = {
        id: `${fromFeatureId}-${toFeatureId}`,
        from: fromFeatureId,
        to: toFeatureId,
        type
      };
      updateFeature(fromFeatureId, { dependencies: [...(fromFeature.dependencies || []), newDependency] });
    }
  };

  const generateAIFeatureBreakdown = (featureName: string) => {
    // Simulate AI feature breakdown
    const commonBreakdowns: { [key: string]: string[] } = {
      'user profiles': [
        'View user profile details',
        'Edit profile information',
        'Upload and crop profile avatar',
        'Set user preferences',
        'Configure privacy settings'
      ],
      'real-time chat': [
        'Send text messages',
        'Receive messages with delivery status',
        'Show typing indicators',
        'Access message history',
        'Support emoji reactions and attachments'
      ],
      'file upload': [
        'Select multiple files',
        'Show upload progress',
        'Validate file types and sizes',
        'Manage storage quotas',
        'Download and share uploaded files'
      ],
      'notifications': [
        'Push notifications for mobile',
        'Email notifications for important events',
        'In-app notification center',
        'Notification preference settings',
        'Read/unread status tracking'
      ],
      'authentication': [
        'Email/password registration',
        'Social login options',
        'Password reset flow',
        'Account verification',
        'Session management'
      ],
      'payment': [
        'Multiple payment method support',
        'Secure checkout process',
        'Payment history tracking',
        'Subscription management',
        'Invoice generation'
      ],
      'search': [
        'Full-text search capability',
        'Filter and sort results',
        'Search history tracking',
        'Suggested search terms',
        'Advanced search options'
      ],
      'dashboard': [
        'Key metrics visualization',
        'Customizable widgets',
        'Data filtering options',
        'Export capabilities',
        'Real-time updates'
      ]
    };
    
    // Try to find an exact match first
    const key = featureName.toLowerCase().trim();
    if (commonBreakdowns[key]) {
      return commonBreakdowns[key];
    }
    
    // If no exact match, look for partial matches
    for (const breakdownKey in commonBreakdowns) {
      if (key.includes(breakdownKey) || breakdownKey.includes(key)) {
        return commonBreakdowns[breakdownKey];
      }
    }
    
    // Generate generic breakdown based on feature name
    return [
      `${featureName} setup and configuration`,
      `${featureName} core functionality`,
      `${featureName} user interface`,
      `${featureName} settings and customization`,
      `${featureName} integration with other features`
    ];
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

  // Prepare data for react-arborist
  const prepareTreeData = () => {
    const treeData: any[] = [];
    
    // Add feature packs
    formData.selectedFeaturePacks.forEach((pack, index) => {
      const packName = featurePacks.find(p => p.id === pack)?.name || pack;
      const node = {
        id: `pack-${pack}`,
        name: packName,
        isFeaturePack: true,
        packId: pack,
        children: []
      };
      
      // Add default sub-features for feature packs
      const packFeatures = featurePacks.find(p => p.id === pack)?.features || [];
      packFeatures.forEach((feature, featureIndex) => {
        node.children.push({
          id: `pack-${pack}-feature-${featureIndex}`,
          name: feature,
          isSubFeature: true,
          parentId: `pack-${pack}`
        });
      });
      
      treeData.push(node);
    });
    
    // Add custom features
    formData.customFeatures.forEach((feature) => {
      const node = {
        id: feature.id,
        name: feature.name,
        isCustomFeature: true,
        priority: feature.priority,
        complexity: feature.complexity,
        children: []
      };
      
      // Add sub-features
      if (feature.subFeatures && feature.subFeatures.length > 0) {
        feature.subFeatures.forEach((subFeature, subIndex) => {
          node.children.push({
            id: `${feature.id}-sub-${subIndex}`,
            name: subFeature,
            isSubFeature: true,
            parentId: feature.id
          });
        });
      }
      
      treeData.push(node);
    });
    
    return treeData;
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
${formData.customFeatures.flatMap(f => f.subFeatures?.map(sub => `  - ${sub}`) || []).join('\n')}
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







                <React.Fragment key={feature.id}>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
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




























































                    {/* Feature Breakdown - moved inside the main feature div */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-medium text-gray-700 text-xs">Feature Breakdown</label>
                        <button
                          onClick={() => {


                            const breakdown = generateAIFeatureBreakdown(feature.name);
                            updateFeature(feature.id, { subFeatures: breakdown });
                          }}

                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >

                          <Sparkles className="w-3 h-3" />
                          Auto-Generate
                        </button>
                      </div>





























                      
                      <div className="space-y-1">
                        {feature.subFeatures && feature.subFeatures.map((subFeature, subIndex) => (
                          <div key={subIndex} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <input
                              type="text"
                              value={subFeature}
                              onChange={(e) => {
                                const newSubFeatures = [...feature.subFeatures];
                                newSubFeatures[subIndex] = e.target.value;
                                updateFeature(feature.id, { subFeatures: newSubFeatures });
                              }}
                              className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => {
                                const newSubFeatures = feature.subFeatures.filter((_, i) => i !== subIndex);
                                updateFeature(feature.id, { subFeatures: newSubFeatures });
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                          <input
                            type="text"
                            placeholder="Add sub-feature..."
                            className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const newSubFeatures = [...(feature.subFeatures || []), e.currentTarget.value.trim()];
                                updateFeature(feature.id, { subFeatures: newSubFeatures });
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              if (input.value.trim()) {
                                const newSubFeatures = [...(feature.subFeatures || []), input.value.trim()];
                                updateFeature(feature.id, { subFeatures: newSubFeatures });
                                input.value = '';
                              }
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </React.Fragment>
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
            <p className="text-sm text-gray-600">Hierarchical view of features and their sub-components</p>
            
            {/* Feature Tree */}
            <div className="bg-white border border-purple-200 rounded-lg p-2" style={{ height: '300px' }}>
              <Tree
                data={prepareTreeData()}
                width="100%"
                height={280}
                indent={24}
                rowHeight={28}
                overscanCount={5}
                paddingTop={10}
                paddingBottom={10}
                className="feature-dependency-tree"
              >
                {({ node, style, dragHandle, tree }) => {
                  // Determine node styling based on type
                  let nodeStyle = "flex items-center gap-2 px-2 py-1 rounded-md";
                  let iconComponent = null;
                  
                  if (node.data.isFeaturePack) {
                    nodeStyle += " bg-blue-50 text-blue-700 font-medium";
                    iconComponent = <Package className="w-3 h-3 text-blue-600" />;
                  } else if (node.data.isCustomFeature) {
                    nodeStyle += " bg-purple-50 text-purple-700 font-medium";
                    iconComponent = <Box className="w-3 h-3 text-purple-600" />;
                    
                    // Add priority and complexity indicators for custom features
                    if (node.data.priority) {
                      const priorityColors = {
                        must: "bg-red-100 text-red-700",
                        should: "bg-orange-100 text-orange-700",
                        could: "bg-yellow-100 text-yellow-700",
                        wont: "bg-gray-100 text-gray-700"
                      };
                      const priorityColor = priorityColors[node.data.priority as keyof typeof priorityColors] || "bg-gray-100 text-gray-700";
                      iconComponent = <div className={`w-3 h-3 rounded-full ${priorityColor.replace("text-", "bg-").replace("100", "600")}`} />;
                    }
                  } else if (node.data.isSubFeature) {
                    nodeStyle += " text-gray-700 pl-2";
                    iconComponent = <div className="w-2 h-2 rounded-full bg-gray-400" />;
                  }
                  
                  return (
                    <div className={nodeStyle} style={style} ref={dragHandle}>
                      {node.isOpen !== undefined && node.children.length > 0 ? (
                        <button
                          onClick={() => tree.toggle(node.id)}
                          className="w-4 h-4 flex items-center justify-center"
                        >
                          {node.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 transform -rotate-90" />}
                        </button>
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                      {iconComponent}
                      <span className="text-xs truncate">{node.data.name}</span>
                    </div>
                  );
                }}
              </Tree>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-sm text-purple-800">Feature Dependencies</h4>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Missing User Authentication for Social Features</li>
                <li>• File Upload requires Storage Configuration</li>
                <li>• Real-time features need WebSocket setup</li>
              </ul>
            </div>
            
            {/* CSS for the Tree component */}
            <style jsx>{`
              .feature-dependency-tree {
                font-family: inherit;
                color: inherit;
              }
              .feature-dependency-tree:focus {
                outline: none;
              }
              /* Add more custom styling as needed */
            `}
            </style>
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