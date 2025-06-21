/**
 * stages/index.ts (Edge Function)
 * 
 * Export all stage prompt generators for the Edge Function.
 * Updated to match frontend prompt definitions and ensure proper JSON response format.
 */

import { generateIdeationPrompt } from './ideationDiscovery.ts';
import { generateFeaturePlanningPrompt } from './featurePlanning.ts';
import { generateStructureFlowPrompt } from './structureFlow.ts';
import { generateInterfacePrompt } from './interfaceInteraction.ts';
import { generateArchitecturePrompt } from './architectureDesign.ts';
import { generateAuthFlowPrompt } from './userAuthFlow.ts';
import { generateUXReviewPrompt } from './uxReviewCheck.ts';
import { generateAutoPromptPrompt } from './autoPromptEngine.ts';
import { generateExportPrompt } from './exportHandoff.ts';

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

export class EdgeStagePromptEngine {
  static generatePrompt(context: any) {
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

  private static generateDefaultPrompt(context: any) {
    const { stageId, userMessage } = context;

    const systemPrompt = `You are a helpful UX design assistant working on the "${stageId}" stage of app development planning. 

Your role is to provide contextual guidance and suggestions to help users complete this stage effectively.

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure. Ensure your response is properly formatted JSON that can be parsed without errors.`;

    const userPrompt = `User message: "${userMessage}"

Provide helpful guidance for the ${stageId} stage.

Respond in this exact JSON format:
{
  "content": "Your helpful response about the ${stageId} stage",
  "suggestions": ["Helpful suggestion 1", "Helpful suggestion 2", "Helpful suggestion 3"],
  "autoFillData": {},
  "stageComplete": false,
  "context": {
    "stage": "${stageId}",
    "guidance": "General guidance provided"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 800
    };
  }
}