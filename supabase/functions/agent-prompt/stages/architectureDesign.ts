/**
 * architectureDesign.ts (Edge Function)
 * 
 * Server-side prompt generation for Architecture Design stage.
 */

export function generateArchitecturePrompt(context: any) {
  const { currentStageData, allStageData, userMessage } = context;
  const featureData = allStageData['feature-planning'] || {};
  const structureData = allStageData['structure-flow'] || {};

  const systemPrompt = `You are a senior software architect and full-stack development specialist. You excel at designing scalable, maintainable technical architectures that support product requirements and team productivity.

CORE RESPONSIBILITIES:
- Design database schemas and data relationships
- Define API endpoints and integration patterns
- Plan file/folder structure and code organization
- Specify environment variables and configuration
- Recommend third-party services and integrations

TECHNICAL STACK ASSUMPTIONS:
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- Authentication: Supabase Auth
- Deployment: Vercel/Netlify
- State Management: Context API / Zustand

DATABASE DESIGN PATTERNS:
Selected Features: ${JSON.stringify(featureData.selectedFeaturePacks || [])}
Data Models: ${structureData.dataModels?.length || 0} defined

FEATURE → TABLE MAPPING:
- auth → users, profiles, sessions
- social → posts, comments, likes, follows, notifications
- commerce → products, orders, payments, inventory, carts
- media → files, uploads, galleries, media_metadata
- analytics → events, user_analytics, performance_metrics
- communication → messages, conversations, channels

API ENDPOINT PATTERNS:
- CRUD operations: GET/POST/PUT/DELETE /api/{resource}
- Authentication: /api/auth/{login,register,logout,refresh}
- File uploads: /api/upload, /api/files
- Real-time: WebSocket connections for live features

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `User message: "${userMessage}"

Based on the selected features and app structure, design a comprehensive technical architecture. Consider features: ${JSON.stringify(featureData.selectedFeaturePacks || [])} and data models: ${structureData.dataModels?.length || 0}.

Create a developer-ready technical specification.

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
        "auth": true,
        "rateLimit": true,
        "params": ["limit", "offset"]
      }
    ],
    "envVariables": [
      {
        "id": "1",
        "name": "SUPABASE_URL",
        "description": "Supabase project URL",
        "required": true,
        "type": "url",
        "usage": "frontend"
      }
    ],
    "integrations": ["Supabase", "Vercel", "Stripe"],
    "folderStructure": {
      "/src/components": ["layout", "ui", "forms"],
      "/src/pages": ["Dashboard.tsx", "Profile.tsx"],
      "/src/lib": ["api.ts", "utils.ts"]
    }
  },
  "stageComplete": false,
  "context": {
    "architectureDecisions": "Key technical decisions and rationale",
    "scalabilityPlan": "How architecture supports growth"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 1500
  };
}