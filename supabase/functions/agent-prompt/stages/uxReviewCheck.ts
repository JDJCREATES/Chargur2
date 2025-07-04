/**
 * uxReviewCheck.ts (Edge Function)
 * 
 * Server-side prompt generation for UX Review & User Check stage.
 */

export function generateUXReviewPrompt(context: any) {
  const { allStageData, userMessage } = context;

  const systemPrompt = `You are a senior UX auditor and quality assurance specialist. You excel at conducting comprehensive reviews of app designs, identifying gaps, inconsistencies, and opportunities for improvement.

CORE RESPONSIBILITIES:
- Analyze completeness across all design stages
- Identify missing information and inconsistencies
- Calculate completion scores and readiness metrics
- Provide actionable recommendations for improvement
- Validate cross-stage coherence and dependencies

REVIEW CRITERIA:
1. Ideation Completeness (20%): App idea, problem, users, value prop
2. Feature Coherence (20%): Feature selection aligns with concept
3. Structure Logic (20%): Screens and flows support features
4. Design Consistency (15%): Visual design supports user goals
5. Technical Feasibility (15%): Architecture supports requirements
6. Security Adequacy (10%): Auth system meets feature needs

CROSS-STAGE VALIDATION:
- Features align with target users and problems
- Screens support all selected features
- Design system appropriate for app type
- Database schema supports feature requirements
- Auth system adequate for security needs

ALL STAGE DATA:
${JSON.stringify(allStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `User message: "${userMessage}"

Conduct a comprehensive UX review of the entire project. Analyze all stages for completeness, consistency, and quality. Provide a detailed assessment with actionable recommendations.

Calculate an overall completion score (0-100) and identify specific areas needing attention.

Respond in this exact JSON format:
{
  "content": "Your comprehensive UX review and assessment",
  "suggestions": ["Critical fix 1", "Improvement 2", "Enhancement 3"],
  "autoFillData": {
    "completionScore": 85,
    "stageScores": {
      "ideation-discovery": 90,
      "feature-planning": 80,
      "structure-flow": 85
    },
    "missingItems": [
      {
        "stage": "feature-planning",
        "item": "Custom features not defined",
        "priority": "high",
        "impact": "Affects MVP scope definition"
      }
    ],
    "inconsistencies": [
      {
        "description": "Social features selected but no user roles for moderation",
        "stages": ["feature-planning", "user-auth-flow"],
        "recommendation": "Add moderator role or remove social features"
      }
    ],
    "recommendations": [
      {
        "type": "improvement",
        "title": "Add user onboarding flow",
        "description": "Current structure lacks new user guidance",
        "priority": "high",
        "effort": "medium"
      }
    ],
    "readinessAssessment": {
      "readyForDevelopment": true,
      "blockers": [],
      "nextSteps": ["Complete missing items", "Address inconsistencies"]
    }
  },
  "stageComplete": false,
  "context": {
    "reviewMethodology": "How the assessment was conducted",
    "qualityMetrics": "Key quality indicators and thresholds"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.2,
    maxTokens: 1600
  };
}