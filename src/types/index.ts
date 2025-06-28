import { Node, Edge } from 'reactflow';


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

export interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'reference' | 'dependency' | 'flow';
}

export interface StreamingChatResponse {
  content: string;
  isComplete: boolean;
  suggestions: string[];
  isStreaming: boolean;
  error?: string | null;
}

