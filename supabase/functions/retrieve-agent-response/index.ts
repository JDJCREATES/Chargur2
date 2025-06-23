/**
 * Supabase Edge Function: retrieve-agent-response
 * 
 * Retrieves saved agent response tokens for conversation recovery.
 * Used when clients need to recover from disconnections or navigation.
 */

/// <reference types="https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Type declaration for Deno environment (if needed)
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

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
}

interface RetrieveResponse {
  completeResponse?: {
    full_content: string
    suggestions: string[]
    auto_fill_data: unknown
    stage_complete: boolean
    context: unknown
    is_complete: boolean
  }
  conversationStatus: string
}

serve(async (req: Request) => {
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { conversationId }: RetrieveRequest = await req.json()
    
    console.log('📋 Request parameters:', { conversationId })
    
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
    
    // Get complete response only (no tokens)
    const { data: completeResponse, error: responseError } = await supabase
      .from('chat_responses')
      .select('full_content, suggestions, auto_fill_data, stage_complete, context, is_complete')
      .eq('conversation_id', conversationId)
      .eq('is_complete', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (responseError && responseError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Failed to retrieve complete response:', responseError)
    }
    
    console.log('📄 Complete response available:', !!completeResponse?.is_complete)
    
    const response: RetrieveResponse = {
      completeResponse: completeResponse?.is_complete ? completeResponse : undefined,
      conversationStatus: conversation.status
    }
    
    console.log('✅ Sending response')
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Retrieve function error:', error)
    
    const getErrorMessage = (err: unknown): string => {
      if (err instanceof Error) return err.message
      if (typeof err === 'string') return err
      return 'Internal server error'
    }
    
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})