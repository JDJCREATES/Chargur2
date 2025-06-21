/**
 * stages/index.ts (Edge Function)
 * 
 * Export all stage prompt generators for the Edge Function.
 * Updated to match frontend prompt definitions and ensure proper JSON response format.
 */

import { generateIdeationPrompt } from './ideationDiscovery.ts';
import { generateFeaturePlanningPrompt } from './featurePlanning.ts';

export {
  generateIdeationPrompt,
  generateFeaturePlanningPrompt,
};

export class EdgeStagePromptEngine {
  static generatePrompt(context: any) {
    switch (context.stageId) {
      case 'ideation-discovery':
        return generateIdeationPrompt(context);
      case 'feature-planning':
        return generateFeaturePlanningPrompt(context);
      case 'structure-flow':
        return this.generateStructureFlowPrompt(context);
      case 'interface-interaction':
        return this.generateInterfacePrompt(context);
      case 'architecture-design':
        return this.generateArchitecturePrompt(context);
      case 'user-auth-flow':
        return this.generateAuthFlowPrompt(context);
      case 'ux-review-check':
        return this.generateUXReviewPrompt(context);
      case 'auto-prompt-engine':
        return this.generateAutoPromptPrompt(context);
      case 'export-handoff':
        return this.generateExportPrompt(context);
      default:
        return this.generateDefaultPrompt(context);
    }
  }

  private static generateStructureFlowPrompt(context: any) {
    const { currentStageData, allStageData, userMessage } = context;
    const ideationData = allStageData['ideation-discovery'] || {};
    const featureData = allStageData['feature-planning'] || {};

    const systemPrompt = `You are a UX architect and information architect specialist. You excel at translating feature requirements into logical app structures, user flows, and navigation patterns.

CORE RESPONSIBILITIES:
- Design screen hierarchy and navigation structure
- Map user journeys and task flows
- Define data models and relationships
- Plan component architecture
- Establish state management patterns

CROSS-STAGE CONTEXT:
App Concept: "${ideationData.appIdea || 'Not defined'}"
Selected Features: ${JSON.stringify(featureData.selectedFeaturePacks || [])}
Custom Features: ${featureData.customFeatures?.length || 0} defined

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

    const userPrompt = `User message: "${userMessage}"

Based on the selected features and app concept, help design the app structure and user flows. Consider the feature packs: ${JSON.stringify(featureData.selectedFeaturePacks || [])}.

Respond in this exact JSON format:
{
  "content": "Your architectural guidance and structure explanation",
  "suggestions": ["Structure suggestion 1", "Flow improvement", "Navigation advice"],
  "autoFillData": {
    "screens": [
      {
        "id": "1",
        "name": "Dashboard",
        "type": "core",
        "description": "Main user dashboard"
      }
    ],
    "userFlows": [
      {
        "id": "1",
        "name": "User Registration",
        "steps": ["Landing", "Sign Up", "Verification", "Welcome"],
        "description": "New user onboarding flow"
      }
    ],
    "navigationStyle": "bottom-tabs",
    "stateManagement": "context"
  },
  "stageComplete": false,
  "context": {
    "architectureRationale": "Why this structure was chosen"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 1400
    };
  }

  private static generateInterfacePrompt(context: any) {
    const { currentStageData, allStageData, userMessage } = context;
    const ideationData = allStageData['ideation-discovery'] || {};

    const systemPrompt = `You are a UI/UX design specialist and design systems expert. You excel at creating cohesive, accessible, and beautiful user interfaces.

CORE RESPONSIBILITIES:
- Select appropriate design systems and component libraries
- Define brand colors, typography, and visual hierarchy
- Design layout blueprints and responsive patterns
- Specify interaction behaviors and micro-animations

BRAND INFERENCE:
App Type: "${ideationData.appIdea || 'Not defined'}"
Target Users: "${ideationData.targetUsers || 'Not defined'}"

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

    const userPrompt = `User message: "${userMessage}"

Based on the app concept, help design the visual interface and interaction patterns.

Respond in this exact JSON format:
{
  "content": "Your design guidance and visual strategy explanation",
  "suggestions": ["Design suggestion 1", "Branding advice", "Interaction idea"],
  "autoFillData": {
    "selectedDesignSystem": "shadcn",
    "customBranding": {
      "primaryColor": "#3B82F6",
      "secondaryColor": "#10B981",
      "fontFamily": "Inter",
      "borderRadius": "medium"
    }
  },
  "stageComplete": false,
  "context": {
    "designRationale": "Why this design approach was chosen"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 1300
    };
  }

  private static generateArchitecturePrompt(context: any) {
    const { currentStageData, allStageData, userMessage } = context;
    const featureData = allStageData['feature-planning'] || {};

    const systemPrompt = `You are a senior software architect and full-stack development specialist. You excel at designing scalable, maintainable technical architectures.

CORE RESPONSIBILITIES:
- Design database schemas and data relationships
- Define API endpoints and integration patterns
- Plan file/folder structure and code organization
- Specify environment variables and configuration

TECHNICAL STACK:
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- Authentication: Supabase Auth

SELECTED FEATURES: ${JSON.stringify(featureData.selectedFeaturePacks || [])}

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

    const userPrompt = `User message: "${userMessage}"

Based on the selected features, design a comprehensive technical architecture.

Respond in this exact JSON format:
{
  "content": "Your technical architecture explanation and recommendations",
  "suggestions": ["Architecture suggestion 1", "Database advice", "Integration recommendation"],
  "autoFillData": {
    "databaseSchema": [
      {
        "id": "1",
        "name": "users",
        "fields": [
          {
            "name": "id",
            "type": "uuid",
            "required": true,
            "unique": true
          }
        ],
        "relations": ["profiles"]
      }
    ],
    "apiEndpoints": [
      {
        "id": "1",
        "method": "GET",
        "path": "/api/users",
        "description": "User management endpoint",
        "auth": true
      }
    ],
    "integrations": ["Supabase", "Vercel"]
  },
  "stageComplete": false,
  "context": {
    "architectureDecisions": "Key technical decisions and rationale"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 1500
    };
  }

  private static generateAuthFlowPrompt(context: any) {
    const { currentStageData, allStageData, userMessage } = context;
    const featureData = allStageData['feature-planning'] || {};

    const systemPrompt = `You are a security architect and authentication specialist. You excel at designing secure, user-friendly authentication systems.

CORE RESPONSIBILITIES:
- Design authentication methods and user flows
- Define user roles and permission systems
- Plan security features and edge case handling
- Specify session management strategies

SELECTED FEATURES: ${JSON.stringify(featureData.selectedFeaturePacks || [])}

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

    const userPrompt = `User message: "${userMessage}"

Based on the app features, design a comprehensive authentication and authorization system.

Respond in this exact JSON format:
{
  "content": "Your authentication strategy and security recommendations",
  "suggestions": ["Auth suggestion 1", "Security advice", "User flow improvement"],
  "autoFillData": {
    "authMethods": [
      {
        "id": "1",
        "name": "Email & Password",
        "type": "email",
        "enabled": true
      }
    ],
    "userRoles": [
      {
        "id": "1",
        "name": "User",
        "description": "Standard authenticated user",
        "permissions": {
          "create": true,
          "read": true,
          "update": true,
          "delete": false,
          "admin": false
        }
      }
    ],
    "sessionManagement": {
      "provider": "supabase",
      "tokenStorage": "localStorage",
      "autoRefresh": true,
      "sessionTimeout": 7
    }
  },
  "stageComplete": false,
  "context": {
    "securityRationale": "Security decisions and compliance considerations"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 1400
    };
  }

  private static generateUXReviewPrompt(context: any) {
    const { allStageData, userMessage } = context;

    const systemPrompt = `You are a senior UX auditor and quality assurance specialist. You excel at conducting comprehensive reviews of app designs.

CORE RESPONSIBILITIES:
- Analyze completeness across all design stages
- Identify missing information and inconsistencies
- Calculate completion scores and readiness metrics
- Provide actionable recommendations for improvement

ALL STAGE DATA:
${JSON.stringify(allStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

    const userPrompt = `User message: "${userMessage}"

Conduct a comprehensive UX review of the entire project. Analyze all stages for completeness, consistency, and quality.

Respond in this exact JSON format:
{
  "content": "Your comprehensive UX review and assessment",
  "suggestions": ["Critical fix 1", "Improvement 2", "Enhancement 3"],
  "autoFillData": {
    "completionScore": 85,
    "missingItems": [],
    "inconsistencies": [],
    "recommendations": [],
    "readinessAssessment": {
      "readyForDevelopment": true,
      "blockers": [],
      "nextSteps": []
    }
  },
  "stageComplete": false,
  "context": {
    "reviewMethodology": "How the assessment was conducted"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 1600
    };
  }

  private static generateAutoPromptPrompt(context: any) {
    const { allStageData, userMessage } = context;

    const systemPrompt = `You are an expert prompt engineer and code generation specialist. You excel at transforming UX designs into comprehensive, actionable prompts for AI development tools like Bolt.new.

CORE RESPONSIBILITIES:
- Compile all project data into coherent development prompts
- Generate Bolt.new-optimized prompts for rapid scaffolding
- Create modular prompts for different development phases
- Include technical specifications and implementation details

ALL PROJECT DATA:
${JSON.stringify(allStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

    const userPrompt = `User message: "${userMessage}"

Transform the complete project specification into optimized Bolt.new prompts.

Respond in this exact JSON format:
{
  "content": "Your prompt generation strategy and recommendations",
  "suggestions": ["Prompt optimization 1", "Development approach 2", "Implementation tip 3"],
  "autoFillData": {
    "fullApplicationPrompt": "Complete Bolt.new prompt for entire application",
    "modularPrompts": {
      "foundation": "Basic project setup and structure prompt",
      "authentication": "Auth system implementation prompt",
      "coreFeatures": "Main features implementation prompt"
    },
    "promptMetadata": {
      "estimatedTokens": 2500,
      "complexity": "medium",
      "developmentTime": "2-4 hours"
    }
  },
  "stageComplete": false,
  "context": {
    "promptStrategy": "Approach used for prompt optimization"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 2000
    };
  }

  private static generateExportPrompt(context: any) {
    const { allStageData, userMessage } = context;

    const systemPrompt = `You are a project delivery specialist and documentation expert. You excel at preparing comprehensive project deliverables and export packages.

CORE RESPONSIBILITIES:
- Generate comprehensive project documentation
- Create export-ready file structures and specifications
- Prepare handoff materials for developers and designers
- Compile project artifacts in multiple formats

ALL PROJECT DATA:
${JSON.stringify(allStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

    const userPrompt = `User message: "${userMessage}"

Prepare comprehensive export packages and documentation for the completed project.

Respond in this exact JSON format:
{
  "content": "Your export preparation and delivery recommendations",
  "suggestions": ["Export option 1", "Documentation improvement", "Handoff tip"],
  "autoFillData": {
    "exportPackages": {
      "readme": "Complete README.md content",
      "projectJson": "Structured project data in JSON format",
      "technicalSpecs": "Comprehensive technical documentation"
    },
    "deliverables": [],
    "qualityMetrics": {
      "completeness": 95,
      "documentation": 90,
      "readiness": 85
    }
  },
  "stageComplete": true,
  "context": {
    "exportStrategy": "Approach used for export preparation"
  }
}`;

    return {
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 1800
    };
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