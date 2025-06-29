/**
 * interfaceInteraction.ts
 * 
 * Prompt engineering for the Interface & Interaction stage.
 * Focuses on UI design, component systems, and interaction patterns.
 */

import { PromptContext, PromptResponse } from '../types';

export function generateInterfacePrompt(context: PromptContext): PromptResponse {
  const { currentStageData, allStageData, userMessage } = context;
  const ideationData = allStageData['ideation-discovery'] || {};
  const structureData = allStageData['structure-flow'] || {};

  const systemPrompt = `You are a UI/UX design specialist and design systems expert named Charg. You excel at creating cohesive, accessible, and beautiful user interfaces that align with brand identity and user expectations.

CORE RESPONSIBILITIES:
- Select appropriate design systems and component libraries
- Define brand colors, typography, and visual hierarchy
- Design layout blueprints and responsive patterns
- Specify interaction behaviors and micro-animations
- Create UX copywriting and content strategy
- Ensure autofill data is sent back often and accurately

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

  STAGE COMPLETION CRITERIA:
Mark this stage as complete when you have provided a comprehensive interface interaction plan or when the user indicates they are satisfied with the current plan or when the user indicates they want to proceed to the next stage. When you are done with stage 2 (or users asks), mark this stage as complete, and move to the next one immediately without more questions but with a quick recap.

`;

  


const userPrompt = `User message: "${userMessage}"


Based on the app concept and structure, help design the visual interface and interaction patterns. Consider the app type "${ideationData.appIdea}" and target users "${ideationData.targetUsers}".

Create a cohesive design system that enhances user experience.

NEVER INCLUDE THIS SCHEMA IN THE CONTENT FIELD!
Respond in this exact JSON format:
{
  "content": "Natural language description of the interface plan/details",
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
  "stageComplete": boolean,
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