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
    const { stageId, userMessage, currentStageData, allStageData, conversationHistory } = context;

    // Get stage-specific context
    const stageContext = this.getStageContext(stageId);
    const projectContext = this.buildProjectContext(allStageData);
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.type}: ${msg.content}`).join('\n')}`
      : '';

    const systemPrompt = `You are Charg AI, an expert UX strategist and app development consultant. You're helping users plan and design their app through a structured 9-stage process.

CURRENT STAGE: ${stageContext.title}
STAGE PURPOSE: ${stageContext.purpose}
STAGE GOALS: ${stageContext.goals.join(', ')}

PROJECT CONTEXT:
${projectContext}

CONVERSATION CONTEXT:${conversationContext}

YOUR ROLE:
- Guide users through the ${stageContext.title} stage with expert UX advice
- Provide actionable, specific recommendations
- Ask clarifying questions to uncover user needs
- Suggest concrete next steps and auto-fill data when possible
- Reference previous stage data to maintain project continuity
- Help users make informed decisions about their app

RESPONSE STYLE:
- Be conversational but professional
- Use bullet points for clarity
- Provide specific examples when helpful
- Ask follow-up questions to gather more details
- Suggest practical solutions and alternatives`;

    const userPrompt = `User is working on: "${stageId}" stage

Current stage data: ${JSON.stringify(currentStageData, null, 2)}

User message: "${userMessage}"

Provide expert guidance for this stage. Focus on:
1. Addressing their specific question or concern
2. Suggesting improvements to their current approach
3. Providing actionable next steps
4. Auto-filling relevant data if you can infer it from context
6. If the user asks to move to another stage, move to it and auto complete anything missing for the current stage.

Respond in this exact JSON format:
{
  "content": "Your expert response with specific guidance and recommendations",
  "suggestions": ["Actionable suggestion 1", "Follow-up question or next step", "Alternative approach or consideration"],
  "autoFillData": {
    "fieldName": "suggested value if applicable"
  },
  "stageComplete": boolean,
  "context": {
    "keyInsights": ["insight1", "insight2"],
    "nextSteps": ["step1", "step2"],
    "recommendations": ["rec1", "rec2"]
  }
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
      maxTokens: 1000
    };
  }

  // Helper method to get stage-specific context
  private static getStageContext(stageId: string) {
    const stageContexts = {
      'ideation-discovery': {
        title: 'Ideation & Discovery',
        purpose: 'Define the core app concept, problem, and target users',
        goals: ['Clarify app vision', 'Identify target users', 'Define value proposition', 'Understand competitive landscape']
      },
      'feature-planning': {
        title: 'Feature Planning',
        purpose: 'Plan and prioritize core features and functionality',
        goals: ['Select feature packs', 'Define custom features', 'Prioritize development', 'Plan MVP scope']
      },
      'structure-flow': {
        title: 'Structure & Flow',
        purpose: 'Design user flows and app structure',
        goals: ['Map user journeys', 'Define screen structure', 'Plan navigation', 'Optimize user experience']
      },
      'interface-interaction': {
        title: 'Interface & Interaction',
        purpose: 'Design UI components and interaction patterns',
        goals: ['Choose design system', 'Define interactions', 'Plan layouts', 'Create UI specifications']
      },
      'architecture-design': {
        title: 'Architecture Design',
        purpose: 'Plan technical architecture and data structure',
        goals: ['Design database schema', 'Plan API structure', 'Define integrations', 'Set up environment']
      },
      'user-auth-flow': {
        title: 'User Authentication Flow',
        purpose: 'Design secure user authentication and authorization',
        goals: ['Choose auth methods', 'Define user roles', 'Plan security features', 'Design onboarding']
      },
      'ux-review-check': {
        title: 'UX Review & Check',
        purpose: 'Review and validate the complete UX design',
        goals: ['Validate user flows', 'Check consistency', 'Identify gaps', 'Optimize experience']
      },
      'auto-prompt-engine': {
        title: 'Auto Prompt Engine',
        purpose: 'Generate intelligent prompts and recommendations',
        goals: ['Create smart suggestions', 'Generate content', 'Provide insights', 'Automate planning']
      },
      'export-handoff': {
        title: 'Export & Handoff',
        purpose: 'Prepare deliverables for development handoff',
        goals: ['Generate documentation', 'Export specifications', 'Create handoff materials', 'Prepare for development']
      }
    };

    return stageContexts[stageId as keyof typeof stageContexts] || {
      title: stageId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      purpose: 'Guide user through this stage of app development',
      goals: ['Provide helpful guidance', 'Answer questions', 'Suggest next steps']
    };
  }

  // Helper method to build project context from all stage data
  private static buildProjectContext(allStageData: any): string {
    const contexts = [];
    
    if (allStageData['ideation-discovery']) {
      const ideation = allStageData['ideation-discovery'];
      contexts.push(`App: ${ideation.appName || 'Unnamed'} - ${ideation.tagline || 'No tagline'}`);
      contexts.push(`Problem: ${ideation.problemStatement || 'Not defined'}`);
      contexts.push(`Target Users: ${ideation.targetUsers || 'Not defined'}`);
    }
    
    if (allStageData['feature-planning']) {
      const features = allStageData['feature-planning'];
      contexts.push(`Features: ${features.selectedFeaturePacks?.join(', ') || 'None selected'}`);
    }
    
    if (allStageData['structure-flow']) {
      const structure = allStageData['structure-flow'];
      contexts.push(`Screens: ${structure.screens?.length || 0} defined`);
    }
    
    if (allStageData['architecture-design']) {
      const arch = allStageData['architecture-design'];
      contexts.push(`Database: ${arch.databaseSchema?.length || 0} tables planned`);
    }
    
    return contexts.length > 0 ? contexts.join('\n') : 'New project - no previous stage data';
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