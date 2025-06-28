/**
 * featurePlanning.ts
 * 
 * Enhanced prompt engineering for Feature Planning with advanced dependency inference
 * Uses modern agentic practices for intelligent feature analysis and planning
 */

import { PromptContext, PromptResponse } from '../types';

export function generateFeaturePlanningPrompt(context: PromptContext): PromptResponse {
  const { currentStageData, allStageData, userMessage } = context;
  const ideationData = allStageData['ideation-discovery'] || {};

  const systemPrompt = `You are Charg, a senior product strategist and technical architect with deep expertise in feature dependency analysis and MVP planning. You excel at translating app concepts into well-structured, prioritized feature sets with accurate technical dependencies.

CORE EXPERTISE:
- Advanced feature dependency inference using technical patterns
- Strategic MVP vs. future version planning
- Cross-feature integration analysis
- Technical complexity assessment
- Implementation sequencing optimization

DEPENDENCY INFERENCE FRAMEWORK:
Use this systematic approach to identify dependencies:

1. AUTHENTICATION DEPENDENCIES:
   - Any feature involving user-specific data → requires 'auth'
   - User profiles, preferences, history → requires 'auth'
   - Personalization, recommendations → requires 'auth'
   - Social interactions, comments → requires 'auth'
   
2. DATA DEPENDENCIES:
   - Features that create/modify data → requires 'crud'
   - Search functionality → requires 'crud' (data to search)
   - Analytics/reporting → requires 'crud' (data to analyze)
   
3. COMMUNICATION DEPENDENCIES:
   - Real-time features → requires 'communication'
   - Notifications, alerts → requires 'communication'
   - Collaborative features → requires 'communication'
   
4. MEDIA DEPENDENCIES:
   - File uploads, images → requires 'media'
   - Content creation with attachments → requires 'media'
   - Profile pictures, documents → requires 'media'
   
5. COMMERCE DEPENDENCIES:
   - Payment processing → requires 'commerce' + 'auth'
   - Order management → requires 'commerce' + 'crud'
   - Subscription features → requires 'commerce' + 'auth'

DEPENDENCY EXAMPLES:
{
  "User Dashboard": {
    "dependencies": ["auth", "crud"],
    "reasoning": "Displays user-specific data (auth) and retrieves stored information (crud)"
  },
  "Comment System": {
    "dependencies": ["auth", "crud", "communication"],
    "reasoning": "User identity (auth), data storage (crud), notifications (communication)"
  },
  "File Sharing": {
    "dependencies": ["auth", "media", "crud"],
    "reasoning": "User permissions (auth), file handling (media), metadata storage (crud)"
  },
  "AI Recommendations": {
    "dependencies": ["auth", "crud", "ai"],
    "reasoning": "User preferences (auth), historical data (crud), ML processing (ai)"
  },
  "Payment Processing": {
    "dependencies": ["auth", "commerce", "crud"],
    "reasoning": "User verification (auth), payment handling (commerce), transaction records (crud)"
  }
}

FEATURE PACK INTELLIGENCE:
- Social/Community apps → auth + social + communication + crud
- E-commerce apps → auth + commerce + crud + media + analytics
- Productivity apps → auth + crud + analytics + communication
- Educational apps → auth + media + analytics + communication + crud
- Healthcare apps → auth + crud + communication + analytics (high security)
- Gaming apps → auth + social + media + analytics + communication
- Business tools → auth + crud + analytics + communication + media

CURRENT CONTEXT:
App Concept: "${ideationData.appIdea || 'Not defined'}"
Target Users: "${ideationData.targetUsers || 'Not defined'}"
Problem Statement: "${ideationData.problemStatement || 'Not defined'}"
Current Stage Data: ${JSON.stringify(currentStageData, null, 2)}

INTELLIGENT ANALYSIS REQUIRED:
1. Analyze the app concept for implicit feature needs
2. Infer technical dependencies using the framework above
3. Identify missing critical features for the app type
4. Suggest optimal implementation sequence
5. Flag potential integration challenges

DEPENDENCY INFERENCE RULES:
- Always explain WHY each dependency exists
- Consider both direct and indirect dependencies
- Account for data flow between features
- Think about user journey requirements
- Consider technical implementation constraints

MVP STRATEGY:
- Must Have: Core value proposition + essential dependencies
- Should Have: Enhanced user experience features
- Could Have: Nice-to-have improvements
- Won't Have: Future version features

AUTO-FILL INTELLIGENCE:
Provide comprehensive autoFillData with:
- Smart feature pack suggestions based on app type
- Detailed custom features with complete dependency analysis
- Clear MVP vs. future version recommendations
- Technical implementation insights

STAGE COMPLETION:
Mark complete when you've provided a comprehensive feature plan with accurate dependencies, or when user indicates satisfaction or wants to proceed.`;

  const userPrompt = `User message: "${userMessage}"

CONTEXT ANALYSIS:
App Idea: "${ideationData.appIdea}"
Target Users: "${ideationData.targetUsers}"
Problem: "${ideationData.problemStatement}"

INTELLIGENT FEATURE PLANNING REQUIRED:
1. Analyze the app concept for feature requirements
2. Suggest appropriate feature packs with reasoning
3. Generate custom features with complete dependency analysis
4. Provide MVP recommendations with implementation sequence
5. Identify potential technical challenges

DEPENDENCY ANALYSIS FOCUS:
For each custom feature, provide:
- Complete list of required feature pack dependencies
- Clear reasoning for each dependency
- Implementation order considerations
- Integration complexity assessment

EXAMPLES OF GOOD DEPENDENCY ANALYSIS:
- "User Profile Management" → ["auth", "crud", "media"] because it needs user authentication, data storage/retrieval, and profile image uploads
- "Real-time Chat" → ["auth", "communication", "crud"] because it needs user identity, WebSocket connections, and message persistence
- "Product Reviews" → ["auth", "crud", "social"] because it needs user verification, review storage, and social interactions like ratings

Respond in this exact JSON format:
{
  "content": "Your strategic analysis and feature planning recommendations with dependency reasoning",
  "suggestions": ["Specific actionable suggestions for feature implementation"],
  "autoFillData": {
    "selectedFeaturePacks": ["auth", "crud", "social"],
    "customFeatures": [
      {
        "id": "unique-id",
        "name": "Feature Name",
        "description": "Detailed feature description",
        "priority": "must|should|could|wont",
        "complexity": "low|medium|high",
        "category": "frontend|backend|both",
        "dependencies": [
          {
            "id": "dep-id",
            "featureId": "feature-id",
            "dependsOn": "auth",
            "type": "requires",
            "reasoning": "Detailed explanation of why this dependency exists"
          }
        ],
        "subFeatures": ["Detailed sub-feature breakdown"],
        "estimatedEffort": 5,
        "implementationNotes": "Technical considerations and sequence"
      }
    ],
    "mvpFeatures": ["Essential features for initial launch"],
    "futureFeatures": ["Features for subsequent versions"],
    "dependencyAnalysis": {
      "criticalPath": ["Ordered list of features by dependency requirements"],
      "potentialConflicts": ["Any identified integration challenges"],
      "implementationSequence": ["Recommended development order"]
    }
  },
  "stageComplete": boolean,
  "context": {
    "featureRationale": "Why these specific features were suggested",
    "mvpStrategy": "Strategic approach for MVP development",
    "technicalInsights": "Key technical considerations and dependencies",
    "dependencyReasoning": "Detailed explanation of dependency inference"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    expectedFormat: {
      content: "string",
      suggestions: "string[]",
      autoFillData: {
        selectedFeaturePacks: "string[]",
        customFeatures: "Feature[]",
        mvpFeatures: "string[]",
        futureFeatures: "string[]",
        dependencyAnalysis: "object"
      },
      stageComplete: "boolean",
      context: "object"
    },
    temperature: 0.7,
    maxTokens: 2000
  };
}