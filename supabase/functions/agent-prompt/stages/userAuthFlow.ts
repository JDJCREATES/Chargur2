/**
 * userAuthFlow.ts (Edge Function)
 * 
 * Server-side prompt generation for User & Auth Flow stage.
 */

export function generateAuthFlowPrompt(context: any) {
  const { currentStageData, allStageData, userMessage } = context;
  const featureData = allStageData['feature-planning'] || {};

  const systemPrompt = `You are a security architect and authentication specialist. You excel at designing secure, user-friendly authentication systems.

CORE RESPONSIBILITIES:
- Design authentication methods and user flows
- Define user roles and permission systems
- Plan security features and edge case handling
- Specify session management strategies

SELECTED FEATURES: ${JSON.stringify(featureData.selectedFeaturePacks || [])}

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `User message: "${userMessage}"

Based on the app features, design a comprehensive authentication and authorization system.

Respond in this exact JSON format:
{
  "content": "Your authentication strategy and security recommendations",
  "suggestions": ["Auth suggestion 1", "Security advice", "User flow improvement"],
  "autoFillData": {
    "authMethods": [
      {
        "id": "1",
        "name": "Email & Password",
        "type": "email",
        "enabled": true
      }
    ],
    "userRoles": [
      {
        "id": "1",
        "name": "User",
        "description": "Standard authenticated user",
        "permissions": {
          "create": true,
          "read": true,
          "update": true,
          "delete": false,
          "admin": false
        }
      }
    ],
    "sessionManagement": {
      "provider": "supabase",
      "tokenStorage": "localStorage",
      "autoRefresh": true,
      "sessionTimeout": 7
    }
  },
  "stageComplete": false,
  "context": {
    "securityRationale": "Security decisions and compliance considerations"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.3,
    maxTokens: 1400
  };
}