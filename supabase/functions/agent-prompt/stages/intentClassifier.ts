/**
 * intentClassifier.ts (Edge Function)
 * 
 * Specialized prompt generator for intent classification.
 * This module helps determine which stage(s) a user's message is most relevant to.
 */

export function generateIntentClassificationPrompt(context: any) {
  const { userMessage, stageId, allStageData, conversationHistory = [] } = context;
  
  // Get the current stage name for context
  const stageName = getStageNameById(stageId);
  
  // Create a summary of all stages and their purposes
  const stagesSummary = generateStagesSummary();
  
  // Create a summary of the user's project data
  const projectSummary = generateProjectSummary(allStageData);

  const systemPrompt = `You are an expert intent classifier for a UX design and app planning assistant. Your job is to analyze user messages and determine which stage(s) of the app planning process they relate to.

AVAILABLE STAGES:
${stagesSummary}

CURRENT CONTEXT:
- User is currently in the "${stageName}" stage
- Their message: "${userMessage.replace(/"/g, '\\"')}"

CONVERSATION HISTORY:
${conversationHistory.slice(-3).map((msg: any) => 
  `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
).join('\n')}

PROJECT DATA SUMMARY:
${projectSummary}

CLASSIFICATION GUIDELINES:
1. Analyze the user's message for explicit mentions of stage-specific concepts
2. Consider implicit references to stage activities or deliverables
3. Evaluate if the message is continuing work in the current stage
4. Identify if the message spans multiple stages
5. When uncertain, default to the current stage

SPECIAL INTENTS:
1. Competitor Analysis: Detect when users want to find, analyze, or compare competitors
   - Keywords: competitor, competition, similar app, alternative, market research, compare, comparison, competitor analysis, competitor research, competitor review, similar products, market analysis
   - Example: "Find competitors for my app", "What are similar apps to mine?", "Show me competitors"
   - Action: Set competitorSearchIntent to true in response

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `Analyze this user message: "${userMessage.replace(/"/g, '\\"')}"

Determine which stage(s) of the app planning process this message relates to. The user is currently in the "${stageName}" stage.

Respond in this exact JSON format:
{
  "relevantStageIds": ["stage-id-1", "stage-id-2"],
  "confidence": 0.85,
  "reasoning": "Brief explanation of why these stages were selected",
  "currentStageRelevance": "high|medium|low",
  "suggestedPrimaryStage": "most-relevant-stage-id",
  "competitorSearchIntent": true|false
}

Available stage IDs:
- ideation-discovery
- feature-planning
- structure-flow
- interface-interaction
- architecture-design
- user-auth-flow
- ux-review-check
- auto-prompt-engine
- export-handoff`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.2,
    maxTokens: 500
  };
}

// Helper function to get stage name from ID
function getStageNameById(stageId: string): string {
  const stageNames: Record<string, string> = {
    'ideation-discovery': 'Ideation & Discovery',
    'feature-planning': 'Feature Planning',
    'structure-flow': 'Structure & Flow',
    'interface-interaction': 'Interface & Interaction Design',
    'architecture-design': 'Architecture Design',
    'user-auth-flow': 'User & Auth Flow',
    'ux-review-check': 'UX Review & User Check',
    'auto-prompt-engine': 'Auto-Prompt Engine',
    'export-handoff': 'Export & Handoff'
  };
  
  return stageNames[stageId] || stageId;
}

// Generate a summary of all stages and their purposes
function generateStagesSummary(): string {
  return `1. Ideation & Discovery (ideation-discovery)
   - App concept, name, tagline, problem statement, target users, value proposition
   - Keywords: idea, concept, name, problem, mission, tagline, user, persona, competitor

2. Feature Planning (feature-planning)
   - Core features, feature prioritization, MVP definition, feature dependencies
   - Keywords: feature, functionality, mvp, priority, moscow, core feature

3. Structure & Flow (structure-flow)
   - App architecture, screens, user journeys, navigation patterns, data models
   - Keywords: structure, flow, screen, navigation, user flow, journey, sitemap

4. Interface & Interaction (interface-interaction)
   - Visual design, layout, component styling, interaction patterns, design system
   - Keywords: interface, ui, design, color, layout, component, style, visual

5. Architecture Design (architecture-design)
   - Technical architecture, database schema, API endpoints, file structure
   - Keywords: architecture, database, schema, api, endpoint, technical, folder, structure

6. User & Auth Flow (user-auth-flow)
   - Authentication methods, user roles, permissions, security features
   - Keywords: auth, authentication, login, register, user, role, permission, security

7. UX Review & User Check (ux-review-check)
   - Design validation, completeness check, user testing scenarios
   - Keywords: review, check, validate, test, assessment, evaluation

8. Auto-Prompt Engine (auto-prompt-engine)
   - Generate development prompts, code scaffolding instructions
   - Keywords: prompt, generate, bolt, code, export, development

9. Export & Handoff (export-handoff)
   - Documentation, export formats, developer handoff materials
   - Keywords: export, handoff, documentation, readme, deliver`;
}

// Generate a summary of the project data
function generateProjectSummary(allStageData: any): string {
  try {
    const ideationData = allStageData['ideation-discovery'] || {};
    const featureData = allStageData['feature-planning'] || {};
    
    let summary = '';
    
    if (ideationData.appName) {
      summary += `App Name: ${ideationData.appName}\n`;
    }
    
    if (ideationData.appIdea) {
      summary += `App Concept: ${ideationData.appIdea}\n`;
    }
    
    if (ideationData.problemStatement) {
      summary += `Problem: ${ideationData.problemStatement}\n`;
    }
    
    if (featureData.selectedFeaturePacks && featureData.selectedFeaturePacks.length > 0) {
      summary += `Selected Feature Packs: ${featureData.selectedFeaturePacks.join(', ')}\n`;
    }
    
    if (featureData.customFeatures && featureData.customFeatures.length > 0) {
      summary += `Custom Features: ${featureData.customFeatures.length} defined\n`;
    }
    
    return summary || 'No project data available yet';
  } catch (error) {
    console.error('Error generating project summary:', error);
    return 'Error generating project summary';
  }
  
}