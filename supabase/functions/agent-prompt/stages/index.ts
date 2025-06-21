/**
 * stages/index.ts (Edge Function)
 * 
 * Export all stage prompt generators for the Edge Function.
 */

import { generateIdeationPrompt } from './ideationDiscovery';
import { generateFeaturePlanningPrompt } from './featurePlanning';
// Import other stages as they're implemented

export {
  generateIdeationPrompt,
  generateFeaturePlanningPrompt,
  // Export other stages
};

export class EdgeStagePromptEngine {
  static generatePrompt(context: any) {
    switch (context.stageId) {
      case 'ideation-discovery':
        return generateIdeationPrompt(context);
      case 'feature-planning':
        return generateFeaturePlanningPrompt(context);
      // Add other cases as stages are implemented
      default:
        return this.generateDefaultPrompt(context);
    }
  }

  private static generateDefaultPrompt(context: any) {
    const { stageId, userMessage } = context;

    const systemPrompt = `You are a helpful UX design assistant working on the "${stageId}" stage of app development planning. Provide contextual guidance and suggestions.`;

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
      temperature: 0.7,
      maxTokens: 800
    };
  }
}