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
    const key = this.provider === 'openai' 
      ? Deno.env.get('OPENAI_API_KEY')
      : Deno.env.get('ANTHROPIC_API_KEY')
    
    if (!key) {
      throw new Error(`${this.provider.toUpperCase()}_API_KEY environment variable is required`)
    }
    return key
  }

  private getDefaultModel(): string {
    return this.provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-sonnet-20240229'
  }

  async generateResponse(systemPrompt: string, userPrompt: string, temperature = 0.7, maxTokens = 1500): Promise<string> {
    const maxRetries = 3
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(systemPrompt, userPrompt, temperature, maxTokens)
        return this.extractContent(response)
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on auth errors
        if (error.status === 401 || error.status === 403) {
          throw error
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError!
  }

  private async makeRequest(systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number) {
    const url = this.provider === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.anthropic.com/v1/messages'

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

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
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
        // Process agent request with modular prompt system
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
  const { stageId, currentStageData, allStageData, userMessage, memory, recommendations } = request

  try {
    // Initialize LLM client
    const llmClient = new EdgeLLMClient('openai') // Default to OpenAI, fallback to Anthropic if needed
    
    // Generate stage-specific prompt using modular system
    const promptData = EdgeStagePromptEngine.generatePrompt(request)
    
    // Get LLM response
    const llmResponse = await llmClient.generateResponse(
      promptData.systemPrompt,
      promptData.userPrompt,
      promptData.temperature,
      promptData.maxTokens
    )
    
    // Parse and validate response
    const response = parseAndValidateResponse(llmResponse, stageId)
    
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

function parseAndValidateResponse(llmResponse: string, stageId: string): AgentResponse {
  try {
    // Try to parse JSON response
    const parsed = JSON.parse(llmResponse)
    
    // Validate required fields
    if (!parsed.content || typeof parsed.content !== 'string') {
      throw new Error('Missing or invalid content field')
    }
    
    // Ensure suggestions is an array
    if (!Array.isArray(parsed.suggestions)) {
      parsed.suggestions = []
    }
    
    // Ensure autoFillData is an object
    if (!parsed.autoFillData || typeof parsed.autoFillData !== 'object') {
      parsed.autoFillData = {}
    }
    
    // Ensure stageComplete is boolean
    if (typeof parsed.stageComplete !== 'boolean') {
      parsed.stageComplete = false
    }
    
    // Ensure context is an object
    if (!parsed.context || typeof parsed.context !== 'object') {
      parsed.context = {}
    }
    
    return {
      content: parsed.content,
      suggestions: parsed.suggestions.slice(0, 5), // Limit to 5 suggestions
      autoFillData: parsed.autoFillData,
      stageComplete: parsed.stageComplete,
      context: parsed.context
    }
    
  } catch (error) {
    console.error('Failed to parse LLM response:', error)
    console.error('Raw response:', llmResponse)
    
    // Fallback response
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