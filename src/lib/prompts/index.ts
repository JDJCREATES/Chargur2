/**
 * index.ts
 * 
 * Main export file for the prompt engineering system.
 * Provides easy access to all stage-specific prompt generators.
 */

import { PromptContext, PromptResponse } from './types';
import { generateIdeationPrompt } from './stages/ideationDiscovery';
import { generateFeaturePlanningPrompt } from './stages/featurePlanning';
import { generateStructureFlowPrompt } from './stages/structureFlow';
import { generateInterfacePrompt } from './stages/interfaceInteraction';
import { generateArchitecturePrompt } from './stages/architectureDesign';
import { generateAuthFlowPrompt } from './stages/userAuthFlow';
import { generateUXReviewPrompt } from './stages/uxReviewCheck';
import { generateAutoPromptPrompt } from './stages/autoPromptEngine';
import { generateExportPrompt } from './stages/exportHandoff';

export * from './types';

export class StagePromptEngine {
  
  static generatePrompt(context: PromptContext): PromptResponse {
    switch (context.stageId) {
      case 'ideation-discovery':
        return generateIdeationPrompt(context);
      case 'feature-planning':
        return generateFeaturePlanningPrompt(context);
      case 'structure-flow':
        return generateStructureFlowPrompt(context);
      case 'interface-interaction':
        return generateInterfacePrompt(context);
      case 'architecture-design':
        return generateArchitecturePrompt(context);
      case 'user-auth-flow':
        return generateAuthFlowPrompt(context);
      case 'ux-review-check':
        return generateUXReviewPrompt(context);
      case 'auto-prompt-engine':
        return generateAutoPromptPrompt(context);
      case 'export-handoff':
        return generateExportPrompt(context);
      default:
        return this.generateDefaultPrompt(context);
    }
  }

  private static generateDefaultPrompt(context: PromptContext): PromptResponse {
    const { stageId, userMessage } = context;

    const systemPrompt = `You are a helpful UX design assistant. You're currently helping with the "${stageId}" stage of app development planning.

Provide helpful, contextual responses that guide the user through this stage of the design process.`;

    const userPrompt = `User message: "${userMessage}"

Provide helpful guidance for the ${stageId} stage.

Respond in this exact JSON format:
{
  "content": "Your helpful response",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "autoFillData": {},
  "stageComplete": false,
  "context": {}
}`;

    return {
      systemPrompt,
      userPrompt,
      expectedFormat: {
        content: "string",
        suggestions: "string[]",
        autoFillData: "object",
        stageComplete: "boolean",
        context: "object"
      },
      temperature: 0.7,
      maxTokens: 800
    };
  }

  // Utility methods for prompt validation and testing
  static validatePromptResponse(response: any, expectedFormat: any): boolean {
    try {
      // Check if response has required fields
      const requiredFields = Object.keys(expectedFormat);
      for (const field of requiredFields) {
        if (!(field in response)) {
          console.warn(`Missing required field: ${field}`);
          return false;
        }
      }

      // Validate field types
      for (const [field, expectedType] of Object.entries(expectedFormat)) {
        const actualValue = response[field];
        
        if (expectedType === 'string' && typeof actualValue !== 'string') {
          console.warn(`Field ${field} should be string, got ${typeof actualValue}`);
          return false;
        }
        
        if (expectedType === 'string[]' && !Array.isArray(actualValue)) {
          console.warn(`Field ${field} should be array, got ${typeof actualValue}`);
          return false;
        }
        
        if (expectedType === 'object' && (typeof actualValue !== 'object' || actualValue === null)) {
          console.warn(`Field ${field} should be object, got ${typeof actualValue}`);
          return false;
        }
        
        if (expectedType === 'boolean' && typeof actualValue !== 'boolean') {
          console.warn(`Field ${field} should be boolean, got ${typeof actualValue}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Prompt validation error:', error);
      return false;
    }
  }

  static getPromptPreview(stageId: string): string {
    const mockContext: PromptContext = {
      stageId,
      currentStageData: {},
      allStageData: {},
      conversationHistory: [],
      userMessage: "Help me get started with this stage",
      memory: {},
      recommendations: []
    };

    const prompt = this.generatePrompt(mockContext);
    return `${prompt.systemPrompt}\n\n---\n\n${prompt.userPrompt}`;
  }

  static getStagePromptMetadata(stageId: string) {
    const mockContext: PromptContext = {
      stageId,
      currentStageData: {},
      allStageData: {},
      conversationHistory: [],
      userMessage: "",
      memory: {},
      recommendations: []
    };

    const prompt = this.generatePrompt(mockContext);
    
    return {
      stageId,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
      expectedFormat: prompt.expectedFormat,
      estimatedPromptLength: prompt.systemPrompt.length + prompt.userPrompt.length,
      complexity: this.getPromptComplexity(prompt),
      crossStageIntelligence: this.hasCrossStageIntelligence(stageId)
    };
  }

  private static getPromptComplexity(prompt: PromptResponse): 'low' | 'medium' | 'high' {
    const totalLength = prompt.systemPrompt.length + prompt.userPrompt.length;
    const formatComplexity = Object.keys(prompt.expectedFormat).length;
    
    if (totalLength > 3000 || formatComplexity > 8) return 'high';
    if (totalLength > 1500 || formatComplexity > 5) return 'medium';
    return 'low';
  }

  private static hasCrossStageIntelligence(stageId: string): boolean {
    const crossStageStages = [
      'feature-planning',
      'structure-flow', 
      'interface-interaction',
      'architecture-design',
      'user-auth-flow',
      'ux-review-check',
      'auto-prompt-engine',
      'export-handoff'
    ];
    
    return crossStageStages.includes(stageId);
  }
}

// Export utility functions for testing and debugging
export const PromptUtils = {
  validateResponse: StagePromptEngine.validatePromptResponse,
  getPreview: StagePromptEngine.getPromptPreview,
  getMetadata: StagePromptEngine.getStagePromptMetadata,
};

// Export individual stage prompt generators for direct use
export {
  generateIdeationPrompt,
  generateFeaturePlanningPrompt,
  generateStructureFlowPrompt,
  generateInterfacePrompt,
  generateArchitecturePrompt,
  generateAuthFlowPrompt,
  generateUXReviewPrompt,
  generateAutoPromptPrompt,
  generateExportPrompt,
};