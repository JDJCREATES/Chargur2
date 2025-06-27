/**
 * Supabase Edge Function: fetch-competitors
 * 
 * Fetches competitor information based on app description.
 * Uses external search API to find and analyze competitors.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // This is where you'll integrate with your chosen search API
    // For example, using OpenAI's browsing capability or a dedicated search API
    
    // 1. Prepare the search query based on the app description
    const searchQuery = `top competitors for ${appDescription} app`;
    console.log(`🔎 Search query: "${searchQuery}"`);
    
    // 2. Make the API call to your search provider
    // This is where you'll implement the actual API call
    // For example:
    
    // Check if we have the OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    
    // Make the API call to OpenAI with browsing capability
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a competitive analysis expert. Your task is to identify and analyze competitors for a given app description. 
            For each competitor, provide:
            1. Name
            2. Domain (just the domain, e.g., "example.com")
            3. Full URL (e.g., "https://example.com")
            4. Tagline or elevator pitch
            5. 3-5 unique core features or value propositions
            6. Pricing tiers (if available)
            7. Market positioning (budget, mid-market, premium, enterprise)
            8. 2-3 key strengths
            9. 2-3 key weaknesses
            
            Format your response as a valid JSON array of competitor objects.`
          },
          {
            role: "user",
            content: `Find the top ${maxResults} competitors for this app: "${appDescription}". Return ONLY a JSON array of competitor objects with no additional text.`
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ OpenAI API error:", errorData);
      throw new Error(`Search API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from search API");
    }
    
    // 3. Parse the results into competitor objects
    // Extract the JSON array from the content (it might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    try {
      // Parse the JSON string into an array of competitor objects
      const competitors = JSON.parse(jsonString);
      
      // Validate and clean up the competitor objects
      return competitors.slice(0, maxResults).map((competitor: any) => ({
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
      console.error("Raw content:", content);
      throw new Error("Failed to parse competitor data from search results");
    }
    
  } catch (error) {
    console.error("❌ Error searching for competitors:", error);
    throw error;
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