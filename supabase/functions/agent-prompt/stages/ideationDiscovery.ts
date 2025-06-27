/**
 * ideationDiscovery.ts (Edge Function)
 * 
 * Server-side prompt generation for Ideation & Discovery stage.
 * Mirrors the frontend implementation for consistency.
 */

export function generateIdeationPrompt(context: any) {
  const { currentStageData, userMessage, conversationHistory, competitorSearchPerformed, competitorSearchResults, competitorSearchError, allStageData } = context;
  
  // Check if we have competitor data from a search
  const hasCompetitorData = allStageData?.['ideation-discovery']?.competitors && 
                           Array.isArray(allStageData['ideation-discovery'].competitors) &&
                           allStageData['ideation-discovery'].competitors.length > 0;
  
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
- missionStatement: Create a formal mission statement distinct from the app idea
- userPersonas: Create structured persona objects with name, role, painPoint, emoji
- valueProposition: Articulate unique value and benefits

USER PERSONA EXTRACTION:
When users describe target users, extract and structure them as persona objects:
- name: Descriptive persona name (e.g., "Busy Professional", "College Student")
- role: Their primary role or descriptor (e.g., "Marketing Manager", "Computer Science Student")
- painPoint: Their main challenge or goal (e.g., "Struggles with time management", "Needs study organization")
- emoji: Appropriate emoji representing them (e.g., "👨‍💼", "👩‍🎓", "👨‍💻")

COMPLETION CRITERIA:
Stage is complete when we have: appIdea, appName, problemStatement, missionStatement, userPersonas, and valueProposition.

MISSION STATEMENT GUIDANCE:
When asked to generate or refine a mission statement:
- Make it distinct from the app idea description
- Focus on purpose, values, and vision
- Keep it concise but impactful (1-2 sentences)
- Include who the app serves and how it serves them
- Avoid technical jargon and focus on benefits
- Use present tense and active voice

COMPETITOR ANALYSIS:
${hasCompetitorData ? `I have fetched real competitor data for you to analyze and incorporate into your response. Use this data to provide insights about the competitive landscape and help the user position their app effectively.` : 'If the user asks about competitors, I will fetch real competitor data for analysis.'}

  const userPrompt = `User message: "${userMessage}"
}

${hasCompetitorData ? `I've searched the web and found ${allStageData['ideation-discovery'].competitors.length} competitors for your app idea:

${JSON.stringify(allStageData['ideation-discovery'].competitors, null, 2)}

Please analyze these competitors and incorporate insights into your response. Help the user understand the competitive landscape and how to position their app effectively.` : ''}

${competitorSearchPerformed && !hasCompetitorData ? `I attempted to search for competitors but couldn't find any relevant results. ${competitorSearchError ? `Error: ${competitorSearchError}` : ''}` : ''}

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
    "missionStatement": "formal mission statement",
    "competitors": ${hasCompetitorData ? JSON.stringify(allStageData['ideation-discovery'].competitors) : '[]'},
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
    ${hasCompetitorData ? ',"competitorAnalysis": "insights from competitor data"' : ''}
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.6,
    maxTokens: 1000
  };
}