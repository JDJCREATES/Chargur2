/**
 * featurePlanning.ts (Edge Function)
 * 
 * Server-side prompt generation for Feature Planning stage.
 */

export function generateFeaturePlanningPrompt(context: any) {
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
${JSON.stringify(currentStageData, null, 2)}`;

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
    ]
  },
  "stageComplete": false,
  "context": {
    "featureRationale": "Why these features were suggested"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.6,
    maxTokens: 1200
  };
}