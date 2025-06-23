/**
 * ideationDiscovery.ts (Edge Function)
 * 
 * Server-side prompt generation for Ideation & Discovery stage.
 * Mirrors the frontend implementation for consistency.
 */

export function generateIdeationPrompt(context: any) {
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
- userPersonas: Create structured persona objects with name, role, painPoint, emoji
- valueProposition: Articulate unique value and benefits

USER PERSONA EXTRACTION:
When users describe target users, extract and structure them as persona objects:
- name: Descriptive persona name (e.g., "Busy Professional", "College Student")
- role: Their primary role or descriptor (e.g., "Marketing Manager", "Computer Science Student")
- painPoint: Their main challenge or goal (e.g., "Struggles with time management", "Needs study organization")
- emoji: Appropriate emoji representing them (e.g., "👨‍💼", "👩‍🎓", "👨‍💻")

COMPLETION CRITERIA:
Stage is complete when we have: appIdea, appName, problemStatement, userPersonas, and valueProposition.`;

  const userPrompt = `User message: "${userMessage}"

Based on this message and our conversation history, help the user develop their app concept. If you can extract specific information, provide it in the autoFillData. When users mention target users, create structured persona objects. If the stage appears complete, set stageComplete to true.

Respond in this exact JSON format:
{
  "content": "Your conversational response to the user",
  "suggestions": ["Quick action 1", "Quick action 2", "Quick action 3"],
  "autoFillData": {
    "appIdea": "extracted or suggested app idea",
    "appName": "suggested app name",
    "tagline": "memorable tagline",
    "problemStatement": "core problem statement",
    "userPersonas": [
      {
        "name": "Primary User",
        "role": "Professional Role",
        "painPoint": "Main challenge or goal",
        "emoji": "👤"
      }
    ],
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
    temperature: 0.7,
    maxTokens: 1000
  };
}