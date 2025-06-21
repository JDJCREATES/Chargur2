/**
 * structureFlow.ts (Edge Function)
 * 
 * Server-side prompt generation for Structure & Flow stage.
 */

export function generateStructureFlowPrompt(context: any) {
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
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

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
    "dataModels": [
      {
        "id": "1",
        "name": "User",
        "fields": ["id", "email", "name", "createdAt"],
        "relations": ["Profile", "Posts"]
      }
    ],
    "navigationStyle": "bottom-tabs",
    "stateManagement": "context"
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
    temperature: 0.5,
    maxTokens: 1400
  };
}