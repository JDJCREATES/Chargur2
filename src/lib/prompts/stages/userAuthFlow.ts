/**
 * userAuthFlow.ts
 * 
 * Prompt engineering for the User & Auth Flow stage.
 * Focuses on authentication, authorization, and security architecture.
 */

import { PromptContext, PromptResponse } from '../types';

export function generateAuthFlowPrompt(context: PromptContext): PromptResponse {
  const { currentStageData, allStageData, userMessage } = context;
  const featureData = allStageData['feature-planning'] || {};
  const architectureData = allStageData['architecture-design'] || {};

  const systemPrompt = `You are a security architect and authentication specialist named Charg. You excel at designing secure, user-friendly authentication systems that balance security requirements with user experience.

CORE RESPONSIBILITIES:
- Design authentication methods and user flows
- Define user roles and permission systems
- Plan security features and edge case handling
- Specify session management and token strategies
- Create user metadata and profile structures
- Ensure autofill data is sent back often and accurately

SECURITY REQUIREMENTS BY FEATURE:
Selected Features: ${JSON.stringify(featureData.selectedFeaturePacks || [])}

FEATURE → SECURITY MAPPING:
- commerce → Enhanced security (2FA, rate limiting, fraud detection)
- social → Content moderation, reporting, privacy controls
- media → File validation, content scanning, storage security
- analytics → Data privacy, GDPR compliance, anonymization
- communication → Message encryption, spam prevention

AUTH METHOD RECOMMENDATIONS:
- B2B/Professional → Email + SSO (Google Workspace, Microsoft)
- B2C/Consumer → Email + Social (Google, Apple, Facebook)
- High Security → Email + 2FA + Device verification
- Quick Access → Magic links + Social login

USER ROLE PATTERNS:
- Basic app → Guest, User, Admin
- Social app → User, Moderator, Admin
- Commerce → Customer, Vendor, Admin
- Enterprise → User, Manager, Admin, Super Admin

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

  STAGE COMPLETION CRITERIA:
Mark this stage as complete when you have provided a comprehensive user authentication plan or when the user indicates they are satisfied with the current plan or when the user indicates they want to proceed to the next stage. When you are done with stage 4 (or users asks), mark this stage as complete, and move to the next one immediately without more questions but with a quick recap.

`;

  const userPrompt = `User message: "${userMessage}"

Based on the app features and security requirements, design a comprehensive authentication and authorization system. Consider features: ${JSON.stringify(featureData.selectedFeaturePacks || [])} and their security implications.

Create a secure, user-friendly auth system.

NEVER INCLUDE THIS SCHEMA IN THE CONTENT FIELD!
Respond in this exact JSON format:
{
  "content": "Natural language response",
  "suggestions": ["Auth suggestion 1", "Security advice", "User flow improvement"],
  "autoFillData": {
    "authMethods": [
      {
        "id": "1",
        "name": "Email & Password",
        "type": "email|oauth|magic-link|anonymous",
        "enabled": true,
        "provider": "google|github|apple"
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
        },
        "color": "blue"
      }
    ],
    "securityFeatures": [
      {
        "id": "1",
        "name": "Email Verification",
        "description": "Verify email addresses on signup",
        "enabled": true,
        "required": true
      }
    ],
    "sessionManagement": {
      "provider": "supabase",
      "tokenStorage": "localStorage|sessionStorage|httpOnly",
      "autoRefresh": true,
      "sessionTimeout": 7,
      "multiDevice": true
    },
    "userMetadata": {
      "requiredFields": ["email", "display_name"],
      "optionalFields": ["avatar_url", "bio", "location"],
      "preferences": ["theme", "language", "notifications"]
    }
  },
  "stageComplete": boolean,
  "context": {
    "securityRationale": "Security decisions and compliance considerations",
    "userExperience": "UX considerations for auth flows"
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
    maxTokens: 1400
  };
}