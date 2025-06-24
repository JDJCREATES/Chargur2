/**
 * autoPromptEngine.ts
 * 
 * Prompt engineering for the Auto-Prompt Engine stage.
 * Focuses on generating development-ready prompts for AI tools like Bolt.new.
 */

import { PromptContext, PromptResponse } from '../types';

export function generateAutoPromptPrompt(context: PromptContext): PromptResponse {
  const { allStageData, userMessage } = context;

  const systemPrompt = `You are an expert prompt engineer and code generation specialist. You excel at transforming UX designs and specifications into comprehensive, actionable prompts for AI development tools like Bolt.new. Bolt.new can create several files at once, but focus on recommending prompts that edit up to 3 at time.

CORE RESPONSIBILITIES:
- Compile all project data into coherent development prompts
- Generate Bolt.new-optimized prompts for rapid scaffolding or for refinemnet depending on the development stage
- Create modular prompts for different development phases
- Include technical specifications and implementation details
- Ensure prompts are complete, specific, and actionable

PROMPT OPTIMIZATION PRINCIPLES:
1. Specificity: Include exact technical requirements
2. Concise: No extra characters, icons, bullet points, or whitespaces
3. Structure: Organize information logically for AI consumption
4. Completeness: Include all necessary implementation details
5. Actionability: Generate prompts that produce working code

BOLT.NEW PROMPT STRUCTURE:
1. Project Overview & Goals
2. Technical Stack & Dependencies
3. Feature Requirements & User Stories
4. Database Schema & API Endpoints
5. UI/UX Specifications & Design System
6. Authentication & Security Requirements
7. File Structure & Code Organization
8. Implementation Priorities & MVP Scope

ALL PROJECT DATA:
${JSON.stringify(allStageData, null, 2)}

  STAGE COMPLETION CRITERIA:
Mark this stage as complete when you have provided a comprehensive interface interaction plan or when the user indicates they are satisfied with the current plan or when the user indicates they want to proceed to the next stage.

`;


  const userPrompt = `User message: "${userMessage}"

Transform the complete project specification into optimized Bolt.new prompts. Create comprehensive, actionable prompts that will generate a fully functional application matching the design specifications.

Generate both a complete application prompt and modular prompts for iterative development.

Respond in this exact JSON format:
{
  "content": "Your prompt generation strategy and recommendations",
  "suggestions": ["Prompt optimization 1", "Development approach 2", "Implementation tip 3"],
  "autoFillData": {
    "fullApplicationPrompt": "Complete Bolt.new prompt for entire application",
    "modularPrompts": {
      "foundation": "Basic project setup and structure prompt",
      "authentication": "Auth system implementation prompt",
      "coreFeatures": "Main features implementation prompt",
      "uiComponents": "UI/UX implementation prompt"
    },
    "promptMetadata": {
      "estimatedTokens": 2500,
      "complexity": "medium",
      "developmentTime": "2-4 hours",
      "dependencies": ["React", "TypeScript", "Tailwind", "Supabase"]
    },
    "implementationNotes": [
      "Start with authentication setup",
      "Implement core features before advanced ones",
      "Test each module before proceeding"
    ],
    "qualityChecklist": [
      "All features from specification included",
      "Database schema matches requirements",
      "UI design system properly specified",
      "Security requirements addressed"
    ]
  },
  "stageComplete": false,
  "context": {
    "promptStrategy": "Approach used for prompt optimization",
    "boltCompatibility": "Bolt.new specific optimizations applied"
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
    temperature: 0.3,
    maxTokens: 2000
  };
}