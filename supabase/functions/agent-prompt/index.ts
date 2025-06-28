/**
 * Supabase Edge Function: agent-prompt
 * 
 * Enhanced AI Agent with modular prompt system:
 * - Modular stage-specific prompt generators
 * - Multiple LLM provider support (OpenAI, Anthropic)
 * - Structured response parsing and validation
 * - Advanced error handling and retry logic
 * - Context-aware cross-stage intelligence
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EdgeStagePromptEngine } from './stages/index.ts'
import { generateIntentClassificationPrompt } from './stages/intentClassifier.ts'

// Get the origin from environment or request
const getAllowedOrigin = (request: Request): string => {
  const origin = request.headers.get('origin')
  
  // Define your allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:5174', // Alternative Vite port
    'http://localhost:4173', // Vite preview
    'https://your-app-domain.com',
    'https://your-app-domain.vercel.app',
    // Add your actual production domains
  ]
  
  // For development, allow any localhost or webcontainer origin
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('webcontainer'))) {
    return origin
  }
  
  // Fallback to first allowed origin or restrict
  return origin || allowedOrigins[1] // Default to localhost:5173
}

const getCorsHeaders = (request: Request) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(request),
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': [
    'authorization',
    'x-client-info', 
    'apikey',
    'content-type',
    'cache-control',
    'x-requested-with'
  ].join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400', // 24 hours
  // SSE-specific headers
  'Access-Control-Expose-Headers': 'content-type, cache-control',
})

// LLM Client for Edge Functions
class EdgeLLMClient {
  private apiKey: string
  private provider: 'openai' | 'anthropic'
  private model: string

  constructor(provider: 'openai' | 'anthropic' = 'openai') {
    this.provider = provider
    this.apiKey = this.getApiKey() || ''
    this.model = this.getDefaultModel()
  }

  private getApiKey(): string | null {
    const key = this.provider === 'openai' 
      ? Deno.env.get('OPENAI_API_KEY')
      : Deno.env.get('ANTHROPIC_API_KEY')
    
    if (!key) {
      console.error(`❌ Missing API key for ${this.provider}`)
      console.error('🔍 Available env vars:', Object.keys(Deno.env.toObject()))
      return null
    }
    console.log(`✅ API key found for ${this.provider} (length: ${key.length})`)
    return key
  }

  private getDefaultModel(): string {
    return this.provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-sonnet-20240229'
  }

  async generateResponse(systemPrompt: string, userPrompt: string, temperature = 0.7, maxTokens = 1500): Promise<string> {
    // Check for API key first
    if (!this.apiKey) {
      throw new Error(`${this.provider.toUpperCase()}_API_KEY environment variable is required`)
    }
    
    console.log('🚀 EdgeLLMClient.generateResponse called')
    console.log('📊 Request parameters:', {
      provider: this.provider,
      model: this.model,
      temperature,
      maxTokens,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length
    })
    
    const maxRetries = 3
    let lastError: Error | null = null // Initialize as null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`)
      try {
        const response = await this.makeRequest(systemPrompt, userPrompt, temperature, maxTokens)
        return this.extractContent(response)
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error)
        
        // Properly handle the unknown error type
        if (error instanceof Error) {
          lastError = error
        } else {
          lastError = new Error(typeof error === 'string' ? error : 'Unknown error occurred')
        }
        
        // Don't retry on auth errors - check if it's an Error with status property
        const errorWithStatus = error as { status?: number }
        if (errorWithStatus.status === 401 || errorWithStatus.status === 403) {
          console.error('🚫 Auth error detected, not retrying')
          throw lastError
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000
          console.log(`⏳ Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  private async makeRequest(systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number) {
    console.log('🌐 Making HTTP request to LLM API...')
    const url = this.provider === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.anthropic.com/v1/messages'
    
    console.log('🎯 API URL:', url)

    // Create headers object with proper typing
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add provider-specific headers
    if (this.provider === 'openai') {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    } else {
      headers['x-api-key'] = this.apiKey
      headers['anthropic-version'] = '2023-06-01'
    }


    const body = this.provider === 'openai'
      ? {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens,
        }
      : {
          model: this.model,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          temperature,
          max_tokens: maxTokens,
        }

    console.log('📦 Request body:', { ...body, messages: '[REDACTED]' })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    console.log('📡 Response status:', response.status)
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ API error response:', errorData)
      throw new Error(`LLM API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    return response.json()
  }

  private extractContent(response: any): string {
    if (this.provider === 'openai') {
      return response.choices[0]?.message?.content || ''
    } else {
      return response.content[0]?.text || ''
    }
  }
}

interface AgentRequest {
  stageId: string
  currentStageData: any
  allStageData: any
  conversationHistory: any[]
  userMessage: string
  memory: any
  recommendations?: any[]
  conversationId?: string
  llmProvider?: 'openai' | 'anthropic'
}

interface AgentResponse {
  content: string
  suggestions: string[]
  autoFillData: any
  stageComplete: boolean
  context: any
  memoryUpdate?: any
  userPrompt?: string // Add this to track the original user input
}

export { serve }

async function saveCompleteResponse(
  supabase: any,
  conversationId: string,
  response: AgentResponse,
  userPrompt: string,
  userId: string | null
) {
  try {
    const { error } = await supabase
      .from('chat_responses')
      .insert({
        conversation_id: conversationId,
        user_prompt: userPrompt,
        full_content: response.content,
        suggestions: response.suggestions || [],
        auto_fill_data: response.autoFillData || {},
        stage_complete: response.stageComplete || false,
        is_complete: true,
        context: {
          timestamp: new Date().toISOString(),
          model_used: 'gpt-4o-mini',
          user_id: userId || undefined
        }
      })

    if (error) {
      console.error('❌ Failed to save complete response:', error)
      throw error
    }

    console.log('✅ Complete response saved successfully')
  } catch (error) {
    console.error('❌ Error saving complete response:', error)
    throw error
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📥 Received request, parsing JSON...')
    const requestData: AgentRequest = await req.json()
    console.log('✅ Request JSON parsed successfully')

    // Create a streaming response with better connection handling
    const stream = new ReadableStream({
      start(controller) {
        processAgentRequest(controller, requestData, req) // Pass req here
      },
      cancel(reason) {
        console.log('🔌 Stream cancelled by client:', reason)
        // Cleanup logic here if needed
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
        'Transfer-Encoding': 'chunked', // Add this
      },
    })

  } catch (error) {
    console.error('Agent error:', error)
    
    // Type guard for error handling
    const getErrorMessage = (err: unknown): string => {
      if (err instanceof Error) {
        return err.message
      }
      if (typeof err === 'string') {
        return err
      }
      return 'Internal server error'
    }
    
    // Ensure we always return valid JSON
    const errorResponse = {
      error: getErrorMessage(error),
      type: 'server_error',
      timestamp: new Date().toISOString()
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function processAgentRequest(controller: ReadableStreamDefaultController, request: AgentRequest, req: Request) {
  
  const { 
    stageId, 
    currentStageData, 
    allStageData, 
    userMessage, 
    memory, 
    recommendations, 
    conversationId, 
    llmProvider = 'openai'
  } = request

  // Track if competitor search was performed
  let competitorSearchPerformed = false
  let competitorSearchResults = null
  let competitorSearchError = null

  // Initialize Supabase client for database operations
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Database configuration missing')
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get user from JWT token
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  let userId = null
  if (token) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id
    } catch (error) {
      console.error('Failed to get user from token:', error)
    }
  }

  // Track stream state more reliably
  let streamClosed = false
  let heartbeatInterval: number | null = null

  // Helper function to safely enqueue data
  const safeEnqueue = (data: any): boolean => {
    if (streamClosed) {
      return false
    }
    
    try {
      const encoder = new TextEncoder()
      const encoded = encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
      controller.enqueue(encoded)
      return true
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('cannot close or enqueue')) {
        console.log('🔌 Client disconnected, marking stream as closed')
        streamClosed = true
        return false
      }
      console.error('❌ Unexpected enqueue error:', error)
      throw error
    }
  }

  // Helper function to safely close stream
  const safeClose = () => {
    if (streamClosed) {
      return
    }
    if (heartbeatInterval !== null) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
    
    try {
      controller.close()
      streamClosed = true
      console.log('✅ Stream closed successfully')
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('cannot close or enqueue')) {
        console.log('🔌 Stream was already closed by client')
        streamClosed = true
      } else {
        console.error('❌ Error closing stream:', error)
      }
    }
  }

  // Start heartbeat
  const startHeartbeat = () => {
    if (heartbeatInterval !== null) return
    heartbeatInterval = setInterval(() => {
      if (streamClosed) {
        clearInterval(heartbeatInterval!)
        heartbeatInterval = null
        return
      }
      
      const pingData = {
        type: 'ping',
        timestamp: new Date().toISOString(),
        conversationId
      }
      
      if (!safeEnqueue(pingData)) {
        clearInterval(heartbeatInterval!)
        heartbeatInterval = null
      }
    }, 12000)
  }

  // STEP 1: Use Intent Classifier to detect competitor search intent
  console.log('🔍 Running intent classification...')
  const llmClient = new EdgeLLMClient(llmProvider)
  let intentResult = { competitorSearchIntent: false }
  
  // Generate intent classification prompt
  const intentContext = {
    userMessage,
    stageId,
    allStageData,
    conversationHistory: request.conversationHistory || []
  }
  
  const intentPrompt = generateIntentClassificationPrompt(intentContext)
  
  try {
    const intentResponse = await llmClient.generateResponse(
      intentPrompt.systemPrompt,
      intentPrompt.userPrompt,
      intentPrompt.temperature,
      intentPrompt.maxTokens
    )
    
    console.log('📋 Intent classification response:', intentResponse)
    
    // Parse intent classification result
    let competitorSearchIntent = false
    try {
      intentResult = JSON.parse(intentResponse)
      competitorSearchIntent = intentResult.competitorSearchIntent === true
    } catch (parseError) {
      console.error('❌ Failed to parse intent classification:', parseError)
      intentResult = { competitorSearchIntent: false }
    }
    
    // Add this right after intent classification:
    console.log('🔍 Intent classification debug:')
    console.log('- User message:', userMessage)
    console.log('- Intent response raw:', intentResponse)
    console.log('- Intent result parsed:', JSON.stringify(intentResult, null, 2))
    console.log('- Competitor search intent:', intentResult.competitorSearchIntent)
    console.log('- Intent value type:', typeof intentResult.competitorSearchIntent)
    
    // STEP 2: Handle competitor search if detected
    if (intentResult.competitorSearchIntent === true) {
      console.log('🎯 Competitor search intent detected! Calling fetch-competitors...')
      
      // Get app description from current stage or all stage data
      const appDescription = currentStageData?.appIdea || 
                           allStageData?.['ideation-discovery']?.appIdea ||
                           userMessage
      
      if (appDescription) {
        try {
          console.log('🔍 Calling fetch-competitors with description:', appDescription.substring(0, 100) + '...')
          
          const competitorResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-competitors`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader || '',
            },
            body: JSON.stringify({
              appDescription: appDescription,
              maxResults: 4
            })
          })

          if (competitorResponse.ok) {
            const competitorData = await competitorResponse.json()
            console.log('✅ Competitor search successful:', competitorData.resultCount, 'competitors found')
            
            // Store the results for later use
            competitorSearchPerformed = true
            competitorSearchResults = competitorData
            
            // Send intermediate update to client
            const competitorUpdate = {
              type: 'competitor_results',
              competitors: competitorData.competitors,
              conversationId
            }
            
            if (!safeEnqueue(competitorUpdate)) {
              console.log('🔌 Client disconnected during competitor search')
              return
            }
            
          } else {
            // Improved error handling with proper typing
            const getErrorMessage = async (response: Response): Promise<string> => {
              try {
                const errorData = await response.json()
                
                // Type-safe error extraction
                if (errorData && typeof errorData === 'object') {
                  if ('error' in errorData && typeof errorData.error === 'string') {
                    return errorData.error
                  }
                  if ('message' in errorData && typeof errorData.message === 'string') {
                    return errorData.message
                  }
                }
                
                return `HTTP ${response.status}: ${response.statusText}`
              } catch (parseError) {
                return `HTTP ${response.status}: ${response.statusText}`
              }
            }
            
            const errorMessage = await getErrorMessage(competitorResponse)
            console.error('❌ Competitor search API error:', competitorResponse.status, errorMessage)
            competitorSearchError = `API error: ${competitorResponse.status} - ${errorMessage}`
          }
          
        } catch (fetchError) {
          console.error('❌ Competitor search failed:', fetchError)
          competitorSearchError = fetchError instanceof Error ? fetchError.message : 'Unknown error'
        }
      } else {
        console.warn('⚠️ No app description available for competitor search')
        competitorSearchError = 'No app description available'
      }
    }
    
  } catch (intentError) {
    console.error('❌ Intent classification failed:', intentError)
    // Continue with normal processing if intent classification fails
  }

  try {
    console.log('🔍 Starting processAgentRequest for stage:', stageId)
    console.log('🤖 Using LLM provider:', llmProvider)
    console.log('📝 User message:', userMessage)
    
    const requestWithCompetitorContext = {
      ...request,
      allStageData,
      competitorSearchPerformed,
      competitorSearchResults,
      competitorSearchError
    }
    
    const promptData = await EdgeStagePromptEngine.generatePrompt(requestWithCompetitorContext, llmClient)
    console.log('✅ Prompt generated successfully with temperature:', promptData.temperature)
    const suggestedPrimaryStage = promptData.suggestedPrimaryStage
    console.log('🔄 Suggested primary stage:', suggestedPrimaryStage || 'none')
    
    // STEP 4: Get LLM response
    const llmResponse = await llmClient.generateResponse(
      promptData.systemPrompt,
      promptData.userPrompt,
      promptData.temperature,
      promptData.maxTokens
    )
    console.log('✅ LLM response received')
    
    // STEP 5: Parse and validate response
    console.log('🔧 Parsing and validating response...')
    const response = parseAndValidateResponse(llmResponse, stageId)
    console.log('✅ Response parsed successfully')
    
    // STEP 6: Add competitor data to autoFillData if search was performed
    if (competitorSearchPerformed && competitorSearchResults) {
      console.log('📊 Adding competitor data to autoFillData')
      const competitors = competitorSearchResults.competitors || []
      
      // Create a text representation for the competitors field
      const competitorText = competitors
        .map((comp: any) => `${comp.name} (${comp.domain}) - ${comp.tagline}`)
        .join('\n')
      
      // Add to the current stage's autoFillData
      if (!response.autoFillData[stageId]) {
        response.autoFillData[stageId] = {}
      }
      
      response.autoFillData[stageId] = {
        ...response.autoFillData[stageId],
        competitors: competitorText,
        competitorData: competitors,
        competitorNodes: competitors.map((comp: any, index: number) => ({
          id: `competitor-${comp.name.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'competitor',
          data: {
            label: comp.name,
            domain: comp.domain,
            tagline: comp.tagline,
            features: comp.features,
            pricing: comp.pricingTiers,
            positioning: comp.marketPositioning,
            strengths: comp.strengths,
            weaknesses: comp.weaknesses,
            url: comp.link
          },
          position: { x: 100 + (index * 200), y: 100 + (Math.floor(index / 3) * 150) }
        }))
      }
    }
    
    // STEP 7: Stream the content word by word
    const words = response.content.split(' ')
    let fullContent = ''
    
    for (let i = 0; i < words.length && !streamClosed; i++) {
      fullContent = words.slice(0, i + 1).join(' ')
      
      const streamData = {
        type: 'content',
        content: fullContent,
        conversationId
      }
      
      if (!safeEnqueue(streamData)) {
        console.log('🔌 Client disconnected')
        break
      }
      if (i < words.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    // STEP 8: Send completion
    if (!streamClosed && fullContent) {
      const completionData = {
        type: 'complete',
        content: fullContent,
        suggestions: response.suggestions || [],
        autoFillData: response.autoFillData || {},
        stageComplete: response.stageComplete || false,
        goToStageId: suggestedPrimaryStage,
        competitorSearchPerformed,
        competitorSearchResults: competitorSearchPerformed ? competitorSearchResults : null,
        competitorSearchError,
        conversationId
      }

        console.log('📊 AutoFillData being sent:', JSON.stringify(completionData.autoFillData, null, 2));
      
      if (safeEnqueue(completionData)) {
        await saveCompleteResponse(supabase, conversationId!, response, userMessage, userId || null)
      }
    }
    
    safeClose()
    console.log('🎉 processAgentRequest completed successfully')

  } catch (error) {
    console.error('❌ Processing error occurred:', error)
    
    const getErrorDetails = (err: unknown) => {
      if (err instanceof Error) {
        return {
          name: err.name,
          message: err.message,
          stack: err.stack
        }
      }
      return {
        name: 'Unknown',
        message: typeof err === 'string' ? err : 'Unknown error',
        stack: undefined
      }
    }
    
    // Handle stream errors gracefully
    if (!streamClosed) {
      // Try to send an error message to the client first
      const errorData = {
        type: 'error', 
        error: 'Processing failed. Please try again.',
        conversationId
      }
      
      if (!safeEnqueue(errorData)) {
        console.log('🔌 Could not send error to client (already disconnected)')
      }
      
      // Update conversation status to failed
      if (conversationId && supabase) {
        supabase
          .from('chat_conversations')
          .update({ status: 'failed' })
          .eq('id', conversationId)
          .then(() => console.log('📝 Conversation marked as failed'))
          .catch((err: unknown) => {
            const getErrorMessage = (error: unknown): string => {
              if (error instanceof Error) return error.message
              if (typeof error === 'string') return error
              return 'Unknown error'
            }
            console.error('❌ Failed to update conversation status:', getErrorMessage(err))
          })
      }
    }
    
    // Always try to close gracefully
    safeClose()
  }
}

function parseAndValidateResponse(llmResponse: string, stageId: string): AgentResponse {
  console.log('🔧 parseAndValidateResponse called')
  console.log('📄 Response to parse (first 500 chars):', llmResponse.substring(0, 500))

  try {
    // Try to parse JSON response
    console.log('📋 Attempting to parse JSON...')
    const parsed = JSON.parse(llmResponse)
    console.log('✅ JSON parsed successfully')
    console.log('🔍 Parsed keys:', Object.keys(parsed))
    
    // Validate required fields and handle multi-stage autoFillData
    if (!parsed.content || typeof parsed.content !== 'string') {
      console.error('❌ Missing or invalid content field')
      throw new Error('Missing or invalid content field')
    }
    
    // Ensure suggestions is an array
    if (!Array.isArray(parsed.suggestions)) {
      console.log('⚠️ Fixing suggestions field (not an array)')
      parsed.suggestions = []
    }
    
    // Ensure autoFillData is an object
    if (!parsed.autoFillData || typeof parsed.autoFillData !== 'object') {
      console.log('⚠️ Fixing autoFillData field (not an object)')
      parsed.autoFillData = {}
    } else {
      // Process multi-stage autoFillData if present
      const processedAutoFillData: Record<string, any> = {}
      
      // Check if autoFillData contains stage IDs as keys
      const hasStageKeys = Object.keys(parsed.autoFillData).some(key => 
        ['ideation-discovery', 'feature-planning', 'structure-flow', 
         'interface-interaction', 'architecture-design', 'user-auth-flow',
         'ux-review-check', 'auto-prompt-engine', 'export-handoff'].includes(key)
      )
      
      if (hasStageKeys) {
        // Multi-stage format - keep as is
        Object.assign(processedAutoFillData, parsed.autoFillData as Record<string, any>)
      } else {
        // Single stage format - wrap in current stageId
        processedAutoFillData[stageId] = parsed.autoFillData
      }
      
      parsed.autoFillData = processedAutoFillData
    }
    
    // Ensure stageComplete is boolean
    if (typeof parsed.stageComplete !== 'boolean') {
      console.log('⚠️ Fixing stageComplete field (not a boolean)')
      parsed.stageComplete = Boolean(parsed.stageComplete)
    }
    
    // Ensure context is an object
    if (!parsed.context || typeof parsed.context !== 'object') {
      console.log('⚠️ Fixing context field (not an object)')
      parsed.context = {}
    }
    
    // Check for goToStageId field
    console.log('✅ Response validation completed successfully')
    return {
      content: parsed.content || '',
      suggestions: (parsed.suggestions || []).slice(0, 5), // Limit to 5 suggestions
      autoFillData: parsed.autoFillData || {},
      stageComplete: !!parsed.stageComplete,
      context: parsed.context || {}
    }
    
  } catch (error) {
    console.error('❌ Failed to parse LLM response:', error)
    console.error('📄 Raw response that failed to parse:', llmResponse)
    
    // Fallback response
    console.log('🔄 Using fallback response')
    return {
      content: llmResponse || "I'm here to help you with this stage. What would you like to work on?",
      suggestions: ["Tell me more about your needs", "What should we focus on?", "Help me understand your goals"],
      autoFillData: { [stageId]: {} },
      stageComplete: false,
      context: { parseError: true, originalResponse: llmResponse }
    }
  }
}