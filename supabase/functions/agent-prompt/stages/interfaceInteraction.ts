/**
 * interfaceInteraction.ts (Edge Function)
 * 
 * Server-side prompt generation for Interface & Interaction stage.
 */

export function generateInterfacePrompt(context: any) {
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