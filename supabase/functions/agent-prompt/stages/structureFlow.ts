/**
 * structureFlow.ts (Edge Function)
 * 
 * Server-side prompt generation for Structure & Flow stage.
 */

export function generateStructureFlowPrompt(context: any) {
  const { currentStageData, allStageData, userMessage } = context;
  const ideationData = allStageData['ideation-discovery'] || {};
  const featureData = allStageData['feature-planning'] || {};

  const systemPrompt = `You are a UX architect and information architect specialist. You excel at translating feature requirements into logical app structures, user flows, and navigation patterns. You provide comprehensive, detailed responses for all aspects of app structure and flow.

CORE RESPONSIBILITIES:
- Design screen hierarchy and navigation structure
- Map user journeys and task flows
- Define data models and relationships
- Plan component architecture
- Establish state management patterns
- Create logical file structure organization
- Define data flow patterns

CROSS-STAGE CONTEXT:
App Concept: "${ideationData.appIdea || 'Not defined'}"
Selected Features: ${JSON.stringify(featureData.selectedFeaturePacks || [])}
Custom Features: ${featureData.customFeatures?.length || 0} defined

SCREEN GENERATION LOGIC:
Base screens: Dashboard, Profile, Settings
+ Auth features → Login, Register, Forgot Password
+ Social features → Feed, Messages, Notifications
+ Commerce features → Products, Cart, Checkout, Orders
+ Media features → Gallery, Upload, Media Library
+ Analytics features → Reports, Insights

USER FLOW PATTERNS:
- Onboarding: Landing → Auth → Welcome → Core Feature
- Core Task: Dashboard → Feature → Action → Confirmation → Result
- Social: Feed → Content → Interaction → Response
- Commerce: Browse → Select → Cart → Checkout → Confirmation

DATA MODEL INFERENCE:
- Auth features → Users, Sessions, Profiles
- Social features → Posts, Comments, Likes, Follows
- Commerce features → Products, Orders, Payments, Inventory
- Content features → Media, Categories, Tags

FILE STRUCTURE PATTERNS:
- React best practices with feature-based organization
- Separation of concerns (components, hooks, utils, types)
- Consistent naming conventions
- Logical grouping of related files

STATE MANAGEMENT RECOMMENDATIONS:
- Simple apps → Local state + Context API
- Medium complexity → Zustand
- High complexity → Redux Toolkit
- Real-time features → Server state + client cache

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.`;

  const userPrompt = `User message: "${userMessage}"

Based on the selected features and app concept, help design the app structure and user flows. Consider the feature packs: ${JSON.stringify(featureData.selectedFeaturePacks || [])}.

${userMessage.toLowerCase().includes('all') || userMessage.toLowerCase().includes('complete') || userMessage.toLowerCase().includes('everything') 
  ? 'Please provide a comprehensive structure for all sections: screens, user flows, data models, components, file structure, and state management.' 
  : 'Focus on the specific aspects mentioned in the user message, but feel free to suggest related structural elements for a cohesive design.'}

Create a logical, user-friendly structure that supports all planned features.

Respond in this exact JSON format:
{
  "content": "Your architectural guidance and structure explanation",
  "suggestions": ["Structure suggestion 1", "Flow improvement", "Navigation advice"],
  "autoFillData": {
    "screens": [
      {
        "id": "1",
        "name": "Dashboard", 
        "type": "core",
        "description": "Main user dashboard"
      },
      {
        "id": "2",
        "name": "Profile",
        "type": "secondary",
        "description": "User profile management"
      },
      {
        "id": "3",
        "name": "Settings",
        "type": "secondary",
        "description": "App settings and preferences"
      }
    ],
    "userFlows": [
      {
        "id": "1",
        "name": "User Registration",
        "steps": ["Landing", "Sign Up", "Verification", "Welcome"],
        "description": "New user onboarding flow"
      },
      {
        "id": "2",
        "name": "Core Task Flow",
        "steps": ["Dashboard", "Feature Selection", "Task Execution", "Confirmation"],
        "description": "Main user task completion flow"
      }
    ],
    "dataModels": [
      {
        "id": "1",
        "name": "User",
        "fields": ["id", "email", "name", "createdAt"],
        "relations": ["Profile", "Posts", "Settings"]
      },
      {
        "id": "2",
        "name": "Content",
        "fields": ["id", "title", "body", "userId", "createdAt"],
        "relations": ["User", "Comments", "Categories"]
      }
    ],
    "components": [
      {
        "id": "1",
        "name": "Header",
        "type": "layout",
        "props": ["user", "onLogout"],
        "description": "Main application header with navigation"
      },
      {
        "id": "2",
        "name": "Sidebar",
        "type": "layout",
        "props": ["isOpen", "onToggle", "menuItems"],
        "description": "Collapsible sidebar navigation"
      }
    ],
    "fileStructure": {
      "/src": {
        "/components": {
          "/layout": ["Header.tsx", "Sidebar.tsx", "Footer.tsx"],
          "/ui": ["Button.tsx", "Card.tsx", "Modal.tsx"]
        },
        "/pages": ["Dashboard.tsx", "Profile.tsx", "Settings.tsx"],
        "/hooks": ["useAuth.tsx", "useData.tsx"],
        "/utils": ["api.ts", "helpers.ts"]
      }
    ],
    "navigationStyle": "bottom-tabs",
    "stateManagement": "context",
    "dataFlow": "Client-side state with server data fetching",
    "userFlowComplexity": "standard",
    "screenDepth": "moderate",
    "includeOnboarding": true,
    "includeAuth": true,
    "includeSettings": true
  },
  "stageComplete": false,
  "context": {
    "architectureRationale": "Why this structure was chosen",
    "scalabilityNotes": "How structure supports growth"
  }
}

If the user asks about a specific section (screens, user flows, data models, components, file structure, state management), provide detailed information for that section while still maintaining the complete JSON structure.`;

  return {
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 1400
  };
}