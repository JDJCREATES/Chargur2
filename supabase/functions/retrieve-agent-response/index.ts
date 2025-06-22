/**
 * Supabase Edge Function: retrieve-agent-response
 * 
 * Retrieves saved agent response tokens for conversation recovery.
 * Used when clients need to recover from disconnections or navigation.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const getAllowedOrigin = (request: Request): string => {
  const origin = request.headers.get('origin')
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4173',
    'https://your-app-domain.com',
    'https://your-app-domain.vercel.app',
  ]
  
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('webcontainer'))) {
    return origin
  }
  
  return origin || allowedOrigins[1]
}

const getCorsHeaders = (request: Request) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(request),
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': [
    'authorization',
    'x-client-info', 
    'apikey',
    'content-type'
  ].join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
})

interface RetrieveRequest {
  conversationId: string
  lastTokenIndex?: number
}

interface RetrieveResponse {
  tokens: Array<{
    token_index: number
    token_content: string
    token_type: string
    created_at: string
  }>
  completeResponse?: {
    full_content: string
    suggestions: string[]
    auto_fill_data: any
    stage_complete: boolean
    context: any
    is_complete: boolean
  }
  conversationStatus: string
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    console.log('🔍 Retrieve agent response function called')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { conversationId, lastTokenIndex = -1 }: RetrieveRequest = await req.json()
    
    console.log('📋 Request parameters:', {
      conversationId,
      lastTokenIndex
    })
    
    // Verify conversation exists and get status
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('status')
      .eq('id', conversationId)
      .single()
    
    if (conversationError || !conversation) {
      console.error('❌ Conversation not found:', conversationError)
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    console.log('✅ Conversation found with status:', conversation.status)
    
    // Get tokens after the specified index
    const { data: tokens, error: tokensError } = await supabase
      .from('chat_response_tokens')
      .select('token_index, token_content, token_type, created_at')
      .eq('conversation_id', conversationId)
      .gt('token_index', lastTokenIndex)
      .order('token_index', { ascending: true })
    
    if (tokensError) {
      console.error('❌ Failed to retrieve tokens:', tokensError)
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve tokens' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    console.log('📦 Retrieved tokens:', tokens?.length || 0)
    
    // Get complete response if available
    const { data: completeResponse, error: responseError } = await supabase
      .from('chat_responses')
      .select('full_content, suggestions, auto_fill_data, stage_complete, context, is_complete')
      .eq('conversation_id', conversationId)
      .single()
    
    if (responseError && responseError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Failed to retrieve complete response:', responseError)
    }
    
    console.log('📄 Complete response available:', !!completeResponse?.is_complete)
    
    const response: RetrieveResponse = {
      tokens: tokens || [],
      completeResponse: completeResponse?.is_complete ? completeResponse : undefined,
      conversationStatus: conversation.status
    }
    
    console.log('✅ Sending response with', response.tokens.length, 'tokens')
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Retrieve function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})