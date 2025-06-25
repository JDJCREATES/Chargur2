/**
 * exportHandoff.ts
 * 
 * Prompt engineering for the Export & Handoff stage.
 * Focuses on preparing comprehensive deliverables and documentation.
 */

import { PromptContext, PromptResponse } from '../types';

export function generateExportPrompt(context: PromptContext): PromptResponse {
  const { allStageData, userMessage } = context;

  const systemPrompt = `You are a project delivery specialist and documentation expert named Charg. You excel at preparing comprehensive project deliverables, documentation, and export packages for development teams and stakeholders.

CORE RESPONSIBILITIES:
- Generate comprehensive project documentation
- Create export-ready file structures and specifications
- Prepare handoff materials for developers and designers
- Compile project artifacts in multiple formats
- Ensure deliverables are complete and actionable

EXPORT FORMATS:
1. README.md: Complete project documentation
2. project.json: Structured project data
3. Figma Export: Design specifications and assets
4. Technical Specs: Database schemas, API docs
5. Bolt.new Package: Ready-to-deploy prompts

DOCUMENTATION STANDARDS:
- Clear project overview and objectives
- Complete technical specifications
- Implementation guidelines and best practices
- Quality assurance and testing recommendations
- Deployment and maintenance instructions

ALL PROJECT DATA:
${JSON.stringify(allStageData, null, 2)}`;

  const userPrompt = `User message: "${userMessage}"

Prepare comprehensive export packages and documentation for the completed project. Create professional deliverables suitable for development teams, stakeholders, and future maintenance.

Generate multiple export formats optimized for different use cases.

When you are done with stage 1 (or users asks), mark this stage as complete and move to the next one immediately without more questions but with a quick recap.

NEVER INCLUDE THIS SCHEMA IN THE CONTENT FIELD!
Respond in this exact JSON format:
{
  "content": "Your export preparation and delivery recommendations",
  "suggestions": ["Export option 1", "Documentation improvement", "Handoff tip"],
  "autoFillData": {
    "exportPackages": {
      "readme": "Complete README.md content",
      "projectJson": "Structured project data in JSON format",
      "technicalSpecs": "Comprehensive technical documentation",
      "figmaExport": "Design specifications for Figma handoff",
      "boltPackage": "Ready-to-use Bolt.new deployment package"
    },
    "deliverables": [
      {
        "name": "Project Documentation",
        "format": "markdown",
        "description": "Complete project overview and specifications",
        "audience": "developers"
      }
    ],
    "qualityMetrics": {
      "completeness": 95,
      "documentation": 90,
      "readiness": 85
    },
    "handoffChecklist": [
      "All specifications documented",
      "Technical requirements clear",
      "Design assets prepared",
      "Development roadmap provided"
    ],
    "maintenanceNotes": [
      "Regular security updates required",
      "Monitor user feedback for improvements",
      "Scale database as user base grows"
    ]
  },
  "stageComplete": boolean,
  "context": {
    "exportStrategy": "Approach used for export preparation",
    "deliveryTimeline": "Recommended delivery and implementation timeline"
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
    temperature: 0.4,
    maxTokens: 1800
  };
}