import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Workflow, 
  Component, 
  FolderTree, 
  Database, 
  GitBranch,
  Monitor,
  Smartphone,
  Code,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';

interface StructureFlowProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

interface Screen {
  id: string;
  name: string;
  type: 'core' | 'secondary' | 'modal';
}

interface DataModel {
  id: string;
  name: string;
  fields: string[];
}

interface UserFlow {
  id: string;
  name: string;
  steps: string[];
}

interface Component {
  id: string;
  name: string;
  type: 'layout' | 'ui' | 'form' | 'display';
  props: string[];
}

export const StructureFlow: React.FC<StructureFlowProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
}) => {
  const defaultFormData = {
    screens: [
      { id: '1', name: 'Login', type: 'core' as const },
      { id: '2', name: 'Dashboard', type: 'core' as const },
      { id: '3', name: 'Profile', type: 'secondary' as const },
      { id: '4', name: 'Settings', type: 'secondary' as const },
    ] as Screen[],
    dataModels: [
      { id: '1', name: 'User', fields: ['id', 'email', 'name', 'createdAt'] },
      { id: '2', name: 'Project', fields: ['id', 'title', 'description', 'userId'] },
    ] as DataModel[],
    userFlows: [
      { id: '1', name: 'User Registration', steps: ['Landing Page', 'Sign Up Form', 'Email Verification', 'Welcome Dashboard'] },
      { id: '2', name: 'Create Project', steps: ['Dashboard', 'New Project Button', 'Project Form', 'Project Created', 'Project View'] },
    ] as UserFlow[],
    components: [
      { id: '1', name: 'Navbar', type: 'layout' as const, props: ['user', 'onLogout'] },
      { id: '2', name: 'Sidebar', type: 'layout' as const, props: ['isOpen', 'onToggle'] },
      { id: '3', name: 'Card', type: 'ui' as const, props: ['title', 'children', 'className'] },
      { id: '4', name: 'Modal', type: 'ui' as const, props: ['isOpen', 'onClose', 'title'] },
    ] as Component[],
    fileStructure: {
      '/src': {
        '/components': {
          '/layout': ['Navbar.tsx', 'Sidebar.tsx', 'Footer.tsx'],
          '/ui': ['Card.tsx', 'Modal.tsx', 'Button.tsx'],
          '/forms': ['LoginForm.tsx', 'ProjectForm.tsx'],
        },
        '/pages': ['Dashboard.tsx', 'Profile.tsx', 'Settings.tsx'],
        '/hooks': ['useAuth.tsx', 'useProjects.tsx'],
        '/utils': ['api.ts', 'helpers.ts'],
        '/types': ['index.ts'],
      }
    },
    stateManagement: 'context',
    dataFlow: 'User creates Project → POST /api/projects → ProjectList updates → UI refreshes'
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  // Sync formData with initialFormData when it changes
  useEffect(() => {
    if (initialFormData) {
      console.log('Updating StructureFlow formData from initialFormData');
      setFormData(prev => ({
        ...prev,
        ...initialFormData
      }));
    }
  }, [initialFormData]);

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  const addScreen = () => {
    const newScreen: Screen = {
      id: Date.now().toString(),
      name: 'New Screen',
      type: 'secondary'
    };
    updateFormData('screens', [...formData.screens, newScreen]);
  };

  const removeScreen = (id: string) => {
    updateFormData('screens', formData.screens.filter(s => s.id !== id));
  };

  const updateScreen = (id: string, updates: Partial<Screen>) => {
    updateFormData('screens', formData.screens.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const addDataModel = () => {
    const newModel: DataModel = {
      id: Date.now().toString(),
      name: 'NewModel',
      fields: ['id', 'createdAt']
    };
    updateFormData('dataModels', [...formData.dataModels, newModel]);
  };

  const addUserFlow = () => {
    const newFlow: UserFlow = {
      id: Date.now().toString(),
      name: 'New User Flow',
      steps: ['Step 1', 'Step 2', 'Step 3']
    };
    updateFormData('userFlows', [...formData.userFlows, newFlow]);
  };

  const addComponent = () => {
    const newComponent: Component = {
      id: Date.now().toString(),
      name: 'NewComponent',
      type: 'ui',
      props: ['children']
    };
    updateFormData('components', [...formData.components, newComponent]);
  };

  const generateArchitectureSummary = () => {
    return `
**Architecture Overview**

**Screens (${formData.screens.length}):**
${formData.screens.map(s => `- ${s.name} (${s.type})`).join('\n')}

**Data Models (${formData.dataModels.length}):**
${formData.dataModels.map(m => `- ${m.name}: ${m.fields.join(', ')}`).join('\n')}

**User Flows (${formData.userFlows.length}):**
${formData.userFlows.map(f => `- ${f.name}: ${f.steps.length} steps`).join('\n')}

**Components (${formData.components.length}):**
${formData.components.map(c => `- <${c.name} /> (${c.type})`).join('\n')}

**State Management:** ${formData.stateManagement}

**Data Flow Pattern:** ${formData.dataFlow}
    `.trim();
  };

  return (
    <div className="p-4 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Structure & Flow</h3>
        <p className="text-sm text-gray-600">Design your app's architecture, screens, and user journeys</p>
      </div>

      {/* 2.1 Information Architecture */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Information Architecture</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Core Screens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-gray-800">Core Screens</h4>
                <button
                  onClick={addScreen}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-3 h-3" />
                  Add Screen
                </button>
              </div>
              <div className="space-y-2">
                {formData.screens.map((screen) => (
                  <div key={screen.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <input
                      type="text"
                      value={screen.name}
                      onChange={(e) => updateScreen(screen.id, { name: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={screen.type}
                      onChange={(e) => updateScreen(screen.id, { type: e.target.value as Screen['type'] })}
                      className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="core">Core</option>
                      <option value="secondary">Secondary</option>
                      <option value="modal">Modal</option>
                    </select>
                    <button
                      onClick={() => removeScreen(screen.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Models */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-gray-800">Data Models</h4>
                <button
                  onClick={addDataModel}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="w-3 h-3" />
                  Add Model
                </button>
              </div>
              <div className="space-y-2">
                {formData.dataModels.map((model) => (
                  <div key={model.id} className="p-2 bg-green-50 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-sm text-green-800">{model.name}</span>
                    </div>
                    <div className="text-xs text-green-600 ml-5">
                      {model.fields.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.2 User Flows */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">User Flows</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Map out key user journeys</p>
              <button
                onClick={addUserFlow}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-3 h-3" />
                Add Flow
              </button>
            </div>
            
            {formData.userFlows.map((flow) => (
              <div key={flow.id} className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-sm text-purple-800 mb-2">{flow.name}</h4>
                <div className="flex items-center gap-2 text-xs">
                  {flow.steps.map((step, index) => (
                    <React.Fragment key={index}>
                      <span className="px-2 py-1 bg-white rounded text-purple-700">{step}</span>
                      {index < flow.steps.length - 1 && <ArrowRight className="w-3 h-3 text-purple-400" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.3 Feature Blueprints */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Component className="w-4 h-4 text-orange-600" />
            <Typography className="font-medium text-sm">Feature Blueprints</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Break down features into components and API needs</p>
            <div className="bg-orange-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-orange-800 mb-2">Real-time Chat Feature</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-orange-700">Components:</span>
                  <span className="ml-2 text-orange-600">ChatInput, MessageList, MessageBubble</span>
                </div>
                <div>
                  <span className="font-medium text-orange-700">APIs:</span>
                  <span className="ml-2 text-orange-600">sendMessage(), getMessages(), subscribeToChat()</span>
                </div>
                <div>
                  <span className="font-medium text-orange-700">Context:</span>
                  <span className="ml-2 text-orange-600">Chat page, embedded in project view</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.4 Modular UI Composition */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-teal-600" />
            <Typography className="font-medium text-sm">Modular UI Composition</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Reusable component architecture</p>
              <button
                onClick={addComponent}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <Plus className="w-3 h-3" />
                Add Component
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {formData.components.map((component) => (
                <div key={component.id} className="p-2 bg-teal-50 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-teal-800">&lt;{component.name} /&gt;</span>
                    <span className="text-xs px-1 py-0.5 bg-teal-200 text-teal-700 rounded">
                      {component.type}
                    </span>
                  </div>
                  <div className="text-xs text-teal-600 ml-2">
                    Props: {component.props.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.5 Project File Structure */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-600" />
            <Typography className="font-medium text-sm">Project File Structure</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Organized folder structure for your project</p>
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs">
              <div>/src</div>
              <div className="ml-2">/components</div>
              <div className="ml-4">/layout → Navbar.tsx, Sidebar.tsx, Footer.tsx</div>
              <div className="ml-4">/ui → Card.tsx, Modal.tsx, Button.tsx</div>
              <div className="ml-4">/forms → LoginForm.tsx, ProjectForm.tsx</div>
              <div className="ml-2">/pages → Dashboard.tsx, Profile.tsx, Settings.tsx</div>
              <div className="ml-2">/hooks → useAuth.tsx, useProjects.tsx</div>
              <div className="ml-2">/utils → api.ts, helpers.ts</div>
              <div className="ml-2">/types → index.ts</div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.6 State & Data Flow */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-red-600" />
            <Typography className="font-medium text-sm">State & Data Flow</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State Management Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'local', label: 'Local State' },
                  { value: 'context', label: 'React Context' },
                  { value: 'zustand', label: 'Zustand' },
                  { value: 'redux', label: 'Redux Toolkit' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFormData('stateManagement', option.value)}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      formData.stateManagement === option.value
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Flow Pattern</label>
              <input
                type="text"
                value={formData.dataFlow}
                onChange={(e) => updateFormData('dataFlow', e.target.value)}
                placeholder="Describe your data flow..."
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 2.7 Architecture Summary */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Architecture Summary & Complete</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
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
        </AccordionDetails>
      </Accordion>
    </div>
  );
};