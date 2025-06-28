/**
 * Types for Interface & Interaction stage
 */

export interface LayoutBlock {
  id: string;
  type: 'header' | 'sidebar' | 'content' | 'footer' | 'modal' | 'card';
  position: { x: number; y: number };
  size: { width: number; height: number };
  locked: boolean;
}

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
  fontFamily: string;
  borderRadius: string;
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
}