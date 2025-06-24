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
  static generatePrompt(context: any): PromptData {
    // First, determine if we need to classify intent
    const { userMessage, stageId } = context;
    
    // Perform lightweight intent classification
    const relevantStageIds = this.classifyUserIntent(userMessage, stageId, context);
    console.log('🧠 Intent classification results:', relevantStageIds);
    
    // If we only have one stage (the current one), use the standard approach
    if (relevantStageIds.length === 1 && relevantStageIds[0] === stageId) {
      console.log('📝 Using single stage prompt for:', stageId);
      return this.generateSingleStagePrompt(stageId, context);
    }
    
    // Otherwise, use prompt fusion for multiple stages
    console.log('🔄 Using prompt fusion for stages:', relevantStageIds);
    return this.generateFusedPrompt(relevantStageIds, context);
  }
  
  private static generateSingleStagePrompt(stageId: string, context: any): PromptData {
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

  private static classifyUserIntent(userMessage: string, currentStageId: string, context: any): string[] {
    // Simple keyword-based intent classification
    const stageKeywords: Record<string, string[]> = {
      'ideation-discovery': ['idea', 'concept', 'name', 'problem', 'mission', 'tagline', 'user', 'persona', 'competitor'],
      'feature-planning': ['feature', 'functionality', 'mvp', 'priority', 'moscow', 'core feature'],
      'structure-flow': ['structure', 'flow', 'screen', 'navigation', 'user flow', 'journey', 'sitemap'],
      'interface-interaction': ['interface', 'ui', 'design', 'color', 'layout', 'component', 'style', 'visual'],
      'architecture-design': ['architecture', 'database', 'schema', 'api', 'endpoint', 'technical', 'folder', 'structure'],
      'user-auth-flow': ['auth', 'authentication', 'login', 'register', 'user', 'role', 'permission', 'security'],
      'ux-review-check': ['review', 'check', 'validate', 'test', 'assessment', 'evaluation'],
      'auto-prompt-engine': ['prompt', 'generate', 'bolt', 'code', 'export', 'development'],
      'export-handoff': ['export', 'handoff', 'documentation', 'readme', 'deliver']
    };
    
    // Normalize message for better matching
    const normalizedMessage = userMessage.toLowerCase();
    
    // Check for explicit stage mentions
    const relevantStages: string[] = [];
    
    // First check for explicit mentions of stage names
    Object.entries(stageKeywords).forEach(([stageId, keywords]) => {
      // Check if any keyword is in the message
      const hasKeyword = keywords.some(keyword => 
        normalizedMessage.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        relevantStages.push(stageId);
      }
    });
    
    // If no explicit mentions, default to current stage
    if (relevantStages.length === 0) {
      return [currentStageId];
    }
    
    // Always include current stage if it's not already included
    if (!relevantStages.includes(currentStageId)) {
      relevantStages.unshift(currentStageId);
    }
    
    // Limit to at most 3 stages to keep prompts manageable
    return relevantStages.slice(0, 3);
  }
  
  private static generateFusedPrompt(stageIds: string[], context: any): PromptData {
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