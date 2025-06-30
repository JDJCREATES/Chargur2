import { Node, Edge } from 'reactflow';
import { UXReviewFormData } from './uxReview';

// Add a proper interface for your custom node data
export interface CustomNodeData {
  title: string;
  content: string;
  color: string;
  connections: any[];
  metadata: {
    stage: string;
    nodeType?: string;
    [key: string]: any;
  };
  resizable: boolean;
  // Add other custom properties as needed
  subFeatures?: string[];
  value?: string;
  editable?: boolean;
  [key: string]: any; // Allow additional properties
}

export interface LayoutBlock {
  id: string;
  type: 'header' | 'sidebar' | 'content' | 'footer' | 'card' | 'modal' | 'navigation';
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
  locked?: boolean;
}

export interface LofiLayoutNodeData extends CustomNodeData {
  layoutId: string;
  templateName: string;
  layoutBlocks: LayoutBlock[]; 
  description?: string;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  editable: boolean;
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface StageData {
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  suggestions?: string[];
  autoFillData?: any;
  isComplete?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  current_stage_id: string;
  stage_data: StageData;
  canvas_nodes: Node[];
  canvas_connections: Edge[];
  created_at: string;
  updated_at: string;
}


export interface StreamingChatResponse {
  content: string;
  isComplete: boolean;
  suggestions: string[];
  isStreaming: boolean;
  error?: string | null;
}

// Re-export UX Review types
export type { CompletionItem, AIFeedback, UserTestScenario } from './uxReview';
