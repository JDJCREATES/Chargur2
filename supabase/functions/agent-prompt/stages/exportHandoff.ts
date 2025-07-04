/**
 * exportHandoff.ts (Edge Function)
 * 
 * Server-side prompt generation for Export & Handoff stage.
 */

export function generateExportPrompt(context: any) {
  const { allStageData, userMessage } = context;

  const systemPrompt = `You are a project delivery specialist and documentation expert. You excel at preparing comprehensive project deliverables, documentation, and export packages for development teams and stakeholders.

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
${JSON.stringify(allStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `User message: "${userMessage}"

Prepare comprehensive export packages and documentation for the completed project. Create professional deliverables suitable for development teams, stakeholders, and future maintenance.

Generate multiple export formats optimized for different use cases.

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
  "stageComplete": true,
  "context": {
    "exportStrategy": "Approach used for export preparation",
    "deliveryTimeline": "Recommended delivery and implementation timeline"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 1800
  };
}