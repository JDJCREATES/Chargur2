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
import { UserFlows } from './structure-flow/UserFlows';
import { StateDataFlow } from './structure-flow/StateDataFlow';
import { FeatureBlueprints } from './structure-flow/FeatureBlueprints';
import { ModularUIComposition } from './structure-flow/ModularUIComposition';
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
    featureBlueprints: [] as FeatureBlueprint[],
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
    console.log(`Updated ${key} with:`, value);
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

  // Feature blueprint management
  const addFeatureBlueprint = () => {
    const newBlueprint: FeatureBlueprint = {
      id: uuidv4(),
      name: 'New Feature Blueprint',
      description: 'Describe this feature implementation...',
      components: ['Component1', 'Component2', 'Component3'],
      apis: ['api/endpoint1', 'api/endpoint2'],
      context: 'Where this feature appears in the app',
      category: 'core'
    };
    updateFormData('featureBlueprints', [...formData.featureBlueprints, newBlueprint]);
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

  // Process autoFill data when it comes from the AI
  useEffect(() => {
    // Check if we have new data from AI in initialFormData that's not in current formData
    if (initialFormData && Object.keys(initialFormData).length > 0) {
      const updatedData: Partial<FormData> = {};
      let hasUpdates = false;
      
      // Check for screens
      if (initialFormData.screens && 
          JSON.stringify(initialFormData.screens) !== JSON.stringify(formData.screens)) {
        updatedData.screens = initialFormData.screens;
        hasUpdates = true;
      }
      
      // Check for userFlows
      if (initialFormData.userFlows && 
          JSON.stringify(initialFormData.userFlows) !== JSON.stringify(formData.userFlows)) {
        updatedData.userFlows = initialFormData.userFlows;
        hasUpdates = true;
      }
      
      // Check for dataModels
      if (initialFormData.dataModels && 
          JSON.stringify(initialFormData.dataModels) !== JSON.stringify(formData.dataModels)) {
        updatedData.dataModels = initialFormData.dataModels;
        hasUpdates = true;
      }
      
      // Check for components
      if (initialFormData.components && 
          JSON.stringify(initialFormData.components) !== JSON.stringify(formData.components)) {
        updatedData.components = initialFormData.components;
        hasUpdates = true;
      }
      
      // Check for featureBlueprints
      if (initialFormData.featureBlueprints && 
          JSON.stringify(initialFormData.featureBlueprints) !== JSON.stringify(formData.featureBlueprints)) {
        updatedData.featureBlueprints = initialFormData.featureBlueprints;
        hasUpdates = true;
      }
      
      // Check for fileStructure
      if (initialFormData.fileStructure && 
          JSON.stringify(initialFormData.fileStructure) !== JSON.stringify(formData.fileStructure)) {
        updatedData.fileStructure = initialFormData.fileStructure;
        hasUpdates = true;
      }
      
      // Check for other properties
      const otherProps = [
        'navigationStyle', 'stateManagement', 'dataFlow', 
        'userFlowComplexity', 'screenDepth', 'includeOnboarding',
        'includeAuth', 'includeSettings'
      ];
      
      otherProps.forEach(prop => {
        if (initialFormData[prop] !== undefined && initialFormData[prop] !== formData[prop]) {
          updatedData[prop as keyof FormData] = initialFormData[prop];
          hasUpdates = true;
        }
      });
      
      // Update formData if we have changes
      if (hasUpdates) {
        console.log('Applying AI autofill data to Structure & Flow:', updatedData);
        setFormData(prev => ({ ...prev, ...updatedData }));
        onUpdateData({ ...formData, ...updatedData });
      }
    }
  }, [initialFormData, formData, onUpdateData]);

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
          <UserFlows 
            userFlows={formData.userFlows}
            onAddUserFlow={addUserFlow}
          />
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
          <FeatureBlueprints
            featureBlueprints={formData.featureBlueprints}
            onAddFeatureBlueprint={addFeatureBlueprint}
          />
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
          <ModularUIComposition
            components={formData.components}
            onAddComponent={addComponent}
          />
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