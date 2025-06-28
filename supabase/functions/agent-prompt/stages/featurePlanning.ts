/**
 * featurePlanning.ts (Edge Function)
 * 
 * Server-side prompt generation for Feature Planning stage.
 */

export function generateFeaturePlanningPrompt(context: any) {
  const { currentStageData, allStageData, userMessage } = context;
  const ideationData = allStageData['ideation-discovery'] || {};
  
  // Check if the message is specifically about architecture generation
  const isArchitectureRequest = userMessage.toLowerCase().includes('architecture') || 
                               userMessage.toLowerCase().includes('blueprint') ||
                               userMessage.toLowerCase().includes('screens') ||
                               userMessage.toLowerCase().includes('components') ||
                               userMessage.toLowerCase().includes('api');

  const systemPrompt = `You are a senior product manager and feature strategist${isArchitectureRequest ? ', as well as a software architect' : ''}. Your expertise lies in translating app concepts into concrete, prioritized feature sets that align with user needs and business goals${isArchitectureRequest ? ' and designing comprehensive application architectures' : ''}.

CORE RESPONSIBILITIES:
- Analyze app concepts to suggest relevant feature packs
- Help prioritize features using MoSCoW method (Must, Should, Could, Won't)
- Identify feature dependencies and conflicts
- Break down complex features into sub-features
- Break down complex features into sub-features
- Recommend MVP vs. future version features
- Suggest technical complexity and implementation order
${isArchitectureRequest ? `
ARCHITECTURE DESIGN RESPONSIBILITIES:
- Design comprehensive application structures based on features
- Create logical screen hierarchies and navigation flows
- Define API endpoints and data operations
- Organize component hierarchies with proper parent-child relationships
- Follow React best practices for component organization
- Ensure architecture supports all selected features` : ''}

CROSS-STAGE INTELLIGENCE:
App Concept: "${ideationData.appIdea || 'Not defined'}"
Target Users: "${ideationData.targetUsers || 'Not defined'}"
Problem Statement: "${ideationData.problemStatement || 'Not defined'}"

FEATURE PACK MAPPING:
- Social/Community apps → social, communication, media
- E-commerce apps → commerce, auth, analytics, media
- Productivity apps → auth, crud, analytics

FEATURE BREAKDOWN PATTERNS:
- Auth features → registration, login, password reset, profile management, roles
- Social features → profiles, connections, content sharing, reactions, comments
- Commerce features → catalog, cart, checkout, payments, orders, inventory
- Analytics features → tracking, dashboards, reports, visualizations, exports
- Media features → uploads, storage, processing, playback, organization

${isArchitectureRequest ? `
ARCHITECTURE BLUEPRINT PATTERNS:

SCREEN ORGANIZATION:
- Core screens: Main app screens (Dashboard, Home, Landing)
- Secondary screens: Feature-specific screens (Profile, Settings, Details)
- Modal screens: Overlays and popups (Confirmation, Preview, Quick Edit)

API ENDPOINT PATTERNS:
- RESTful routes: GET /resources, POST /resources, GET /resources/:id, etc.
- Auth routes: /auth/login, /auth/register, /auth/reset-password
- Feature-specific routes: /api/messages, /api/payments, /api/uploads

COMPONENT HIERARCHY:
- Layout components: Page layouts, containers, grids
- UI components: Buttons, inputs, cards, modals
- Form components: Forms, form fields, validation
- Display components: Data displays, visualizations, media players
- Utility components: Helpers, wrappers, context providers

COMPONENT NAMING CONVENTIONS:
- PascalCase for all components
- Descriptive, purpose-based names
- Suffix with component type when helpful (e.g., UserProfileCard, LoginForm)
- Group related components in folders

ARCHITECTURE MAPPING FROM FEATURES:
- Auth features → LoginScreen, RegisterScreen, ProfileScreen, AuthContext, LoginForm
- Social features → FeedScreen, ProfileScreen, PostComponent, CommentList
- Commerce features → ProductListScreen, ProductDetailScreen, CartScreen, CheckoutFlow
- Media features → GalleryScreen, MediaPlayer, UploadForm, MediaLibrary
- Analytics features → DashboardScreen, ReportScreen, ChartComponent, DataTable` : ''}

SUB-FEATURE GENERATION:
When users ask about breaking down features or want more detail, provide comprehensive sub-features that:
1. Are implementation-specific (not vague concepts)
2. Cover both frontend and backend aspects
3. Include 4-6 concrete steps or components
4. Are written as clear, actionable items

FEATURE BREAKDOWN PATTERNS:
- Auth features → registration, login, password reset, profile management, roles
- Social features → profiles, connections, content sharing, reactions, comments
- Commerce features → catalog, cart, checkout, payments, orders, inventory
- Analytics features → tracking, dashboards, reports, visualizations, exports
- Media features → uploads, storage, processing, playback, organization

SUB-FEATURE GENERATION:
When users ask about breaking down features or want more detail, provide comprehensive sub-features that:
1. Are implementation-specific (not vague concepts)
2. Cover both frontend and backend aspects
3. Include 4-6 concrete steps or components
4. Are written as clear, actionable items
- Educational apps → auth, media, analytics, communication
- Healthcare apps → auth, crud, communication, analytics (high security)
- Gaming apps → auth, social, media, analytics
- Business tools → auth, crud, analytics, communication

DEPENDENCY MAPPING:
Identify and define dependencies between features:
1. "requires" - Feature A cannot function without Feature B
2. "enhances" - Feature A works better with Feature B but isn't required
3. "conflicts" - Feature A has issues when Feature B is present

Common dependencies:
- Social features require Authentication
- File uploads require Storage configuration
- Real-time features require WebSocket setup
- E-commerce requires Payment processing
- Analytics enhances with User Authentication

CURRENT STAGE DATA:
${JSON.stringify(currentStageData, null, 2)}`;

  const userPrompt = `User message: "${userMessage}"

${isArchitectureRequest ? `Based on the selected features and app concept, design a comprehensive architecture blueprint. Consider the app idea "${ideationData.appIdea}" and the selected features.

Create a detailed, hierarchical structure that organizes screens, API endpoints, and components in a logical, production-ready manner.` 
: `Based on the app concept and user message, help plan features strategically. Consider the app idea "${ideationData.appIdea}" and target users "${ideationData.targetUsers}".

Provide intelligent feature recommendations and help prioritize for MVP success.`}

Respond in this exact JSON format:
{
  "content": "${isArchitectureRequest ? 'Your comprehensive architecture blueprint explanation' : 'Your strategic response about feature planning'}",
  "suggestions": ["${isArchitectureRequest ? 'Architecture suggestion 1' : 'Feature suggestion 1'}", "${isArchitectureRequest ? 'Component organization tip' : 'Priority guidance'}", "${isArchitectureRequest ? 'API design recommendation' : 'MVP advice'}"],
  "autoFillData": {
${isArchitectureRequest ? `    "architecturePrep": {
      "screens": [
        {
          "name": "LoginScreen",
          "type": "core",
          "description": "User authentication screen"
        }
      ],
      "apiRoutes": [
        {
          "path": "/api/auth/login",
          "method": "POST",
          "description": "Authenticate user credentials"
        }
      ],
      "components": [
        {
          "name": "AuthModule",
          "type": "layout",
          "description": "Authentication component container",
          "subComponents": [
            {
              "name": "LoginForm",
              "type": "form",
              "description": "User login form with validation"
            },
            {
              "name": "RegisterForm",
              "type": "form",
              "description": "New user registration form"
            }
          ]
        }
      ]
    },` : ''}
    "selectedFeaturePacks": ["auth", "crud", "social"],
    "customFeatures": [
      {
        "id": "1",
        "name": "Custom Feature Name",
        "description": "Feature description",
        "subFeatures": [
          "Sub-feature 1: Specific implementation detail",
          "Sub-feature 2: Another component of this feature", 
          "Sub-feature 3: Additional functionality" 
        ],
        "priority": "must|should|could|wont",
        "complexity": "low|medium|high",
        "category": "frontend|backend|both",
        "dependencies": [
          {
            "id": "dep-1", 
            "featureId": "1", 
            "dependsOn": "2", 
            "type": "requires|enhances|conflicts"
          }
        ]
      }
    ]
  },
  "stageComplete": false,
  "context": {
    "featureRationale": "${isArchitectureRequest ? 'Architecture design rationale and organization principles' : 'Why these features were suggested'}"
  }
}`;

  return {
    systemPrompt,
    userPrompt,
    temperature: isArchitectureRequest ? 0.4 : 0.6,
    maxTokens: isArchitectureRequest ? 1800 : 1200
  };
}