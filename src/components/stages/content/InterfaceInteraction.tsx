import React, { useState } from 'react';
import { 
  Layout, 
  Palette, 
  MousePointer, 
  Navigation, 
  Type, 
  Eye, 
  Smartphone,
  Monitor,
  Tablet,
  Grid,
  Zap,
  Settings,
  FileText,
  Download,
  CheckCircle,
  Plus,
  Edit3,
  Copy
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';

interface InterfaceInteractionProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

interface LayoutBlock {
  id: string;
  type: 'header' | 'sidebar' | 'content' | 'footer' | 'modal' | 'card';
  position: { x: number; y: number };
  size: { width: number; height: number };
  locked: boolean;
}

interface InteractionRule {
  id: string;
  component: string;
  trigger: string;
  action: string;
  animation?: string;
}

interface CopywritingItem {
  id: string;
  type: 'button' | 'label' | 'placeholder' | 'error' | 'heading';
  context: string;
  text: string;
  tone: 'professional' | 'playful' | 'casual';
}

export const InterfaceInteraction: React.FC<InterfaceInteractionProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
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
      { id: '1', type: 'header' as const, position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: false },
      { id: '2', type: 'sidebar' as const, position: { x: 0, y: 10 }, size: { width: 20, height: 80 }, locked: false },
      { id: '3', type: 'content' as const, position: { x: 20, y: 10 }, size: { width: 80, height: 80 }, locked: false },
      { id: '4', type: 'footer' as const, position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: false },
    ] as LayoutBlock[],
    interactionRules: [
      { id: '1', component: 'Button', trigger: 'click', action: 'navigate', animation: 'scale' },
      { id: '2', component: 'Card', trigger: 'hover', action: 'highlight', animation: 'lift' },
      { id: '3', component: 'Form', trigger: 'submit', action: 'validate', animation: 'shake-on-error' },
    ] as InteractionRule[],
    navigationBehavior: {
      sidebarType: 'collapsible',
      modalTriggers: ['settings', 'profile', 'help'],
      tabLogic: 'wizard-steps',
    },
    copywriting: [
      { id: '1', type: 'button' as const, context: 'Primary CTA', text: 'Get Started', tone: 'professional' as const },
      { id: '2', type: 'button' as const, context: 'Secondary Action', text: 'Learn More', tone: 'professional' as const },
      { id: '3', type: 'error' as const, context: 'Form Validation', text: 'Please check your input and try again', tone: 'professional' as const },
    ] as CopywritingItem[],
    previewMode: 'desktop',
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
    const newBlock: LayoutBlock = {
      id: Date.now().toString(),
      type: 'card',
      position: { x: 50, y: 50 },
      size: { width: 30, height: 20 },
      locked: false,
    };
    updateFormData('layoutBlocks', [...formData.layoutBlocks, newBlock]);
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
    <div className="p-4 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Interface & Interaction Design</h3>
        <p className="text-sm text-gray-600">Design your app's visual interface and user interactions</p>
      </div>

      {/* 3.1 Layout Blueprinting */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Layout Blueprinting</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Viewport Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'desktop', label: 'Desktop', icon: Monitor },
                  { value: 'tablet', label: 'Tablet', icon: Tablet },
                  { value: 'mobile', label: 'Mobile', icon: Smartphone },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => updateFormData('previewMode', mode.value)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        formData.previewMode === mode.value
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout Canvas */}
            <div className="bg-gray-100 rounded-lg p-4 min-h-64 relative">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-800">Layout Canvas</h4>
                <div className="flex gap-2">
                  <button
                    onClick={addLayoutBlock}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    Add Block
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    <Grid className="w-3 h-3" />
                    Grid
                  </button>
                </div>
              </div>
              
              {/* Simplified Layout Visualization */}
              <div className="bg-white rounded border-2 border-dashed border-gray-300 h-48 relative">
                {formData.layoutBlocks.map((block: LayoutBlock) => (
                  <div
                    key={block.id}
                    className={`absolute border-2 rounded flex items-center justify-center text-xs font-medium ${
                      block.locked ? 'border-red-300 bg-red-50 text-red-700' : 'border-blue-300 bg-blue-50 text-blue-700'
                    }`}
                    style={{
                      left: `${block.position.x}%`,
                      top: `${block.position.y}%`,
                      width: `${block.size.width}%`,
                      height: `${block.size.height}%`,
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {block.locked && <Settings className="w-3 h-3" />}
                      <span>{block.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
          <div className="space-y-4">
            {/* Design System Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Design System</label>
              <div className="grid grid-cols-1 gap-2">
                {designSystems.map((system) => (
                  <button
                    key={system.id}
                    onClick={() => updateFormData('selectedDesignSystem', system.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.selectedDesignSystem === system.id
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-sm">{system.name}</div>
                    <div className="text-xs text-gray-500">{system.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Branding */}
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-purple-800 mb-3">Custom Branding</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.customBranding.primaryColor}
                      onChange={(e) => updateFormData('customBranding', { ...formData.customBranding, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-purple-200"
                    />
                    <input
                      type="text"
                      value={formData.customBranding.primaryColor}
                      onChange={(e) => updateFormData('customBranding', { ...formData.customBranding, primaryColor: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.customBranding.secondaryColor}
                      onChange={(e) => updateFormData('customBranding', { ...formData.customBranding, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-purple-200"
                    />
                    <input
                      type="text"
                      value={formData.customBranding.secondaryColor}
                      onChange={(e) => updateFormData('customBranding', { ...formData.customBranding, secondaryColor: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Font Family</label>
                  <select
                    value={formData.customBranding.fontFamily}
                    onChange={(e) => updateFormData('customBranding', { ...formData.customBranding, fontFamily: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Border Radius</label>
                  <select
                    value={formData.customBranding.borderRadius}
                    onChange={(e) => updateFormData('customBranding', { ...formData.customBranding, borderRadius: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="none">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Define component interactions and animations</p>
              <button
                onClick={addInteractionRule}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-3 h-3" />
                Add Rule
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.interactionRules.map((rule: InteractionRule) => (
                <div key={rule.id} className="p-3 bg-green-50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block font-medium text-green-700 mb-1">Component</label>
                      <input
                        type="text"
                        value={rule.component}
                        readOnly={true}
                        className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-green-700 mb-1">Trigger</label>
                      <select 
                        value={rule.trigger}
                        onChange={(e) => {
                          const updatedRules = formData.interactionRules.map((r: InteractionRule) => 
                            r.id === rule.id ? { ...r, trigger: e.target.value } : r
                          );
                          updateFormData('interactionRules', updatedRules);
                        }}
                        className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500">
                        <option value="click">Click</option>
                        <option value="hover">Hover</option>
                        <option value="focus">Focus</option>
                        <option value="submit">Submit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-green-700 mb-1">Action</label>
                      <input
                        type="text"
                        value={rule.action}
                        readOnly={true}
                        className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-green-700 mb-1">Animation</label>
                      <select 
                        value={rule.animation}
                        onChange={(e) => {
                          const updatedRules = formData.interactionRules.map((r: InteractionRule) => 
                            r.id === rule.id ? { ...r, animation: e.target.value } : r
                          );
                          updateFormData('interactionRules', updatedRules);
                        }}
                        className="w-full px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500">
                        {animationPresets.map(preset => (
                          <option key={preset} value={preset}>{preset}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'persistent', label: 'Persistent' },
                    { value: 'collapsible', label: 'Collapsible' },
                    { value: 'off-canvas', label: 'Off-Canvas' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateFormData('navigationBehavior', { ...formData.navigationBehavior, sidebarType: type.value })}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        formData.navigationBehavior.sidebarType === type.value
                          ? 'bg-orange-50 border-orange-200 text-orange-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tab Logic</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'wizard-steps', label: 'Wizard Steps' },
                    { value: 'free-navigation', label: 'Free Navigation' },
                  ].map((logic) => (
                    <button
                      key={logic.value}
                      onClick={() => updateFormData('navigationBehavior', { ...formData.navigationBehavior, tabLogic: logic.value })}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        formData.navigationBehavior.tabLogic === logic.value
                          ? 'bg-orange-50 border-orange-200 text-orange-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {logic.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Customize all text elements in your app</p>
              <button
                onClick={addCopywritingItem}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <Plus className="w-3 h-3" />
                Add Text
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.copywriting.map((item: CopywritingItem) => (
                <div key={item.id} className="p-3 bg-teal-50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Type</label>
                      <select 
                        value={item.type}
                        onChange={(e) => {
                          const updatedItems = formData.copywriting.map((i: CopywritingItem) => 
                            i.id === item.id ? { ...i, type: e.target.value as 'button' | 'label' | 'placeholder' | 'error' | 'heading' } : i
                          );
                          updateFormData('copywriting', updatedItems);
                        }}
                        className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500">
                        <option value="button">Button</option>
                        <option value="label">Label</option>
                        <option value="placeholder">Placeholder</option>
                        <option value="error">Error</option>
                        <option value="heading">Heading</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Context</label>
                      <input
                        type="text"
                        value={item.context}
                        readOnly={true}
                        className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Text</label>
                      <input
                        type="text"
                        value={item.text}
                        className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Tone</label>
                      <select 
                        value={item.tone}
                        onChange={(e) => {
                          const updatedItems = formData.copywriting.map((i: CopywritingItem) => 
                            i.id === item.id ? { ...i, tone: e.target.value as 'professional' | 'playful' | 'casual' } : i
                          );
                          updateFormData('copywriting', updatedItems);
                        }}
                        className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500">
                        <option value="professional">Professional</option>
                        <option value="playful">Playful</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="font-medium text-indigo-800 mb-2">High-Fidelity Preview</h4>
              <p className="text-sm text-indigo-600 mb-4">
                Preview all screens with styled components and simulated interactions
              </p>
              <div className="flex gap-2 justify-center">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  <Eye className="w-4 h-4" />
                  Launch Preview
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  <Edit3 className="w-4 h-4" />
                  Add Comments
                </button>
              </div>
            </div>
          </div>
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
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 mb-2">Design Summary</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateDesignSummary()}</pre>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Export Figma
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <FileText className="w-4 h-4" />
                Export HTML
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                <Copy className="w-4 h-4" />
                Copy JSON
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700">
                <Zap className="w-4 h-4" />
                Send to Bolt
              </button>
            </div>
            
            <button
              onClick={onComplete}
              className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Complete Interface & Interaction Design
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};