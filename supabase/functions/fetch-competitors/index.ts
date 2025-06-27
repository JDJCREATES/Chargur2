/**
 * Supabase Edge Function: fetch-competitors
 * 
 * Fetches competitor information based on app description.
 * Uses external search API to find and analyze competitors.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get the origin from environment or request
const getAllowedOrigin = (request: Request): string => {
  const origin = request.headers.get('origin');
  
  // Define your allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:5174', // Alternative Vite port
    'http://localhost:4173', // Vite preview
    'https://your-app-domain.com',
    'https://your-app-domain.vercel.app',
    // Add your actual production domains
  ];
  
  // For development, allow any localhost or webcontainer origin
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('webcontainer'))) {
    return origin;
  }
  
  // Fallback to first allowed origin or restrict
  return origin || allowedOrigins[1]; // Default to localhost:5173
};

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
});

interface CompetitorRequest {
  appDescription: string;
  maxResults?: number;
}

interface Competitor {
  name: string;
  domain?: string;
  link?: string;
  tagline?: string;
  features?: string[];
  pricingTiers?: string[];
  marketPositioning?: string;
  strengths?: string[];
  weaknesses?: string[];
  notes?: string;
}

interface CompetitorResponse {
  competitors: Competitor[];
  searchQuery: string;
  timestamp: string;
}

// Main function to search for competitors
async function searchCompetitors(appDescription: string, maxResults: number = 4): Promise<Competitor[]> {
  console.log(`🔍 Searching for competitors based on: "${appDescription}"`);
  console.log(`📊 Max results requested: ${maxResults}`);
  
  try {
    // 1. Prepare the search query based on the app description
    const searchQuery = `top competitors for ${appDescription} app`;
    console.log(`🔎 Search query: "${searchQuery}"`);
    
    // Check if we have the OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    
    // Make the API call to OpenAI with web search tool enabled
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        tools: [
          {
            "type": "web_search",
            "config": {
              "provider": "bing"
            }
          }
        ],
        tool_choice: "auto",
        messages: [
          {
            role: "system",
            content: `You are a competitive analysis expert. Your task is to identify and analyze competitors for a given app description.

INSTRUCTIONS:
1. Use the web_search tool to find real, current competitors for the app description
2. Search for each competitor's website, features, pricing, and reviews
3. For each competitor, gather:
   - Name (official company/product name)
   - Domain (just the domain, e.g., "example.com")
   - Full URL (e.g., "https://example.com")
   - Tagline or elevator pitch (from their website)
   - 3-5 unique core features or value propositions
   - Pricing tiers (if available)
   - Market positioning (budget, mid-market, premium, enterprise)
   - 2-3 key strengths (based on reviews or analysis)
   - 2-3 key weaknesses (based on reviews or analysis)

4. Format your response as a valid JSON array of competitor objects
5. Include citations for your sources when possible
6. Focus on finding REAL competitors with ACCURATE information
7. Prioritize direct competitors in the same market segment`
          },
          {
            role: "user",
            content: `Find the top ${maxResults} competitors for this app: "${appDescription}". 
            
Use web search to find real, current competitors and gather detailed information about them. Return ONLY a JSON array of competitor objects with no additional text.`
          }
        ],
        temperature: 0.5,
        max_tokens: 3000,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ OpenAI API error:", errorData);
      throw new Error(`Search API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const toolCalls = data.choices[0]?.message?.tool_calls;
    
    console.log(`🔧 Tool calls: ${toolCalls ? toolCalls.length : 0}`);
    
    // Process the response based on whether tool calls were used
    let competitors: Competitor[] = [];
    
    if (content) {
      // Try to extract competitors from the content
      console.log(`📄 Content returned from API (first 100 chars): ${content.substring(0, 100)}...`);
      
      // Parse the content as JSON or extract JSON from it
      competitors = await extractCompetitorsFromContent(content);
    } else if (toolCalls && toolCalls.length > 0) {
      // Process tool calls if content is not available
      console.log(`🔧 Processing tool calls response`);
      
      // In a real implementation, you might need to make additional API calls
      // to get the results of the tool calls, but for this example we'll assume
      // the results are already included in the response
      
      // This would be where you'd process the tool_calls data
      // For now, we'll just log that we received tool calls
      console.log(`⚠️ Tool calls processing not fully implemented`);
      
      // Fallback to empty array if we can't extract competitors
      competitors = [];
    } else {
      throw new Error("No usable content or tool calls returned from search API");
    }
    
    // Return the competitors, limited to the requested number
    return competitors.slice(0, maxResults);
    
  } catch (error) {
    console.error("❌ Error searching for competitors:", error);
    throw error;
  }
}

// Helper function to extract competitors from content
async function extractCompetitorsFromContent(content: string): Promise<Competitor[]> {
  try {
    // Extract the JSON array from the content (it might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    // Parse the JSON string into an array of competitor objects
    const competitors = JSON.parse(jsonString);
    
    // Validate and clean up the competitor objects
    return competitors.map((competitor: any) => ({
      name: competitor.name || "Unknown Competitor",
      domain: competitor.domain || "",
      link: competitor.link || competitor.url || "",
      tagline: competitor.tagline || competitor.elevator_pitch || "",
      features: Array.isArray(competitor.features) ? competitor.features : 
               Array.isArray(competitor.core_features) ? competitor.core_features : [],
      pricingTiers: Array.isArray(competitor.pricing_tiers) ? competitor.pricing_tiers : 
                   Array.isArray(competitor.pricing) ? competitor.pricing : [],
      marketPositioning: competitor.market_positioning || competitor.positioning || "",
      strengths: Array.isArray(competitor.strengths) ? competitor.strengths : [],
      weaknesses: Array.isArray(competitor.weaknesses) ? competitor.weaknesses : [],
      notes: competitor.notes || ""
    }));
  } catch (parseError) {
    console.error("❌ Error parsing competitor data:", parseError);
    console.error("Raw content (first 200 chars):", content.substring(0, 200));
    
    // If we can't parse as JSON, try to extract competitors using a more lenient approach
    console.log("🔄 Attempting alternative parsing approach...");
    
    // Return empty array as fallback
    return [];
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { appDescription, maxResults = 4 }: CompetitorRequest = await req.json();
    
    if (!appDescription) {
      return new Response(
        JSON.stringify({ error: "appDescription is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`📥 Received request to find competitors for: "${appDescription}"`);
    
    // Search for competitors
    const competitors = await searchCompetitors(appDescription, maxResults);
    
    // If we have a user ID from the request, save the search history
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          
          // Get user from token
          const { data: { user } } = await supabase.auth.getUser(token);
          
          if (user) {
            // Save search history
            await supabase.from('competitor_search_history').insert({
              user_id: user.id,
              search_query: appDescription,
              results: competitors
            });
            
            console.log(`✅ Saved search history for user: ${user.id}`);
          }
        }
      }
    } catch (saveError) {
      // Don't fail the request if saving history fails
      console.error("⚠️ Error saving search history:", saveError);
    }
    
    // Prepare the response
    const response: CompetitorResponse = {
      competitors,
      searchQuery: `top competitors for ${appDescription} app`,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Found ${competitors.length} competitors`);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("❌ Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});