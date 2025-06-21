/**
 * architectureDesign.ts (Edge Function)
 * 
 * Server-side prompt generation for Architecture Design stage.
 */

export function generateArchitecturePrompt(context: any) {
  const { currentStageData, allStageData, userMessage } = context;
  const featureData = allStageData['feature-planning'] || {};

  const systemPrompt = `You are a senior software architect and full-stack development specialist. You excel at designing scalable, maintainable technical architectures.

CORE RESPONSIBILITIES:
- Design database schemas and data relationships
- Define API endpoints and integration patterns
- Plan file/folder structure and code organization
- Specify environment variables and configuration

TECHNICAL STACK:
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- Authentication: Supabase Auth

SELECTED FEATURES: ${JSON.stringify(featureData.selectedFeaturePacks || [])}

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `User message: "${userMessage}"

Based on the selected features, design a comprehensive technical architecture.

Respond in this exact JSON format:
{
  "content": "Your technical architecture explanation and recommendations",
  "suggestions": ["Architecture suggestion 1", "Database advice", "Integration recommendation"],
  "autoFillData": {
    "databaseSchema": [
      {
        "id": "1",
        "name": "users",
        "fields": [
          {
            "name": "id",
            "type": "uuid",
            "required": true,
            "unique": true
          }
        ],
        "relations": ["profiles"]
      }
    ],
    "apiEndpoints": [
      {
        "id": "1",
        "method": "GET",
        "path": "/api/users",
        "description": "User management endpoint",
        "auth": true
      }
    ],
    "integrations": ["Supabase", "Vercel"]
  },
  "stageComplete": false,
  "context": {
    "architectureDecisions": "Key technical decisions and rationale"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 1500
  };
}