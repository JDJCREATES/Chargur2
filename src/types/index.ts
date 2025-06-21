export interface Stage {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  comingSoon?: boolean;
}

export interface StageData {
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stages: Stage[];
  currentStageId: string;
  stageData: StageData;
  chatHistory: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}