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

// Updated interface to include suggestedPrimaryStage
interface PromptGenerationResult {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  suggestedPrimaryStage: string | null;
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
  static async generatePrompt(context: any, llmClient: any): Promise<PromptGenerationResult> {
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
      const suggestedPrimaryStage = intentData.suggestedPrimaryStage || null;
      
      // If no stages were identified, default to current stage
      if (relevantStageIds.length === 0) {
        console.log('⚠️ No relevant stages identified, defaulting to current stage');
        return {
          ...this.generateSingleStagePrompt(stageId, context),
          suggestedPrimaryStage
        };
      }
      
      // If we only have one stage (the current one), use the standard approach
      if (relevantStageIds.length === 1 && relevantStageIds[0] === stageId) {
        console.log('📝 Using single stage prompt for:', stageId);
        return {
          ...this.generateSingleStagePrompt(stageId, context),
          suggestedPrimaryStage
        };
      }
      
      // Otherwise, use prompt fusion for multiple stages
      console.log('🔄 Using prompt fusion for stages:', relevantStageIds);
      return {
        ...this.generateFusedPrompt(relevantStageIds, context),
        suggestedPrimaryStage
      };
      
    } catch (error) {
      // If intent classification fails, fall back to current stage
      console.error('❌ Intent classification failed:', error);
      console.log('⚠️ Falling back to current stage prompt');
      return {
        ...this.generateSingleStagePrompt(stageId, context),
        suggestedPrimaryStage: null
      };
    }
    
  }
  
  private static generateSingleStagePrompt(stageId: string, context: any): Omit<PromptGenerationResult, 'suggestedPrimaryStage'> {
    switch (stageId) {
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

  private static generateFusedPrompt(stageIds: string[], context: any): Omit<PromptGenerationResult, 'suggestedPrimaryStage'> {
    console.log('🔄 Generating fused prompt for stages:', stageIds);
    
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
  }
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