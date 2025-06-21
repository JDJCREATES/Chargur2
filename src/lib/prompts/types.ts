/**
 * types.ts
 * 
 * Type definitions for the prompt engineering system.
 */

export interface PromptContext {
  stageId: string;
  currentStageData: any;
  allStageData: any;
  conversationHistory: any[];
  userMessage: string;
  memory: any;
  recommendations?: any[];
}

export interface PromptResponse {
  systemPrompt: string;
  userPrompt: string;
  expectedFormat: any;
  temperature: number;
  maxTokens: number;
}

export interface AgentResponse {
  content: string;
  suggestions: string[];
  autoFillData: any;
  stageComplete: boolean;
  context: any;
  memoryUpdate?: any;
}

export interface StagePromptMetadata {
  stageId: string;
  temperature: number;
  maxTokens: number;
  expectedFormat: any;
  estimatedPromptLength: number;
  complexity: 'low' | 'medium' | 'high';
  crossStageIntelligence: boolean;
}