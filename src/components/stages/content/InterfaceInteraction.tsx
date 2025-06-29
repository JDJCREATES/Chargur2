import React, { useState } from 'react';
import { 
  Layout, 
  Palette, 
  MousePointer, 
  Navigation, 
  Type, 
  Eye, 
  CheckCircle,
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';
import {  
  InteractionRule, 
  CopywritingItem, 
  CustomBranding, 
  FormData as InterfaceFormData
} from './interface-interaction/types';
import { LayoutBlock } from '../../../types';
import { LayoutBlueprintingSection } from './interface-interaction/LayoutBlueprintingSection';
import { ComponentStylingSection } from './interface-interaction/ComponentStylingSection';
import { InteractionMappingSection } from './interface-interaction/InteractionMappingSection';
import { NavigationBehaviorSection } from './interface-interaction/NavigationBehaviorSection';
import { UXCopywritingSection } from './interface-interaction/UXCopywritingSection';
import { InteractionPreviewSection } from './interface-interaction/InteractionPreviewSection';
import { InterfaceSummarySection } from './interface-interaction/InterfaceSummarySection';
import { useAppStore } from '../../../store/useAppStore';
import { getSmartNodePosition } from '../../../lib/canvas/nodePlacementUtils';

interface InterfaceInteractionProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
  onAddLofiLayoutNode?: () => void;
}

export const InterfaceInteraction: React.FC<InterfaceInteractionProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
  onAddLofiLayoutNode
}) => {
  const defaultFormData = {
    selectedDesignSystem: 'shadcn',
    customBranding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter',
      borderRadius: 'medium',
    },
    layoutBlocks: [
      { 
        id: '1', 
        type: 'header' as const, 
        label: 'Header',
        position: { x: 0, y: 0 }, 
        size: { width: 100, height: 10 }, 
        locked: false 
      },
      { 
        id: '2', 
        type: 'sidebar' as const, 
        label: 'Sidebar',
        position: { x: 0, y: 10 }, 
        size: { width: 20, height: 80 }, 
        locked: false 
      },
      { 
        id: '3', 
        type: 'content' as const, 
        label: 'Main Content',
        position: { x: 20, y: 10 }, 
        size: { width: 80, height: 80 }, 
        locked: false 
      },
      { 
        id: '4', 
        type: 'footer' as const, 
        label: 'Footer',
        position: { x: 0, y: 90 }, 
        size: { width: 100, height: 10 }, 
        locked: false 
      },
    ],
    interactionRules: [
      { id: '1', component: 'Button', trigger: 'click', action: 'navigate', animation: 'scale' },
      { id: '2', component: 'Card', trigger: 'hover', action: 'highlight', animation: 'lift' },
      { id: '3', component: 'Form', trigger: 'submit', action: 'validate', animation: 'shake-on-error' },
    ],
    navigationBehavior: {
      sidebarType: 'collapsible',
      modalTriggers: ['settings', 'profile', 'help'],
      tabLogic: 'wizard-steps',
    },
    copywriting: [
      { id: '1', type: 'button' as const, context: 'Primary CTA', text: 'Get Started', tone: 'professional' as const },
      { id: '2', type: 'button' as const, context: 'Secondary Action', text: 'Learn More', tone: 'professional' as const },
      { id: '3', type: 'error' as const, context: 'Form Validation', text: 'Please check your input and try again', tone: 'professional' as const },
    ],
    previewMode: 'desktop',
  };
  
  const [formData, setFormData] = useState<InterfaceFormData>(() => ({
    ...defaultFormData,
    ...(initialFormData || {})
  }));

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  // Handler functions for each section
  const designSystems = [
    { id: 'shadcn', name: 'ShadCN/UI', desc: 'Modern, accessible components' },
    { id: 'mui', name: 'Material-UI', desc: 'Google Material Design' },
    { id: 'chakra', name: 'Chakra UI', desc: 'Simple & modular components' },
    { id: 'radix', name: 'Radix UI', desc: 'Low-level UI primitives' },
    { id: 'custom', name: 'Custom Tailwind', desc: 'Pure Tailwind CSS' },
  ];

  const animationPresets = [
    'fade-in', 'slide-up', 'slide-down', 'scale', 'bounce', 'shake', 'pulse', 'lift'
  ];

  const addLayoutBlock = () => {
    const blockSize = { width: 30, height: 20 };
    
    // Convert existing layout blocks to a format compatible with nodePlacementUtils
    const existingNodes = formData.layoutBlocks.map(block => ({
      id: block.id,
      type: block.type,
      position: block.position,
      data: {
        size: block.size
      }
    }));
    
    // Get smart position for the new block
    const smartPosition = getSmartNodePosition(
      existingNodes,
      blockSize,
      'card', // nodeType
      undefined, // preferredPosition
      'interface-interaction', // stageId
      true // isUserCreated
    );
    
    const newBlock: LayoutBlock = {
      id: Date.now().toString(),
      type: 'card',
      label: 'New Card', // Add the missing label
      position: smartPosition,
      size: blockSize,
      locked: false,
    };
    
    updateFormData('layoutBlocks', [...formData.layoutBlocks, newBlock]);
  };

  const updateInteractionRule = (ruleId: string, updates: Partial<InteractionRule>) => {
    const updatedRules = formData.interactionRules.map((rule: InteractionRule) => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    updateFormData('interactionRules', updatedRules);
  };

  const updateCopywritingItem = (itemId: string, updates: Partial<CopywritingItem>) => {
    const updatedItems = formData.copywriting.map((item: CopywritingItem) => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateFormData('copywriting', updatedItems);
  };

  const addInteractionRule = () => {
    const newRule: InteractionRule = {
      id: Date.now().toString(),
      component: 'Component',
      trigger: 'click',
      action: 'action',
      animation: 'fade-in',
    };
    updateFormData('interactionRules', [...formData.interactionRules, newRule]);
  };

  const addCopywritingItem = () => {
    const newItem: CopywritingItem = {
      id: Date.now().toString(),
      type: 'button',
      context: 'New Context',
      text: 'New Text',
      tone: 'professional',
    };
    updateFormData('copywriting', [...formData.copywriting, newItem]);
  };

  const updateCustomBranding = (updates: Partial<typeof formData.customBranding>) => {
    updateFormData('customBranding', { ...formData.customBranding, ...updates });
  };

  const generateDesignSummary = () => {
    return `
**Interface & Interaction Design Summary**

**Design System:** ${designSystems.find(ds => ds.id === formData.selectedDesignSystem)?.name}

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
    <div className="p-2 space-y-2">

      {/* 3.1 Layout Blueprinting */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Layout Blueprinting</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <LayoutBlueprintingSection
            previewMode={formData.previewMode}
            layoutBlocks={formData.layoutBlocks || []}
            onUpdatePreviewMode={(mode) => updateFormData('previewMode', mode)}
            onAddLofiLayoutNode={onAddLofiLayoutNode}
          />
        </AccordionDetails>
      </Accordion>

      {/* 3.2 Component Styling Pass */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">Component Styling Pass</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <ComponentStylingSection
            selectedDesignSystem={formData.selectedDesignSystem}
            customBranding={formData.customBranding}
            onUpdateDesignSystem={(system) => updateFormData('selectedDesignSystem', system)}
            onUpdateCustomBranding={updateCustomBranding}
          />
        </AccordionDetails>
      </Accordion>

      {/* 3.3 Interaction Mapping */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Interaction Mapping</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <InteractionMappingSection
            interactionRules={formData.interactionRules}
            onAddInteractionRule={addInteractionRule}
            onUpdateInteractionRule={updateInteractionRule}
          />
        </AccordionDetails>
      </Accordion>

      {/* 3.4 Modal & Navigation Behavior */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-orange-600" />
            <Typography className="font-medium text-sm">Modal & Navigation Behavior</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <NavigationBehaviorSection
            navigationBehavior={formData.navigationBehavior}
            onUpdateNavigationBehavior={(updates) => 
              updateFormData('navigationBehavior', { ...formData.navigationBehavior, ...updates })
            }
          />
        </AccordionDetails>
      </Accordion>

      {/* 3.5 UX Copywriting Layer */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-teal-600" />
            <Typography className="font-medium text-sm">UX Copywriting Layer</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <UXCopywritingSection
            copywriting={formData.copywriting}
            onAddCopywritingItem={addCopywritingItem}
            onUpdateCopywritingItem={updateCopywritingItem}
          />
        </AccordionDetails>
      </Accordion>

      {/* 3.6 Interaction Preview Mode */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <Typography className="font-medium text-sm">Interaction Preview Mode</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <InteractionPreviewSection />
        </AccordionDetails>
      </Accordion>

      {/* 3.7 Save to Design Journal */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Save to Design Journal & Complete</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <InterfaceSummarySection
            formData={formData}
            onComplete={onComplete}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};