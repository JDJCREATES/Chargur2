import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Workflow, 
  Component, 
  FolderTree, 
  Database, 
  GitBranch,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  Screen, 
  DataModel, 
  UserFlow, 
  Component as ComponentType, 
  FileStructure,
  FormData
} from './structure-flow/types';
import { InformationArchitecture } from './structure-flow/InformationArchitecture';
import { StateDataFlow } from './structure-flow/StateDataFlow';
import { ProjectFileStructure } from './structure-flow/ProjectFileStructure';
import { StructureSummary } from './structure-flow/StructureSummary';

interface StructureFlowProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

export const StructureFlow: React.FC<StructureFlowProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
}) => {
  const defaultFormData: FormData = {
    screens: [
      { id: '1', name: 'Login', type: 'core' },
      { id: '2', name: 'Dashboard', type: 'core' },
      { id: '3', name: 'Profile', type: 'secondary' },
      { id: '4', name: 'Settings', type: 'secondary' },
    ],
    dataModels: [
      { id: '1', name: 'User', fields: ['id', 'email', 'name', 'createdAt'] },
      { id: '2', name: 'Project', fields: ['id', 'title', 'description', 'userId'] },
    ],
    userFlows: [
      { id: '1', name: 'User Registration', steps: ['Landing Page', 'Sign Up Form', 'Email Verification', 'Welcome Dashboard'] },
      { id: '2', name: 'Create Project', steps: ['Dashboard', 'New Project Button', 'Project Form', 'Project Created', 'Project View'] },
    ],
    components: [
      { id: '1', name: 'Navbar', type: 'layout', props: ['user', 'onLogout'] },
      { id: '2', name: 'Sidebar', type: 'layout', props: ['isOpen', 'onToggle'] },
      { id: '3', name: 'Card', type: 'ui', props: ['title', 'children', 'className'] },
      { id: '4', name: 'Modal', type: 'ui', props: ['isOpen', 'onClose', 'title'] },
    ],
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
      },
      '/public': ['favicon.ico', 'logo.svg', 'manifest.json'],
    },
    stateManagement: 'context',
    dataFlow: 'User creates Project → POST /api/projects → ProjectList updates → UI refreshes',
    navigationStyle: 'bottom-tabs',
    userFlowComplexity: 'standard',
    screenDepth: 'moderate',
    includeOnboarding: true,
    includeAuth: true,
    includeSettings: true
  };
  
  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...(initialFormData || {})
  }));

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  // Screen management
  const addScreen = () => {
    const newScreen: Screen = {
      id: uuidv4(),
      name: 'New Screen',
      type: 'secondary'
    };
    updateFormData('screens', [...formData.screens, newScreen]);
  };

  const removeScreen = (id: string) => {
    updateFormData('screens', formData.screens.filter((s: Screen) => s.id !== id));
  };

  const updateScreen = (id: string, updates: Partial<Screen>) => {
    updateFormData('screens', formData.screens.map((s: Screen) => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  // Data model management
  const addDataModel = () => {
    const newModel: DataModel = {
      id: uuidv4(),
      name: 'NewModel',
      fields: ['id', 'createdAt']
    };
    updateFormData('dataModels', [...formData.dataModels, newModel]);
  };

  // User flow management
  const addUserFlow = () => {
    const newFlow: UserFlow = {
      id: uuidv4(),
      name: 'New User Flow',
      steps: ['Step 1', 'Step 2', 'Step 3']
    };
    updateFormData('userFlows', [...formData.userFlows, newFlow]);
  };

  // Component management
  const addComponent = () => {
    const newComponent: ComponentType = {
      id: uuidv4(),
      name: 'NewComponent',
      type: 'ui',
      props: ['children']
    };
    updateFormData('components', [...formData.components, newComponent]);
  };

  // State management
  const updateStateManagement = (value: string) => {
    updateFormData('stateManagement', value);
  };

  // Data flow
  const updateDataFlow = (value: string) => {
    updateFormData('dataFlow', value);
  };

  return (
    <div className="p-2 space-y-2">
      {/* 2.1 Information Architecture */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Information Architecture</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <InformationArchitecture
            screens={formData.screens}
            dataModels={formData.dataModels}
            onAddScreen={addScreen}
            onRemoveScreen={removeScreen}
            onUpdateScreen={updateScreen}
            onAddDataModel={addDataModel}
          />
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
                  
            {formData.userFlows.map((flow: UserFlow) => (
              <div key={flow.id} className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-sm text-purple-800 mb-2">{flow.name}</h4>
                <div className="flex items-center gap-2 text-xs">
                  {flow.steps.map((step: string, index: number) => (
                    <React.Fragment key={index}>
                      <span className="px-2 py-1 bg-white rounded text-purple-700">{step}</span>
                      {index < flow.steps.length - 1 && <span className="text-purple-400">→</span>}
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
            <Component className="w-4 h-4 text-teal-600" />
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
              {formData.components.map((component: ComponentType) => (
                <div key={component.id} className="p-2 bg-teal-50 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-teal-800">{`<${component.name} />`}</span>
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
          <ProjectFileStructure fileStructure={formData.fileStructure} />
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
          <StateDataFlow
            stateManagement={formData.stateManagement}
            dataFlow={formData.dataFlow}
            onUpdateStateManagement={updateStateManagement}
            onUpdateDataFlow={updateDataFlow}
          />
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
          <StructureSummary
            formData={formData}
            onComplete={onComplete}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};