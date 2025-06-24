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
import { generateIntentClassificationPrompt } from './intentClassifier.ts';

// Interface for prompt data
interface PromptData {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

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
  static async generatePrompt(context: any, llmClient: any): PromptData {
    // First, determine if we need to classify intent
    const { userMessage, stageId } = context;
    
    try {
      // Use LLM for intent classification
      console.log('🧠 Performing LLM-based intent classification');
      const intentPrompt = generateIntentClassificationPrompt(context);
      
      const intentResponse = await llmClient.generateResponse(
        intentPrompt.systemPrompt,
        intentPrompt.userPrompt,
        0.2, // Low temperature for more deterministic results
        500  // Small token limit for quick response
      );
      
      // Parse the intent classification response
      const intentData = JSON.parse(intentResponse);
      console.log('🧠 Intent classification results:', intentData);
      
      // Extract the relevant stage IDs
      const relevantStageIds = intentData.relevantStageIds || [];
      
      // If no stages were identified, default to current stage
      if (relevantStageIds.length === 0) {
        console.log('⚠️ No relevant stages identified, defaulting to current stage');
        return this.generateSingleStagePrompt(stageId, context);
      }
      
      // If we only have one stage (the current one), use the standard approach
      if (relevantStageIds.length === 1 && relevantStageIds[0] === stageId) {
        console.log('📝 Using single stage prompt for:', stageId);
        return this.generateSingleStagePrompt(stageId, context);
      }
      
      // Otherwise, use prompt fusion for multiple stages
      console.log('🔄 Using prompt fusion for stages:', relevantStageIds);
      return this.generateFusedPrompt(relevantStageIds, context);
      
    } catch (error) {
      // If intent classification fails, fall back to current stage
      console.error('❌ Intent classification failed:', error);
      console.log('⚠️ Falling back to current stage prompt');
      return this.generateSingleStagePrompt(stageId, context);
    }
    
  }
  
  private static generateSingleStagePrompt(stageId: string, context: any): PromptData {
    // Extract suggestedGoToStageId from intent classification if available
    const suggestedGoToStageId = context.intentData?.suggestedPrimaryStage || null;
    
    switch (stageId) {
      case 'ideation-discovery':
        return this.addGoToStageIdToPrompt(generateIdeationPrompt(context), suggestedGoToStageId);
      case 'feature-planning':
        return this.addGoToStageIdToPrompt(generateFeaturePlanningPrompt(context), suggestedGoToStageId);
      case 'structure-flow':
        return this.addGoToStageIdToPrompt(generateStructureFlowPrompt(context), suggestedGoToStageId);
      case 'interface-interaction':
        return this.addGoToStageIdToPrompt(generateInterfacePrompt(context), suggestedGoToStageId);
      case 'architecture-design':
        return this.addGoToStageIdToPrompt(generateArchitecturePrompt(context), suggestedGoToStageId);
      case 'user-auth-flow':
        return this.addGoToStageIdToPrompt(generateAuthFlowPrompt(context), suggestedGoToStageId);
      case 'ux-review-check':
        return this.addGoToStageIdToPrompt(generateUXReviewPrompt(context), suggestedGoToStageId);
      case 'auto-prompt-engine':
        return this.addGoToStageIdToPrompt(generateAutoPromptPrompt(context), suggestedGoToStageId);
      case 'export-handoff':
        return this.addGoToStageIdToPrompt(generateExportPrompt(context), suggestedGoToStageId);
      default:
        return this.addGoToStageIdToPrompt(this.generateDefaultPrompt(context), suggestedGoToStageId);
    }
  }

  private static generateFusedPrompt(stageIds: string[], context: any): PromptData {
    console.log('🔄 Generating fused prompt for stages:', stageIds);
    
    // Extract suggestedGoToStageId from intent classification if available
    const suggestedGoToStageId = context.intentData?.suggestedPrimaryStage || null;
    
    // Generate individual prompts for each stage
    const stagePrompts = stageIds.map(stageId => {
      const stageContext = { ...context, stageId };
      return this.generateSingleStagePrompt(stageId, stageContext);
    });
    
    // Fuse system prompts
    let fusedSystemPrompt = `You are a multi-capable AI assistant for app development planning. You can help with multiple aspects of the planning process simultaneously.

ACTIVE CAPABILITIES:
${stageIds.map(id => `- ${this.getStageName(id)}: ${this.getStageDescription(id)}`).join('\n')}

CROSS-STAGE INTELLIGENCE:
You can understand how different stages of app development relate to each other and provide holistic guidance.

`;

    // Add relevant sections from each stage's system prompt
    stagePrompts.forEach((prompt, index) => {
      const stageName = this.getStageName(stageIds[index]);
      fusedSystemPrompt += `\n\n--- ${stageName.toUpperCase()} CAPABILITIES ---\n`;
      
      // Extract the most important parts of the system prompt
      // This is a simplification - in a real implementation, you'd want to be more selective
      const systemPromptLines = prompt.systemPrompt.split('\n');
      const relevantLines = systemPromptLines
        .filter(line => 
          line.includes('CORE RESPONSIBILITIES:') || 
          line.includes('RESPONSIBILITIES:') ||
          (line.startsWith('- ') && line.length < 100)
        );
      
      fusedSystemPrompt += relevantLines.join('\n');
    });
    
    // Add instructions for structured response
    fusedSystemPrompt += `\n\nIMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;
    
    // Fuse user prompts
    let fusedUserPrompt = `User message: "${context.userMessage}"

Based on your analysis, this question relates to multiple stages of app development: ${stageIds.map(id => this.getStageName(id)).join(', ')}.

Please provide a comprehensive response that addresses all relevant aspects. Consider how these different stages interact with each other.

Respond in this exact JSON format:
{
  "content": "Your comprehensive response addressing all relevant stages",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "autoFillData": {
`;

    // Add stage-specific autoFillData structure
    stageIds.forEach(stageId => {
      fusedUserPrompt += `    "${stageId}": {
      // Stage-specific data fields
    },
`;
    });

    fusedUserPrompt += `  },
  "stageComplete": false,
  "context": {
    "relevantStages": [${stageIds.map(id => `"${id}"`).join(', ')}],
    "crossStageInsights": "Any insights about how these stages interact"
  },
  "goToStageId": ${suggestedGoToStageId ? `"${suggestedGoToStageId}"` : 'null'}
}`;

    // Calculate appropriate temperature and token limits
    const avgTemperature = stagePrompts.reduce((sum, p) => sum + p.temperature, 0) / stagePrompts.length;
    const maxTokens = Math.max(...stagePrompts.map(p => p.maxTokens)) + 500; // Add extra tokens for multi-stage response
    
    return {
      systemPrompt: fusedSystemPrompt,
      userPrompt: fusedUserPrompt,
      temperature: avgTemperature,
      maxTokens: maxTokens
    };
  }

  // Helper method to add goToStageId to prompt templates
  private static addGoToStageIdToPrompt(promptData: PromptData, suggestedGoToStageId: string | null): PromptData {
    // Only modify if we have a suggested stage
    if (!suggestedGoToStageId) return promptData;
    
    // Find the position of the closing JSON brace in the user prompt
    const userPrompt = promptData.userPrompt;
    const lastBraceIndex = userPrompt.lastIndexOf('}');
    
    if (lastBraceIndex === -1) return promptData; // Invalid JSON format
    
    // Check if goToStageId is already in the template
    if (userPrompt.includes('"goToStageId"')) return promptData;
    
    // Insert goToStageId field before the closing brace
    const updatedUserPrompt = 
      userPrompt.substring(0, lastBraceIndex) + 
      `,\n  "goToStageId": "${suggestedGoToStageId}"` + 
      userPrompt.substring(lastBraceIndex);
    
    return {
      ...promptData,
      userPrompt: updatedUserPrompt
    };
  }

  private static getStageName(stageId: string): string {
    const stageNames: Record<string, string> = {
      'ideation-discovery': 'Ideation & Discovery',
      'feature-planning': 'Feature Planning',
      'structure-flow': 'Structure & Flow',
      'interface-interaction': 'Interface & Interaction Design',
      'architecture-design': 'Architecture Design',
      'user-auth-flow': 'User & Auth Flow',
      'ux-review-check': 'UX Review & User Check',
      'auto-prompt-engine': 'Auto-Prompt Engine',
      'export-handoff': 'Export & Handoff'
    };
    
    return stageNames[stageId] || stageId;
  }
  
  private static getStageDescription(stageId: string): string {
    const stageDescriptions: Record<string, string> = {
      'ideation-discovery': 'Define app concept, target users, and value proposition',
      'feature-planning': 'Plan core features and prioritize functionality',
      'structure-flow': 'Design app structure, screens, and user flows',
      'interface-interaction': 'Create visual design and interaction patterns',
      'architecture-design': 'Define technical architecture and data models',
      'user-auth-flow': 'Design authentication and user management',
      'ux-review-check': 'Review and validate the complete design',
      'auto-prompt-engine': 'Generate development prompts for implementation',
      'export-handoff': 'Prepare documentation and handoff materials'
    };
    
    return stageDescriptions[stageId] || 'App development stage';
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
      maxTokens: 1000
    };
  }
}