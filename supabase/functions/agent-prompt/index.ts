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
import { EdgeStagePromptEngine } from './stages/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// LLM Client for Edge Functions
class EdgeLLMClient {
  private apiKey: string
  private provider: 'openai' | 'anthropic'
  private model: string

  constructor(provider: 'openai' | 'anthropic' = 'openai') {
    this.provider = provider
    this.apiKey = this.getApiKey()
    this.model = this.getDefaultModel()
  }

  private getApiKey(): string {
    console.log(`🔑 Attempting to get API key for provider: ${this.provider}`)
    const key = this.provider === 'openai' 
      ? Deno.env.get('OPENAI_API_KEY')
      : Deno.env.get('ANTHROPIC_API_KEY')
    
    if (!key) {
      console.error(`❌ Missing API key for ${this.provider}`)
      console.error('🔍 Available env vars:', Object.keys(Deno.env.toObject()))
      throw new Error(`${this.provider.toUpperCase()}_API_KEY environment variable is required`)
    }
    console.log(`✅ API key found for ${this.provider} (length: ${key.length})`)
    return key
  }

  private getDefaultModel(): string {
    return this.provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-sonnet-20240229'
  }

  async generateResponse(systemPrompt: string, userPrompt: string, temperature = 0.7, maxTokens = 1500): Promise<string> {
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
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`)
      try {
        const response = await this.makeRequest(systemPrompt, userPrompt, temperature, maxTokens)
        console.log('✅ Request successful, extracting content...')
        return this.extractContent(response)
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error)
        lastError = error as Error
        
        // Don't retry on auth errors
        if (error.status === 401 || error.status === 403) {
          console.error('🚫 Auth error detected, not retrying')
          throw error
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
          console.log(`⏳ Waiting ${delay}ms before retry...`)
        }
      }
    }

    console.error('❌ All retry attempts failed')
    throw lastError!
  }

  private async makeRequest(systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number) {
    console.log('🌐 Making HTTP request to LLM API...')
    const url = this.provider === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.anthropic.com/v1/messages'
    
    console.log('🎯 API URL:', url)

    const headers = this.provider === 'openai'
      ? {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      : {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        }

    console.log('📋 Request headers:', { ...headers, Authorization: '[REDACTED]', 'x-api-key': '[REDACTED]' })

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

    console.log('✅ API request successful, parsing JSON...')
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
  lastTokenIndex?: number
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
    const { stageId, currentStageData, allStageData, conversationHistory, userMessage, memory, recommendations, conversationId, lastTokenIndex }: AgentRequest = await req.json()

    // Create a streaming response
    const stream = new ReadableStream({
      start(controller) {
        // Process agent request with modular prompt system
        processAgentRequest(controller, {
          stageId,
          currentStageData,
          allStageData,
          conversationHistory,
          userMessage,
          memory,
          recommendations,
          conversationId,
          lastTokenIndex
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
  const { stageId, currentStageData, allStageData, userMessage, memory, recommendations, conversationId, lastTokenIndex } = request

  try {
    console.log('🔍 Starting processAgentRequest for stage:', stageId)
    console.log('📝 User message:', userMessage)
    
    // Initialize LLM client
    console.log('🤖 Initializing LLM client...')
    const llmClient = new EdgeLLMClient('openai') // Default to OpenAI, fallback to Anthropic if needed
    console.log('✅ LLM client initialized successfully')
    
    // Generate stage-specific prompt using modular system
    console.log('📋 Generating stage-specific prompt...')
    const promptData = EdgeStagePromptEngine.generatePrompt(request)
    console.log('✅ Prompt generated successfully')
    console.log('📊 Prompt metadata:', {
      systemPromptLength: promptData.systemPrompt.length,
      userPromptLength: promptData.userPrompt.length,
      temperature: promptData.temperature,
      maxTokens: promptData.maxTokens
    })
    
    // Get LLM response
    console.log('🚀 Calling LLM API...')
    const llmResponse = await llmClient.generateResponse(
      promptData.systemPrompt,
      promptData.userPrompt,
      promptData.temperature,
      promptData.maxTokens
    )
    console.log('✅ LLM response received')
    console.log('📄 Response length:', llmResponse.length)
    console.log('🔍 Response preview:', llmResponse.substring(0, 200) + '...')
    
    // Parse and validate response
    console.log('🔧 Parsing and validating response...')
    const response = parseAndValidateResponse(llmResponse, stageId)
    console.log('✅ Response parsed successfully')
    console.log('📊 Parsed response structure:', {
      hasContent: !!response.content,
      suggestionsCount: response.suggestions.length,
      hasAutoFillData: Object.keys(response.autoFillData).length > 0,
      stageComplete: response.stageComplete
    })
    
    // Stream the content
    console.log('📡 Starting content streaming...')
    const words = response.content.split(' ')
    console.log('📝 Total words to stream:', words.length)
    
    let streamClosed = false
    let tokenIndex = (lastTokenIndex || -1) + 1
    
    for (let i = 0; i < words.length; i++) {
      // Check if stream is already closed before attempting to enqueue
      if (streamClosed) {
        console.log('🔌 Stream already closed, stopping content streaming')
        break
      }
      
      const chunk = words.slice(0, i + 1).join(' ')
      
      // Log every 10th chunk to avoid spam
      if (i % 10 === 0) {
        console.log(`📡 Streaming chunk ${i + 1}/${words.length}`)
      }
      
      try {
        const tokenData = {
          type: 'content',
          content: chunk,
          conversationId,
          tokenIndex: tokenIndex++
        }
        controller.enqueue(`data: ${JSON.stringify(tokenData)}\n\n`)
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('cannot close or enqueue')) {
          console.log('🔌 Client disconnected during streaming, stopping gracefully')
          streamClosed = true
          break
        } else {
          console.error('❌ Unexpected streaming error:', error)
          throw error // Re-throw if it's not a client disconnection
        }
      }
      
      // Add realistic delay
      if (!streamClosed) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    console.log('✅ Content streaming completed')

    // Send completion data
    console.log('🏁 Sending completion data...')
    controller.enqueue(`data: ${JSON.stringify({ 
      type: 'complete', 
      ...response 
    })}\n\n`)
    
    // Send completion data with error handling
    if (!streamClosed) {
      try {
        const completionData = {
          type: 'complete', 
          ...response,
          conversationId
        }
        controller.enqueue(`data: ${JSON.stringify(completionData)}\n\n`)
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('cannot close or enqueue')) {
          console.log('🔌 Client disconnected before completion data could be sent')
          streamClosed = true
        } else {
          console.error('❌ Error sending completion data:', error)
          throw error
        }
      }
    }
    
    console.log('✅ Completion data sent')

    console.log('🎉 processAgentRequest completed successfully')
    
    // Close controller with error handling
    if (!streamClosed) {
      try {
        controller.close()
        console.log('✅ Stream closed successfully')
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('cannot close or enqueue')) {
          console.log('🔌 Stream was already closed by client')
        } else {
          console.error('❌ Error closing stream:', error)
        }
      }
    } else {
      console.log('🔌 Stream was already closed due to client disconnection')
    }

  } catch (error) {
    console.error('❌ Processing error occurred:', error)
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    // Handle stream errors gracefully
    try {
      // Try to send an error message to the client first
      const errorData = {
        type: 'error', 
        error: 'Processing failed. Please try again.',
        conversationId
      }
      controller.enqueue(`data: ${JSON.stringify(errorData)}\n\n`)
      controller.close()
    } catch (controllerError) {
      console.log('🔌 Could not send error to client (likely disconnected)')
      // Use controller.error() as last resort
      controller.error(error)
    }
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
    
    // Validate required fields
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
    }
    
    // Ensure stageComplete is boolean
    if (typeof parsed.stageComplete !== 'boolean') {
      console.log('⚠️ Fixing stageComplete field (not a boolean)')
      parsed.stageComplete = false
    }
    
    // Ensure context is an object
    if (!parsed.context || typeof parsed.context !== 'object') {
      console.log('⚠️ Fixing context field (not an object)')
      parsed.context = {}
    }
    
    console.log('✅ Response validation completed successfully')
    return {
      content: parsed.content,
      suggestions: parsed.suggestions.slice(0, 5), // Limit to 5 suggestions
      autoFillData: parsed.autoFillData,
      stageComplete: parsed.stageComplete,
      context: parsed.context
    }
    
  } catch (error) {
    console.error('❌ Failed to parse LLM response:', error)
    console.error('📄 Raw response that failed to parse:', llmResponse)
    
    // Fallback response
    console.log('🔄 Using fallback response')
    return {
      content: llmResponse || "I'm here to help you with this stage. What would you like to work on?",
      suggestions: ["Tell me more about your needs", "What should we focus on?", "Help me understand your goals"],
      autoFillData: {},
      stageComplete: false,
      context: { parseError: true, originalResponse: llmResponse }
    }
  }
}

// Additional helper functions for error handling and response validation
function validateEnvironmentVariables(): void {
  const requiredVars = ['OPENAI_API_KEY']
  const missingVars = requiredVars.filter(varName => !Deno.env.get(varName))
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`)
    console.warn('Falling back to mock responses for development')
  }
}

// Initialize environment check
validateEnvironmentVariables()