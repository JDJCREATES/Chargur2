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

CRITICAL JSON RESPONSE FORMAT:
You MUST respond with valid JSON only. Do NOT wrap your response in markdown code blocks.
Do NOT use \`\`\`json or \`\`\` around your response.
Return raw JSON that starts with { and ends with }.

AVAILABLE STAGES:
${stagesSummary}

CURRENT CONTEXT:
- User is currently in the "${stageName}" stage
- Their message: "${userMessage.replace(/"/g, '\\"')}"

CROSS-STAGE INTENT DETECTION:
1. **Actively Identify Cross-Stage References:** Look for explicit mentions of fields, concepts, or actions that clearly belong to stages OTHER than the current one, even if the user doesn't explicitly ask to switch stages.
2. **Field-Level Detection:** Recognize when users reference specific fields or sections from other stages (e.g., "I need to update my app name" while in Feature Planning should be detected as Ideation & Discovery).
3. **Implicit Navigation Needs:** Infer when a user's request can only be fulfilled by moving to another stage, even if they don't explicitly request it.
4. **Prioritize User Intent Over Current Location:** If a user clearly wants to work on content from another stage, set that as the suggestedPrimaryStage regardless of their current location.
5. **Multi-Stage Awareness:** When a query spans multiple stages, identify ALL relevant stages but set suggestedPrimaryStage to the most directly relevant one.

EXAMPLES OF CROSS-STAGE REFERENCES:
- "I need to change my app name" → ideation-discovery (even if currently in a different stage)
- "Let's add authentication to our features" → feature-planning (even if in architecture-design)
- "How do I set up user roles?" → user-auth-flow (even if in feature-planning)
- "I want to change my app's color scheme" → interface-interaction (even if in structure-flow)
- "Can you help me design the database schema?" → architecture-design (even if in feature-planning)

CONVERSATION HISTORY:
${conversationHistory.slice(-3).map((msg: any) => 
  `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
).join('\n')}

PROJECT DATA SUMMARY:
${projectSummary}

CLASSIFICATION GUIDELINES:
1.  **Prioritize Current Stage:** Assume the user's intent is related to their \`currentStage\` unless the message *explicitly* and *unambiguously* indicates a different stage.
2.  **Consider Granularity/Depth:**
    * If the query is high-level, conceptual, or about preferences (e.g., "What UI style should I use?"), it likely belongs to an earlier, more foundational stage (like Ideation & Discovery).
    * If the query is detailed, implementation-specific, or about specific components (e.g., "How do I implement a dark mode UI?"), it likely belongs to a later, more technical stage (like Interface & Interaction).
3.  **Stage Progression:** Understand that concepts evolve across stages. A topic introduced in an early stage might be refined in a later one. Always map to the *earliest relevant stage* that can address the query at its current level of detail.
4.  **Evaluate Message Context:** Consider the full message, conversation history, and existing \`allStageData\` to infer intent.
5.  **Uncertainty:** If there is significant ambiguity, lean towards the \`currentStage\` and provide a lower \`confidence\` score.
6.  **Field-Specific References:** When users mention specific fields or sections (e.g., "app name", "user roles", "database schema"), these should strongly influence stage classification regardless of current stage.

    STAGE-SPECIFIC KEYWORDS & GRANULARITY HINTS:
 - **Ideation & Discovery (ideation-discovery):**
     - Keywords: idea, concept, name, problem, mission, tagline, user, persona, competitor, *high-level UI style preference*, *general tech stack preference*, *platform choice*.
     - Granularity: Broad, conceptual, strategic.
 - **Feature Planning (feature-planning):**
     - Keywords: feature, functionality, mvp, priority, moscow, core feature, *feature breakdown*.
     - Granularity: Functional, scope definition.
 - **Structure & Flow (structure-flow):**
     - Keywords: structure, flow, screen, navigation, user flow, journey, sitemap, *data models (conceptual)*.
     - Granularity: Structural, user journey mapping.
 - **Interface & Interaction (interface-interaction):**
     - Keywords: interface, ui, design, color, layout, component, style, visual, *specific design system*, *interaction patterns*, *UX copywriting*.
     - Granularity: Detailed design, visual implementation.
 - **Architecture Design (architecture-design):**
     - Keywords: architecture, database, schema, api, endpoint, technical, folder, structure, *detailed data models*.
     - Granularity: Technical blueprint, system design.
 - **User & Auth Flow (user-auth-flow):**
     - Keywords: auth, authentication, login, register, user, role, permission, security, *session management*.
     - Granularity: Security, access control.
 - **UX Review & User Check (ux-review-check):**
     - Keywords: review, check, validate, test, assessment, evaluation, *completeness*, *feedback*.
     - Granularity: Audit, validation.
 - **Auto-Prompt Engine (auto-prompt-engine):**
     - Keywords: prompt, generate, bolt, code, export, development, *AI generation*.
     - Granularity: Code generation, AI interaction.
 - **Export & Handoff (export-handoff):**
     - Keywords: export, handoff, documentation, readme, deliver, *project artifacts*.
     - Granularity: Deliverables, finalization.

SPECIAL INTENTS:
1. Competitor Analysis: Detect when users want to find, analyze, or compare competitors
   - Keywords: competitor, competition, similar app, alternative, market research, compare, comparison, competitor analysis, competitor research, competitor review, similar products, market analysis
   - Example: "Find competitors for my app", "What are similar apps to mine?", "Show me competitors"
   - Action: Set competitorSearchIntent to true in response

RESPONSE FORMAT REMINDER:
Return ONLY the JSON object. No markdown, no code blocks, no additional text.`;

  const userPrompt = `Analyze this user message: "${userMessage.replace(/"/g, '\\"')}"

Determine which stage(s) of the app planning process this message relates to. The user is currently in the "${stageName}" stage.

CRITICAL: Return ONLY the JSON object below. Do not wrap it in markdown code blocks or add any other text:

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
    temperature: 0.2, // Lower temperature for more consistent JSON
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
   - App concept, name, tagline, problem statement, target users, value proposition, *high-level UI style preferences*, *general tech stack preferences*, *platform choice*.
   - Keywords: idea, concept, name, problem, mission, tagline, user, persona, competitor, UI style, tech stack, platform

2. Feature Planning (feature-planning)
   - Core features, feature prioritization, MVP definition, feature dependencies.
   - Keywords: feature, functionality, mvp, priority, moscow, core feature

3. Structure & Flow (structure-flow)
   - App architecture, screens, user journeys, navigation patterns, data models (conceptual).
   - Keywords: structure, flow, screen, navigation, user flow, journey, sitemap, data model

4. Interface & Interaction (interface-interaction)
   - Visual design, layout, component styling, interaction patterns, design system, *detailed UI style implementation*.
   - Keywords: interface, ui, design, color, layout, component, style, visual, design system, interaction, copywriting

5. Architecture Design (architecture-design)
   - Technical architecture, database schema, API endpoints, file structure, *detailed data models*.
   - Keywords: architecture, database, schema, api, endpoint, technical, folder, structure

6. User & Auth Flow (user-auth-flow)
   - Authentication methods, user roles, permissions, security features, session management.
   - Keywords: auth, authentication, login, register, user, role, permission, security

7. UX Review & User Check (ux-review-check)
   - Design validation, completeness check, user testing scenarios, overall project assessment.
   - Keywords: review, check, validate, test, assessment, evaluation

8. Auto-Prompt Engine (auto-prompt-engine)
   - Generate development prompts, code scaffolding instructions, AI generation.
   - Keywords: prompt, generate, bolt, code, export, development

9. Export & Handoff (export-handoff)
   - Documentation, export formats, developer handoff materials, project artifacts.
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