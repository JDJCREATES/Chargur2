/**
 * interfaceInteraction.ts (Edge Function)
 * 
 * Server-side prompt generation for Interface & Interaction stage.
 */

export function generateInterfacePrompt(context: any) {
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
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `User message: "${userMessage}"

Based on the app concept and structure, help design the visual interface and interaction patterns. Consider the app type "${ideationData.appIdea}" and target users "${ideationData.targetUsers}".

Create a cohesive design system that enhances user experience.

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
    },
    "layoutBlocks": [
      {
        "id": "1",
        "type": "header",
        "position": {"x": 0, "y": 0},
        "size": {"width": 100, "height": 10}
      }
    ],
    "interactionRules": [
      {
        "id": "1",
        "component": "Button",
        "trigger": "click",
        "action": "navigate",
        "animation": "scale"
      }
    ],
    "copywriting": [
      {
        "id": "1",
        "type": "button",
        "context": "Primary CTA",
        "text": "Get Started",
        "tone": "professional"
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
    temperature: 0.6,
    maxTokens: 1300
  };
}