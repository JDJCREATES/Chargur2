/**
 * Types for Interface & Interaction stage
 */

export interface LayoutBlockOld {
  id: string;
  type: 'header' | 'sidebar' | 'content' | 'footer' | 'modal' | 'card';
  position: { x: number; y: number };
  size: { width: number; height: number };
  locked: boolean;
}

// Import the new LayoutBlock type from the main types file
import { LayoutBlock } from '../../../../types';

export interface InteractionRule {
  id: string;
  component: string;
  trigger: string;
  action: string;
  animation?: string;
}

export interface CopywritingItem {
  id: string;
  type: 'button' | 'label' | 'placeholder' | 'error' | 'heading';
  context: string;
  text: string;
  tone: 'professional' | 'playful' | 'casual';
}

export interface CustomBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily: string;
  bodyFont?: string;
  borderRadius: string;
}

export interface LofiLayout {
  layoutId: string;
  templateName: string;
  layoutBlocks: LayoutBlock[];
  description?: string;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export interface FormData {
  selectedDesignSystem: string;
  customBranding: CustomBranding;
  layoutBlocks: LayoutBlock[];
  interactionRules: InteractionRule[];
  navigationBehavior: {
    sidebarType: string;
    modalTriggers: string[];
    tabLogic: string;
  };
  copywriting: CopywritingItem[];
  previewMode: string;
  lofiLayouts?: LofiLayout[];
}