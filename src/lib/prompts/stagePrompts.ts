/**
 * stagePrompts.ts
 * 
 * Comprehensive prompt engineering system for each stage of the Chargur workflow.
 * Provides context-aware, structured prompts that guide the LLM to generate
 * high-quality, actionable responses with proper auto-fill data.
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

export class StagePromptEngine {
  
  static generatePrompt(context: PromptContext): PromptResponse {
    switch (context.stageId) {
      case 'ideation-discovery':
        return this.generateIdeationPrompt(context);
      case 'feature-planning':
        return this.generateFeaturePlanningPrompt(context);
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

  private static generateIdeationPrompt(context: PromptContext): PromptResponse {
    const { currentStageData, userMessage, conversationHistory } = context;
    
    const systemPrompt = `You are an expert UX strategist and product discovery specialist. Your role is to help users define and refine their app concept through intelligent questioning and strategic guidance.

CORE RESPONSIBILITIES:
- Extract app ideas from natural language descriptions
- Generate compelling app names and taglines
- Identify target problems and user segments
- Craft clear value propositions
- Suggest competitive positioning

CONVERSATION CONTEXT:
${conversationHistory.length > 0 ? `Previous conversation: ${JSON.stringify(conversationHistory.slice(-3))}` : 'This is the start of our conversation.'}

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

RESPONSE GUIDELINES:
1. Be conversational and encouraging
2. Ask follow-up questions to clarify vague concepts
3. Provide specific, actionable auto-fill suggestions
4. Reference previous context when relevant
5. Guide toward completion when sufficient data exists

AUTO-FILL OPPORTUNITIES:
- appIdea: Extract from "I want to build..." or "app about..." patterns
- appName: Generate from keywords in the idea (2-3 words, PascalCase)
- tagline: Create memorable 3-5 word tagline
- problemStatement: Identify the core user problem being solved
- targetUsers: Suggest user segments based on the app idea
- valueProposition: Articulate unique value and benefits

COMPLETION CRITERIA:
Stage is complete when we have: appIdea, appName, problemStatement, targetUsers, and valueProposition.`;

    const userPrompt = `User message: "${userMessage}"

Based on this message and our conversation history, help the user develop their app concept. If you can extract specific information, provide it in the autoFillData. If the stage appears complete, set stageComplete to true.

Respond in this exact JSON format:
{
  "content": "Your conversational response to the user",
  "suggestions": ["Quick action 1", "Quick action 2", "Quick action 3"],
  "autoFillData": {
    "appIdea": "extracted or suggested app idea",
    "appName": "suggested app name",
    "tagline": "memorable tagline",
    "problemStatement": "core problem statement",
    "targetUsers": "target user description",
    "valueProposition": "unique value proposition"
  },
  "stageComplete": false,
  "context": {
    "extractedInfo": "what information was extracted",
    "nextSteps": "what should happen next"
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

  private static generateFeaturePlanningPrompt(context: PromptContext): PromptResponse {
    const { currentStageData, allStageData, userMessage } = context;
    const ideationData = allStageData['ideation-discovery'] || {};

    const systemPrompt = `You are a senior product manager and feature strategist. Your expertise lies in translating app concepts into concrete, prioritized feature sets that align with user needs and business goals.

CORE RESPONSIBILITIES:
- Analyze app concepts to suggest relevant feature packs
- Help prioritize features using MoSCoW method (Must, Should, Could, Won't)
- Identify feature dependencies and conflicts
- Recommend MVP vs. future version features
- Suggest technical complexity and implementation order

CROSS-STAGE INTELLIGENCE:
App Concept: "${ideationData.appIdea || 'Not defined'}"
Target Users: "${ideationData.targetUsers || 'Not defined'}"
Problem Statement: "${ideationData.problemStatement || 'Not defined'}"

FEATURE PACK MAPPING:
- Social/Community apps → social, communication, media
- E-commerce apps → commerce, auth, analytics, media
- Productivity apps → auth, crud, analytics
- Educational apps → auth, media, analytics, communication
- Healthcare apps → auth, crud, communication, analytics (high security)
- Gaming apps → auth, social, media, analytics
- Business tools → auth, crud, analytics, communication

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

AUTO-FILL STRATEGY:
1. Analyze app idea keywords for feature pack suggestions
2. Consider target users for feature prioritization
3. Suggest custom features based on unique value proposition
4. Recommend MVP feature subset for initial launch`;

    const userPrompt = `User message: "${userMessage}"

Based on the app concept and user message, help plan features strategically. Consider the app idea "${ideationData.appIdea}" and target users "${ideationData.targetUsers}".

Provide intelligent feature recommendations and help prioritize for MVP success.

Respond in this exact JSON format:
{
  "content": "Your strategic response about feature planning",
  "suggestions": ["Feature suggestion 1", "Priority guidance", "MVP advice"],
  "autoFillData": {
    "selectedFeaturePacks": ["auth", "crud", "social"],
    "customFeatures": [
      {
        "id": "1",
        "name": "Custom Feature Name",
        "description": "Feature description",
        "priority": "must|should|could|wont",
        "complexity": "low|medium|high",
        "category": "frontend|backend|both"
      }
    ],
    "mvpFeatures": ["Essential feature 1", "Essential feature 2"],
    "futureFeatures": ["V2 feature 1", "V2 feature 2"]
  },
  "stageComplete": false,
  "context": {
    "featureRationale": "Why these features were suggested",
    "mvpStrategy": "MVP approach recommendation"
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
      temperature: 0.6,
      maxTokens: 1200
    };
  }

  private static generateStructureFlowPrompt(context: PromptContext): PromptResponse {
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

SCREEN GENERATION LOGIC:
Base screens: Dashboard, Profile, Settings
+ Auth features → Login, Register, Forgot Password
+ Social features → Feed, Messages, Notifications
+ Commerce features → Products, Cart, Checkout, Orders
+ Media features → Gallery, Upload, Media Library
+ Analytics features → Reports, Insights

USER FLOW PATTERNS:
- Onboarding: Landing → Auth → Welcome → Core Feature
- Core Task: Dashboard → Feature → Action → Confirmation → Result
- Social: Feed → Content → Interaction → Response
- Commerce: Browse → Select → Cart → Checkout → Confirmation

DATA MODEL INFERENCE:
- Auth features → Users, Sessions, Profiles
- Social features → Posts, Comments, Likes, Follows
- Commerce features → Products, Orders, Payments, Inventory
- Content features → Media, Categories, Tags

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}`;

    const userPrompt = `User message: "${userMessage}"

Based on the selected features and app concept, help design the app structure and user flows. Consider the feature packs: ${JSON.stringify(featureData.selectedFeaturePacks || [])}.

Create a logical, user-friendly structure that supports all planned features.

Respond in this exact JSON format:
{
  "content": "Your architectural guidance and structure explanation",
  "suggestions": ["Structure suggestion 1", "Flow improvement", "Navigation advice"],
  "autoFillData": {
    "screens": [
      {
        "id": "1",
        "name": "Dashboard",
        "type": "core|secondary|modal",
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
    "dataModels": [
      {
        "id": "1",
        "name": "User",
        "fields": ["id", "email", "name", "createdAt"],
        "relations": ["Profile", "Posts"]
      }
    ],
    "navigationStyle": "bottom-tabs|side-drawer|top-tabs",
    "stateManagement": "context|zustand|redux"
  },
  "stageComplete": false,
  "context": {
    "architectureRationale": "Why this structure was chosen",
    "scalabilityNotes": "How structure supports growth"
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
      temperature: 0.5,
      maxTokens: 1400
    };
  }

  private static generateInterfacePrompt(context: PromptContext): PromptResponse {
    const { currentStageData, allStageData, userMessage } = context;
    const ideationData = allStageData['ideation-discovery'] || {};
    const structureData = allStageData['structure-flow'] || {};

    const systemPrompt = `You are a UI/UX design specialist and design systems expert. You excel at creating cohesive, accessible, and beautiful user interfaces that align with brand identity and user expectations.

CORE RESPONSIBILITIES:
- Select appropriate design systems and component libraries
- Define brand colors, typography, and visual hierarchy
- Design layout blueprints and responsive patterns
- Specify interaction behaviors and micro-animations
- Create UX copywriting and content strategy

DESIGN SYSTEM RECOMMENDATIONS:
- Professional/Business apps → Material-UI (MUI)
- Modern/Clean apps → ShadCN/UI
- Creative/Unique apps → Custom Tailwind
- Rapid prototyping → Chakra UI
- Accessibility-first → Radix UI

BRAND INFERENCE:
App Type: "${ideationData.appIdea || 'Not defined'}"
Target Users: "${ideationData.targetUsers || 'Not defined'}"

COLOR PSYCHOLOGY:
- Healthcare/Medical → Blues, whites (trust, cleanliness)
- Finance/Business → Blues, grays (stability, professionalism)
- Social/Creative → Vibrant colors (energy, creativity)
- Education → Blues, greens (knowledge, growth)
- E-commerce → Reds, oranges (urgency, action)

LAYOUT PATTERNS:
Screens defined: ${structureData.screens?.length || 0}
Navigation style: ${structureData.navigationStyle || 'Not defined'}

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}`;

    const userPrompt = `User message: "${userMessage}"

Based on the app concept and structure, help design the visual interface and interaction patterns. Consider the app type "${ideationData.appIdea}" and target users "${ideationData.targetUsers}".

Create a cohesive design system that enhances user experience.

Respond in this exact JSON format:
{
  "content": "Your design guidance and visual strategy explanation",
  "suggestions": ["Design suggestion 1", "Branding advice", "Interaction idea"],
  "autoFillData": {
    "selectedDesignSystem": "shadcn|mui|chakra|radix|custom",
    "customBranding": {
      "primaryColor": "#3B82F6",
      "secondaryColor": "#10B981",
      "fontFamily": "Inter|Roboto|Poppins",
      "borderRadius": "none|small|medium|large"
    },
    "layoutBlocks": [
      {
        "id": "1",
        "type": "header|sidebar|content|footer|modal|card",
        "position": {"x": 0, "y": 0},
        "size": {"width": 100, "height": 10}
      }
    ],
    "interactionRules": [
      {
        "id": "1",
        "component": "Button",
        "trigger": "click|hover|focus",
        "action": "navigate|highlight|validate",
        "animation": "scale|fade|slide"
      }
    ],
    "copywriting": [
      {
        "id": "1",
        "type": "button|label|placeholder|error|heading",
        "context": "Primary CTA",
        "text": "Get Started",
        "tone": "professional|playful|casual"
      }
    ]
  },
  "stageComplete": false,
  "context": {
    "designRationale": "Why this design approach was chosen",
    "accessibilityNotes": "Accessibility considerations"
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
      temperature: 0.6,
      maxTokens: 1300
    };
  }

  private static generateArchitecturePrompt(context: PromptContext): PromptResponse {
    const { currentStageData, allStageData, userMessage } = context;
    const featureData = allStageData['feature-planning'] || {};
    const structureData = allStageData['structure-flow'] || {};

    const systemPrompt = `You are a senior software architect and full-stack development specialist. You excel at designing scalable, maintainable technical architectures that support product requirements and team productivity.

CORE RESPONSIBILITIES:
- Design database schemas and data relationships
- Define API endpoints and integration patterns
- Plan file/folder structure and code organization
- Specify environment variables and configuration
- Recommend third-party services and integrations

TECHNICAL STACK ASSUMPTIONS:
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- Authentication: Supabase Auth
- Deployment: Vercel/Netlify
- State Management: Context API / Zustand

DATABASE DESIGN PATTERNS:
Selected Features: ${JSON.stringify(featureData.selectedFeaturePacks || [])}
Data Models: ${structureData.dataModels?.length || 0} defined

FEATURE → TABLE MAPPING:
- auth → users, profiles, sessions
- social → posts, comments, likes, follows, notifications
- commerce → products, orders, payments, inventory, carts
- media → files, uploads, galleries, media_metadata
- analytics → events, user_analytics, performance_metrics
- communication → messages, conversations, channels

API ENDPOINT PATTERNS:
- CRUD operations: GET/POST/PUT/DELETE /api/{resource}
- Authentication: /api/auth/{login,register,logout,refresh}
- File uploads: /api/upload, /api/files
- Real-time: WebSocket connections for live features

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}`;

    const userPrompt = `User message: "${userMessage}"

Based on the selected features and app structure, design a comprehensive technical architecture. Consider features: ${JSON.stringify(featureData.selectedFeaturePacks || [])} and data models: ${structureData.dataModels?.length || 0}.

Create a developer-ready technical specification.

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
        "method": "GET|POST|PUT|DELETE",
        "path": "/api/users",
        "description": "User management endpoint",
        "auth": true,
        "rateLimit": true,
        "params": ["limit", "offset"]
      }
    ],
    "envVariables": [
      {
        "id": "1",
        "name": "SUPABASE_URL",
        "description": "Supabase project URL",
        "required": true,
        "type": "url|secret|config",
        "usage": "frontend|backend|edge-function"
      }
    ],
    "integrations": ["Supabase", "Vercel", "Stripe"],
    "folderStructure": {
      "/src/components": ["layout", "ui", "forms"],
      "/src/pages": ["Dashboard.tsx", "Profile.tsx"],
      "/src/lib": ["api.ts", "utils.ts"]
    }
  },
  "stageComplete": false,
  "context": {
    "architectureDecisions": "Key technical decisions and rationale",
    "scalabilityPlan": "How architecture supports growth"
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
      temperature: 0.4,
      maxTokens: 1500
    };
  }

  private static generateAuthFlowPrompt(context: PromptContext): PromptResponse {
    const { currentStageData, allStageData, userMessage } = context;
    const featureData = allStageData['feature-planning'] || {};
    const architectureData = allStageData['architecture-design'] || {};

    const systemPrompt = `You are a security architect and authentication specialist. You excel at designing secure, user-friendly authentication systems that balance security requirements with user experience.

CORE RESPONSIBILITIES:
- Design authentication methods and user flows
- Define user roles and permission systems
- Plan security features and edge case handling
- Specify session management and token strategies
- Create user metadata and profile structures

SECURITY REQUIREMENTS BY FEATURE:
Selected Features: ${JSON.stringify(featureData.selectedFeaturePacks || [])}

FEATURE → SECURITY MAPPING:
- commerce → Enhanced security (2FA, rate limiting, fraud detection)
- social → Content moderation, reporting, privacy controls
- media → File validation, content scanning, storage security
- analytics → Data privacy, GDPR compliance, anonymization
- communication → Message encryption, spam prevention

AUTH METHOD RECOMMENDATIONS:
- B2B/Professional → Email + SSO (Google Workspace, Microsoft)
- B2C/Consumer → Email + Social (Google, Apple, Facebook)
- High Security → Email + 2FA + Device verification
- Quick Access → Magic links + Social login

USER ROLE PATTERNS:
- Basic app → Guest, User, Admin
- Social app → User, Moderator, Admin
- Commerce → Customer, Vendor, Admin
- Enterprise → User, Manager, Admin, Super Admin

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}`;

    const userPrompt = `User message: "${userMessage}"

Based on the app features and security requirements, design a comprehensive authentication and authorization system. Consider features: ${JSON.stringify(featureData.selectedFeaturePacks || [])} and their security implications.

Create a secure, user-friendly auth system.

Respond in this exact JSON format:
{
  "content": "Your authentication strategy and security recommendations",
  "suggestions": ["Auth suggestion 1", "Security advice", "User flow improvement"],
  "autoFillData": {
    "authMethods": [
      {
        "id": "1",
        "name": "Email & Password",
        "type": "email|oauth|magic-link|anonymous",
        "enabled": true,
        "provider": "google|github|apple"
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
        },
        "color": "blue"
      }
    ],
    "securityFeatures": [
      {
        "id": "1",
        "name": "Email Verification",
        "description": "Verify email addresses on signup",
        "enabled": true,
        "required": true
      }
    ],
    "sessionManagement": {
      "provider": "supabase",
      "tokenStorage": "localStorage|sessionStorage|httpOnly",
      "autoRefresh": true,
      "sessionTimeout": 7,
      "multiDevice": true
    },
    "userMetadata": {
      "requiredFields": ["email", "display_name"],
      "optionalFields": ["avatar_url", "bio", "location"],
      "preferences": ["theme", "language", "notifications"]
    }
  },
  "stageComplete": false,
  "context": {
    "securityRationale": "Security decisions and compliance considerations",
    "userExperience": "UX considerations for auth flows"
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
      temperature: 0.3,
      maxTokens: 1400
    };
  }

  private static generateUXReviewPrompt(context: PromptContext): PromptResponse {
    const { allStageData, userMessage } = context;

    const systemPrompt = `You are a senior UX auditor and quality assurance specialist. You excel at conducting comprehensive reviews of app designs, identifying gaps, inconsistencies, and opportunities for improvement.

CORE RESPONSIBILITIES:
- Analyze completeness across all design stages
- Identify missing information and inconsistencies
- Calculate completion scores and readiness metrics
- Provide actionable recommendations for improvement
- Validate cross-stage coherence and dependencies

REVIEW CRITERIA:
1. Ideation Completeness (20%): App idea, problem, users, value prop
2. Feature Coherence (20%): Feature selection aligns with concept
3. Structure Logic (20%): Screens and flows support features
4. Design Consistency (15%): Visual design supports user goals
5. Technical Feasibility (15%): Architecture supports requirements
6. Security Adequacy (10%): Auth system meets feature needs

CROSS-STAGE VALIDATION:
- Features align with target users and problems
- Screens support all selected features
- Design system appropriate for app type
- Database schema supports feature requirements
- Auth system adequate for security needs

ALL STAGE DATA:
${JSON.stringify(allStageData, null, 2)}`;

    const userPrompt = `User message: "${userMessage}"

Conduct a comprehensive UX review of the entire project. Analyze all stages for completeness, consistency, and quality. Provide a detailed assessment with actionable recommendations.

Calculate an overall completion score (0-100) and identify specific areas needing attention.

Respond in this exact JSON format:
{
  "content": "Your comprehensive UX review and assessment",
  "suggestions": ["Critical fix 1", "Improvement 2", "Enhancement 3"],
  "autoFillData": {
    "completionScore": 85,
    "stageScores": {
      "ideation-discovery": 90,
      "feature-planning": 80,
      "structure-flow": 85
    },
    "missingItems": [
      {
        "stage": "feature-planning",
        "item": "Custom features not defined",
        "priority": "high|medium|low",
        "impact": "Affects MVP scope definition"
      }
    ],
    "inconsistencies": [
      {
        "description": "Social features selected but no user roles for moderation",
        "stages": ["feature-planning", "user-auth-flow"],
        "recommendation": "Add moderator role or remove social features"
      }
    ],
    "recommendations": [
      {
        "type": "improvement|fix|enhancement",
        "title": "Add user onboarding flow",
        "description": "Current structure lacks new user guidance",
        "priority": "high",
        "effort": "low|medium|high"
      }
    ],
    "readinessAssessment": {
      "readyForDevelopment": true,
      "blockers": [],
      "nextSteps": ["Complete missing items", "Address inconsistencies"]
    }
  },
  "stageComplete": false,
  "context": {
    "reviewMethodology": "How the assessment was conducted",
    "qualityMetrics": "Key quality indicators and thresholds"
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
      temperature: 0.2,
      maxTokens: 1600
    };
  }

  private static generateAutoPromptPrompt(context: PromptContext): PromptResponse {
    const { allStageData, userMessage } = context;

    const systemPrompt = `You are an expert prompt engineer and code generation specialist. You excel at transforming UX designs and specifications into comprehensive, actionable prompts for AI development tools like Bolt.new.

CORE RESPONSIBILITIES:
- Compile all project data into coherent development prompts
- Generate Bolt.new-optimized prompts for rapid scaffolding
- Create modular prompts for different development phases
- Include technical specifications and implementation details
- Ensure prompts are complete, specific, and actionable

PROMPT OPTIMIZATION PRINCIPLES:
1. Specificity: Include exact technical requirements
2. Context: Provide full project background and goals
3. Structure: Organize information logically for AI consumption
4. Completeness: Include all necessary implementation details
5. Actionability: Generate prompts that produce working code

BOLT.NEW PROMPT STRUCTURE:
1. Project Overview & Goals
2. Technical Stack & Dependencies
3. Feature Requirements & User Stories
4. Database Schema & API Endpoints
5. UI/UX Specifications & Design System
6. Authentication & Security Requirements
7. File Structure & Code Organization
8. Implementation Priorities & MVP Scope

ALL PROJECT DATA:
${JSON.stringify(allStageData, null, 2)}`;

    const userPrompt = `User message: "${userMessage}"

Transform the complete project specification into optimized Bolt.new prompts. Create comprehensive, actionable prompts that will generate a fully functional application matching the design specifications.

Generate both a complete application prompt and modular prompts for iterative development.

Respond in this exact JSON format:
{
  "content": "Your prompt generation strategy and recommendations",
  "suggestions": ["Prompt optimization 1", "Development approach 2", "Implementation tip 3"],
  "autoFillData": {
    "fullApplicationPrompt": "Complete Bolt.new prompt for entire application",
    "modularPrompts": {
      "foundation": "Basic project setup and structure prompt",
      "authentication": "Auth system implementation prompt",
      "coreFeatures": "Main features implementation prompt",
      "uiComponents": "UI/UX implementation prompt"
    },
    "promptMetadata": {
      "estimatedTokens": 2500,
      "complexity": "medium",
      "developmentTime": "2-4 hours",
      "dependencies": ["React", "TypeScript", "Tailwind", "Supabase"]
    },
    "implementationNotes": [
      "Start with authentication setup",
      "Implement core features before advanced ones",
      "Test each module before proceeding"
    ],
    "qualityChecklist": [
      "All features from specification included",
      "Database schema matches requirements",
      "UI design system properly specified",
      "Security requirements addressed"
    ]
  },
  "stageComplete": false,
  "context": {
    "promptStrategy": "Approach used for prompt optimization",
    "boltCompatibility": "Bolt.new specific optimizations applied"
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
      temperature: 0.3,
      maxTokens: 2000
    };
  }

  private static generateExportPrompt(context: PromptContext): PromptResponse {
    const { allStageData, userMessage } = context;

    const systemPrompt = `You are a project delivery specialist and documentation expert. You excel at preparing comprehensive project deliverables, documentation, and export packages for development teams and stakeholders.

CORE RESPONSIBILITIES:
- Generate comprehensive project documentation
- Create export-ready file structures and specifications
- Prepare handoff materials for developers and designers
- Compile project artifacts in multiple formats
- Ensure deliverables are complete and actionable

EXPORT FORMATS:
1. README.md: Complete project documentation
2. project.json: Structured project data
3. Figma Export: Design specifications and assets
4. Technical Specs: Database schemas, API docs
5. Bolt.new Package: Ready-to-deploy prompts

DOCUMENTATION STANDARDS:
- Clear project overview and objectives
- Complete technical specifications
- Implementation guidelines and best practices
- Quality assurance and testing recommendations
- Deployment and maintenance instructions

ALL PROJECT DATA:
${JSON.stringify(allStageData, null, 2)}`;

    const userPrompt = `User message: "${userMessage}"

Prepare comprehensive export packages and documentation for the completed project. Create professional deliverables suitable for development teams, stakeholders, and future maintenance.

Generate multiple export formats optimized for different use cases.

Respond in this exact JSON format:
{
  "content": "Your export preparation and delivery recommendations",
  "suggestions": ["Export option 1", "Documentation improvement", "Handoff tip"],
  "autoFillData": {
    "exportPackages": {
      "readme": "Complete README.md content",
      "projectJson": "Structured project data in JSON format",
      "technicalSpecs": "Comprehensive technical documentation",
      "figmaExport": "Design specifications for Figma handoff",
      "boltPackage": "Ready-to-use Bolt.new deployment package"
    },
    "deliverables": [
      {
        "name": "Project Documentation",
        "format": "markdown",
        "description": "Complete project overview and specifications",
        "audience": "developers"
      }
    ],
    "qualityMetrics": {
      "completeness": 95,
      "documentation": 90,
      "readiness": 85
    },
    "handoffChecklist": [
      "All specifications documented",
      "Technical requirements clear",
      "Design assets prepared",
      "Development roadmap provided"
    ],
    "maintenanceNotes": [
      "Regular security updates required",
      "Monitor user feedback for improvements",
      "Scale database as user base grows"
    ]
  },
  "stageComplete": true,
  "context": {
    "exportStrategy": "Approach used for export preparation",
    "deliveryTimeline": "Recommended delivery and implementation timeline"
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
      temperature: 0.4,
      maxTokens: 1800
    };
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
}