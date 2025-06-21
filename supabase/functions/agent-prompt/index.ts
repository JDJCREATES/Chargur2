/**
 * Supabase Edge Function: agent-prompt
 * 
 * Handles AI Agent requests with:
 * - Context-aware responses based on current stage
 * - Memory management and conversation history
 * - Auto-fill suggestions for form fields
 * - Stage completion detection
 * - Cross-stage intelligence and recommendations
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AgentRequest {
  stageId: string
  currentStageData: any
  allStageData: any
  conversationHistory: any[]
  userMessage: string
  memory: any
  recommendations?: any[]
}

interface AgentResponse {
  content: string
  suggestions: string[]
  autoFillData: any
  stageComplete: boolean
  context: any
  memoryUpdate?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { stageId, currentStageData, allStageData, conversationHistory, userMessage, memory, recommendations }: AgentRequest = await req.json()

    // Create a streaming response
    const stream = new ReadableStream({
      start(controller) {
        // Simulate AI processing and streaming response
        processAgentRequest(controller, {
          stageId,
          currentStageData,
          allStageData,
          conversationHistory,
          userMessage,
          memory,
          recommendations
        })
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Agent error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function processAgentRequest(controller: ReadableStreamDefaultController, request: AgentRequest) {
  const { stageId, currentStageData, allStageData, userMessage, memory } = request

  try {
    // Generate context-aware response based on stage
    const response = await generateStageResponse(stageId, currentStageData, allStageData, userMessage, memory)
    
    // Stream the content
    const words = response.content.split(' ')
    for (let i = 0; i < words.length; i++) {
      const chunk = words.slice(0, i + 1).join(' ')
      controller.enqueue(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`)
      
      // Add realistic delay
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // Send completion data
    controller.enqueue(`data: ${JSON.stringify({ 
      type: 'complete', 
      ...response 
    })}\n\n`)

    controller.close()

  } catch (error) {
    console.error('Processing error:', error)
    controller.enqueue(`data: ${JSON.stringify({ 
      type: 'error', 
      content: 'Sorry, I encountered an error processing your request.' 
    })}\n\n`)
    controller.close()
  }
}

async function generateStageResponse(
  stageId: string, 
  currentStageData: any, 
  allStageData: any, 
  userMessage: string, 
  memory: any
): Promise<AgentResponse> {
  
  // Stage-specific AI logic
  switch (stageId) {
    case 'ideation-discovery':
      return handleIdeationStage(currentStageData, userMessage, memory)
    
    case 'feature-planning':
      return handleFeaturePlanningStage(currentStageData, allStageData, userMessage, memory)
    
    case 'structure-flow':
      return handleStructureFlowStage(currentStageData, allStageData, userMessage, memory)
    
    case 'interface-interaction':
      return handleInterfaceStage(currentStageData, allStageData, userMessage, memory)
    
    case 'architecture-design':
      return handleArchitectureStage(currentStageData, allStageData, userMessage, memory)
    
    case 'user-auth-flow':
      return handleAuthFlowStage(currentStageData, allStageData, userMessage, memory)
    
    default:
      return {
        content: "I'm here to help you with this stage. What would you like to work on?",
        suggestions: ["Tell me about your app idea", "Help me with features", "What should I focus on?"],
        autoFillData: {},
        stageComplete: false,
        context: {}
      }
  }
}

function handleIdeationStage(currentStageData: any, userMessage: string, memory: any): AgentResponse {
  const lowerMessage = userMessage.toLowerCase()
  
  // Detect app idea descriptions
  if (lowerMessage.includes('app about') || lowerMessage.includes('build') || lowerMessage.includes('create')) {
    const autoFillData: any = {}
    
    // Extract app idea
    const ideaMatch = userMessage.match(/(?:app about|build.*app.*about|create.*app.*about)\s+(.+)/i)
    if (ideaMatch) {
      autoFillData.appIdea = ideaMatch[1].trim()
    }
    
    // Suggest app name based on idea
    if (autoFillData.appIdea) {
      const keywords = autoFillData.appIdea.split(' ').slice(0, 2)
      autoFillData.appName = keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
    }
    
    // Generate problem statement
    if (autoFillData.appIdea) {
      autoFillData.problemStatement = `Users currently struggle with ${autoFillData.appIdea.toLowerCase()} because existing solutions are inadequate or don't exist.`
    }

    return {
      content: `Great idea! I can see you want to build an app about ${autoFillData.appIdea || 'your concept'}. Let me help you flesh this out.\n\nI've started filling in some details based on your description. What specific problem does this app solve for users?`,
      suggestions: [
        "What problem does this solve?",
        "Who would use this app?",
        "What makes it unique?",
        "Help me define the value proposition"
      ],
      autoFillData,
      stageComplete: false,
      context: { ideaExtracted: true }
    }
  }
  
  // Handle problem definition
  if (lowerMessage.includes('problem') || lowerMessage.includes('solve')) {
    return {
      content: "Perfect! Understanding the problem is crucial. Based on what you've described, I can help you define your target users and value proposition. Who do you think would benefit most from this solution?",
      suggestions: [
        "Students and young professionals",
        "Small business owners", 
        "Healthcare workers",
        "General consumers"
      ],
      autoFillData: {},
      stageComplete: false,
      context: { problemDefined: true }
    }
  }

  // Check if stage is complete
  const hasRequiredFields = currentStageData.appIdea && currentStageData.appName && currentStageData.problemStatement
  
  if (hasRequiredFields && (lowerMessage.includes('done') || lowerMessage.includes('complete') || lowerMessage.includes('next'))) {
    return {
      content: "Excellent work! You've defined a solid foundation for your app. Your idea is clear, you've identified the problem, and you know your target users. Ready to move on to feature planning?",
      suggestions: [],
      autoFillData: {},
      stageComplete: true,
      context: { readyForNext: true }
    }
  }

  return {
    content: "I'm here to help you develop your app idea. Tell me what you're building or what specific aspect you'd like to work on!",
    suggestions: [
      "I want to build an app about...",
      "Help me define the problem",
      "Who should be my target users?",
      "What makes a good value proposition?"
    ],
    autoFillData: {},
    stageComplete: false,
    context: {}
  }
}

function handleFeaturePlanningStage(currentStageData: any, allStageData: any, userMessage: string, memory: any): AgentResponse {
  const ideationData = allStageData['ideation-discovery'] || {}
  const lowerMessage = userMessage.toLowerCase()
  
  // Cross-stage intelligence: suggest features based on app idea
  if (lowerMessage.includes('suggest') || lowerMessage.includes('recommend') || lowerMessage.includes('what features')) {
    const autoFillData: any = {}
    
    // Analyze app idea for feature suggestions
    const appIdea = ideationData.appIdea?.toLowerCase() || ''
    
    if (appIdea.includes('social') || appIdea.includes('community') || appIdea.includes('chat')) {
      autoFillData.selectedFeaturePacks = ['social', 'communication']
    } else if (appIdea.includes('shop') || appIdea.includes('buy') || appIdea.includes('sell')) {
      autoFillData.selectedFeaturePacks = ['commerce', 'auth']
    } else if (appIdea.includes('learn') || appIdea.includes('education') || appIdea.includes('course')) {
      autoFillData.selectedFeaturePacks = ['auth', 'media', 'analytics']
    } else {
      autoFillData.selectedFeaturePacks = ['auth', 'crud']
    }

    return {
      content: `Based on your app idea about "${ideationData.appIdea}", I recommend starting with these feature packs. They align well with your concept and target users.`,
      suggestions: [
        "Add custom features",
        "Prioritize features for MVP",
        "What about AI features?",
        "Help me with feature dependencies"
      ],
      autoFillData,
      stageComplete: false,
      context: { featuresRecommended: true }
    }
  }

  // Handle MVP prioritization
  if (lowerMessage.includes('mvp') || lowerMessage.includes('priority') || lowerMessage.includes('must have')) {
    return {
      content: "Great question! For your MVP, focus on the core features that solve the main problem. Based on your app idea, I'd suggest prioritizing user authentication and the core functionality first. What do you think is absolutely essential for the first version?",
      suggestions: [
        "User authentication is essential",
        "Core data management features",
        "Basic user interface",
        "Help me prioritize everything"
      ],
      autoFillData: {},
      stageComplete: false,
      context: { mvpDiscussion: true }
    }
  }

  return {
    content: "Let's plan your app's features! I can suggest feature packs based on your app idea, help you prioritize for MVP, or discuss custom features you have in mind.",
    suggestions: [
      "Suggest features for my app",
      "Help me prioritize for MVP", 
      "I want to add custom features",
      "What about AI enhancements?"
    ],
    autoFillData: {},
    stageComplete: false,
    context: {}
  }
}

function handleStructureFlowStage(currentStageData: any, allStageData: any, userMessage: string, memory: any): AgentResponse {
  const featureData = allStageData['feature-planning'] || {}
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('screens') || lowerMessage.includes('pages') || lowerMessage.includes('structure')) {
    const autoFillData: any = {}
    
    // Generate screens based on selected features
    const screens = ['Dashboard', 'Profile', 'Settings']
    
    if (featureData.selectedFeaturePacks?.includes('auth')) {
      screens.unshift('Login', 'Register')
    }
    
    if (featureData.selectedFeaturePacks?.includes('social')) {
      screens.push('Feed', 'Messages')
    }
    
    if (featureData.selectedFeaturePacks?.includes('commerce')) {
      screens.push('Products', 'Cart', 'Checkout')
    }

    autoFillData.screens = screens.map((name, index) => ({
      id: (index + 1).toString(),
      name,
      type: ['Login', 'Register'].includes(name) ? 'secondary' : 'core'
    }))

    return {
      content: `Based on your selected features, I've suggested a screen structure for your app. These screens will support your core functionality and user flows.`,
      suggestions: [
        "Add more screens",
        "Define user flows",
        "Help with navigation",
        "What about data models?"
      ],
      autoFillData,
      stageComplete: false,
      context: { screensGenerated: true }
    }
  }

  return {
    content: "Let's design your app's structure and user flows. I can help you define screens, map user journeys, and plan the overall architecture.",
    suggestions: [
      "Generate screens for my features",
      "Help me map user flows",
      "What about navigation structure?",
      "Define data models"
    ],
    autoFillData: {},
    stageComplete: false,
    context: {}
  }
}

function handleInterfaceStage(currentStageData: any, allStageData: any, userMessage: string, memory: any): AgentResponse {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('design') || lowerMessage.includes('ui') || lowerMessage.includes('style')) {
    const autoFillData: any = {}
    
    // Suggest design system based on app type
    const ideationData = allStageData['ideation-discovery'] || {}
    const appIdea = ideationData.appIdea?.toLowerCase() || ''
    
    if (appIdea.includes('professional') || appIdea.includes('business')) {
      autoFillData.selectedDesignSystem = 'mui'
    } else if (appIdea.includes('modern') || appIdea.includes('clean')) {
      autoFillData.selectedDesignSystem = 'shadcn'
    } else {
      autoFillData.selectedDesignSystem = 'custom'
    }

    return {
      content: `I've suggested a design system that fits your app's style. We can also customize colors, fonts, and interaction patterns to match your brand.`,
      suggestions: [
        "Customize brand colors",
        "Define interaction rules",
        "Help with layout design",
        "What about mobile responsiveness?"
      ],
      autoFillData,
      stageComplete: false,
      context: { designSystemSelected: true }
    }
  }

  return {
    content: "Let's design your app's interface! I can help you choose a design system, customize branding, and define interaction patterns.",
    suggestions: [
      "Choose a design system",
      "Customize brand colors",
      "Define interaction rules",
      "Help with layout design"
    ],
    autoFillData: {},
    stageComplete: false,
    context: {}
  }
}

function handleArchitectureStage(currentStageData: any, allStageData: any, userMessage: string, memory: any): AgentResponse {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('database') || lowerMessage.includes('schema') || lowerMessage.includes('api')) {
    const autoFillData: any = {}
    
    // Generate basic database schema
    const databaseSchema = [
      {
        id: '1',
        name: 'users',
        fields: [
          { name: 'id', type: 'uuid', required: true, unique: true },
          { name: 'email', type: 'text', required: true, unique: true },
          { name: 'name', type: 'text', required: true, unique: false },
          { name: 'created_at', type: 'timestamptz', required: true, unique: false }
        ],
        relations: []
      }
    ]

    // Add tables based on features
    const featureData = allStageData['feature-planning'] || {}
    
    if (featureData.selectedFeaturePacks?.includes('social')) {
      databaseSchema.push({
        id: '2',
        name: 'posts',
        fields: [
          { name: 'id', type: 'uuid', required: true, unique: true },
          { name: 'user_id', type: 'uuid', required: true, unique: false },
          { name: 'content', type: 'text', required: true, unique: false },
          { name: 'created_at', type: 'timestamptz', required: true, unique: false }
        ],
        relations: ['users']
      })
    }

    autoFillData.databaseSchema = databaseSchema

    return {
      content: `I've created a basic database schema for your app. This includes user management and tables for your key features. We can expand this as needed.`,
      suggestions: [
        "Add more tables",
        "Define API endpoints", 
        "Help with integrations",
        "What about environment variables?"
      ],
      autoFillData,
      stageComplete: false,
      context: { schemaGenerated: true }
    }
  }

  return {
    content: "Let's design your app's technical architecture! I can help with database schema, API endpoints, and system integrations.",
    suggestions: [
      "Generate database schema",
      "Define API endpoints",
      "Plan integrations",
      "Help with file structure"
    ],
    autoFillData: {},
    stageComplete: false,
    context: {}
  }
}

function handleAuthFlowStage(currentStageData: any, allStageData: any, userMessage: string, memory: any): AgentResponse {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('security')) {
    const autoFillData: any = {}
    
    // Enable basic auth methods
    autoFillData.authMethods = [
      { id: '1', name: 'Email & Password', type: 'email', enabled: true },
      { id: '2', name: 'Google OAuth', type: 'oauth', enabled: true, provider: 'google' }
    ]

    // Set up basic user roles
    autoFillData.userRoles = [
      {
        id: '1',
        name: 'User',
        description: 'Standard authenticated user',
        permissions: { create: true, read: true, update: true, delete: false, admin: false }
      },
      {
        id: '2', 
        name: 'Admin',
        description: 'Administrator with full access',
        permissions: { create: true, read: true, update: true, delete: true, admin: true }
      }
    ]

    return {
      content: `I've set up a secure authentication system with email/password and Google OAuth. This includes basic user roles and security features appropriate for your app.`,
      suggestions: [
        "Add more auth methods",
        "Customize user roles",
        "Configure security features",
        "Help with edge cases"
      ],
      autoFillData,
      stageComplete: false,
      context: { authConfigured: true }
    }
  }

  return {
    content: "Let's secure your app with proper authentication! I can help you set up login methods, user roles, and security features.",
    suggestions: [
      "Set up authentication methods",
      "Define user roles",
      "Configure security features", 
      "Handle edge cases"
    ],
    autoFillData: {},
    stageComplete: false,
    context: {}
  }
}