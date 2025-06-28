import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers,
  Workflow,
  Component,
  FolderTree,
  GitBranch,
  CheckCircle,
  Code,
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';
import { FormData, Screen, DataModel, UserFlow, Component as UIComponent } from './structure-flow/types';
import { InformationArchitecture } from './structure-flow/InformationArchitecture';
import { UserFlows } from './structure-flow/UserFlows';
import { ModularUIComposition } from './structure-flow/ModularUIComposition';
import { ProjectFileStructure } from './structure-flow/ProjectFileStructure';
import { StateDataFlow } from './structure-flow/StateDataFlow';
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
    ] as UIComponent[],
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

  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...(initialFormData || {})
  }));

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
    updateFormData('screens', formData.screens.filter((s: Screen) => s.id !== id));
  };

  const updateScreen = (id: string, updates: Partial<Screen>) => {
    updateFormData('screens', formData.screens.map((s: Screen) => 
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
    const newComponent: UIComponent = {
      id: Date.now().toString(),
      name: 'NewComponent',
      type: 'ui',
      props: ['children']
    };
    updateFormData('components', [...formData.components, newComponent]);
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

      {/* 2.4 Modular UI Composition */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-teal-600" />
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
          <ProjectFileStructure
            fileStructure={formData.fileStructure}
          />
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
            onUpdateStateManagement={(value) => updateFormData('stateManagement', value)}
            onUpdateDataFlow={(value) => updateFormData('dataFlow', value)}
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