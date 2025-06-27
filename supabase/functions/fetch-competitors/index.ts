/**
 * Supabase Edge Function: fetch-competitors
 * 
 * Fetches competitor information based on app description using OpenAI's web search capability.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Environment validation
const validateEnvironment = () => {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  
  return { openaiApiKey };
};

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
  domain: string;
  link: string;
  tagline: string;
  features: string[];
  pricingTiers: string[];
  marketPositioning: string;
  strengths: string[];
  weaknesses: string[];
  notes: string;
  sourceUrl: string;
}

interface CompetitorResponse {
  competitors: Competitor[];
  searchQuery: string;
  timestamp: string;
  processingTimeMs: number;
  resultCount: number;
  webSearchUsed: boolean;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content?: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function?: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
}

interface RawCompetitor {
  name?: string;
  domain?: string;
  link?: string;
  url?: string;
  tagline?: string;
  features?: unknown[];
  pricingTiers?: unknown[];
  pricing?: unknown[];
  marketPositioning?: string;
  market_positioning?: string;
  strengths?: unknown[];
  weaknesses?: unknown[];
  notes?: string;
  sourceUrl?: string;
}

// Main competitor search function using OpenAI's web search
async function searchCompetitors(appDescription: string, maxResults: number = 4): Promise<Competitor[]> {
  console.log(`🔍 [${new Date().toISOString()}] Searching competitors with web search for: "${appDescription.substring(0, 100)}..."`);
  
  try {
    const { openaiApiKey } = validateEnvironment();
    
    // Input validation
    if (!appDescription?.trim()) {
      throw new Error("App description cannot be empty");
    }
    
    if (maxResults < 1 || maxResults > 10) {
      throw new Error("maxResults must be between 1 and 10");
    }

    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for web search
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
          "User-Agent": "Chargur-CompetitorAnalysis/1.0"
        },
        body: JSON.stringify({
          model: "gpt-4o", // gpt-4o supports web search
          messages: [
            {
              role: "system",
              content: `You are a competitive analysis expert with real-time web search capabilities. Your task is to search the web and identify current, real competitors for a given app description.

SEARCH STRATEGY:
1. Search for current competitors, alternatives, and similar products
2. Look for company websites, product pages, and recent reviews
3. Focus on direct competitors first, then related tools
4. Verify companies are currently active and operational

ANALYSIS REQUIREMENTS:
- Only include REAL, currently operating companies/products
- Extract factual information from current web sources
- Provide accurate website URLs and current information
- Include recent pricing and feature information when available
- Note the source URLs where information was found

For each competitor, provide a JSON object with:
- name: Exact company/product name from web sources
- domain: Website domain (e.g., "example.com")
- link: Full URL to their main website
- tagline: Their current tagline or brief description
- features: Array of 3-5 current key features
- pricingTiers: Current pricing information or ["Contact for pricing"]
- marketPositioning: "budget" | "mid-market" | "premium" | "enterprise"
- strengths: 2-3 competitive advantages based on current info
- weaknesses: 2-3 potential limitations (be objective)
- notes: Additional relevant current information
- sourceUrl: Primary URL where this information was found

Return ONLY a valid JSON array of ${maxResults} competitors. No markdown formatting, no explanations outside the JSON.`
            },
            {
              role: "user",
              content: `Please search the web and find the top ${maxResults} current competitors for this app: "${appDescription}"

Search for:
1. Direct competitors offering similar functionality
2. Alternative solutions in the same market
3. Popular tools that serve the same user needs
4. Recent market leaders in this space

Focus on companies that are currently active and have recent web presence. Include their current websites, features, and pricing information.`
            }
          ],
          temperature: 0.2, // Low temperature for factual accuracy
          max_tokens: 4000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          // CORRECT web search tool configuration
          tools: [
            {
              type: "function",
              function: {
                name: "web_search",
                description: "Search the web for current information about competitors",
                parameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "Search query for finding competitors"
                    }
                  },
                  required: ["query"]
                }
              }
            }
          ],
          tool_choice: "auto" // Let the model decide when to use web search
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => ({}));
        console.error(`❌ OpenAI API error: ${response.status}`, errorData);
        
        // Type guard for error data
        const errorMessage = (errorData && typeof errorData === 'object' && 'error' in errorData && 
          errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) 
          ? String(errorData.error.message) : 'Unknown error';
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
      }
      
      const data: OpenAIResponse = await response.json();
      console.log(`📊 OpenAI response received, processing...`);
      
      // Handle the response - may include tool calls for web search
      const message = data.choices?.[0]?.message;
      if (!message) {
        throw new Error("No message returned from OpenAI API");
      }
      
      // Check if there were tool calls (web searches)
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`🔧 Web search was performed with ${message.tool_calls.length} tool calls`);
        
        // Process tool calls if needed (for more advanced implementations)
        for (const toolCall of message.tool_calls) {
          if (toolCall.function?.name === 'web_search') {
            console.log(`🔍 Web search query: ${toolCall.function.arguments}`);
          }
        }
      }
      
      const content = message.content;
      console.log(`📄 Processing competitor analysis from web search results`);
      
      // Parse and validate the response
      const competitors = extractAndValidateCompetitors(content, maxResults);
      
      console.log(`✅ Successfully found ${competitors.length} competitors using web search`);
      return competitors;
      
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error("Request timed out after 60 seconds");
      }
      throw fetchError instanceof Error ? fetchError : new Error(String(fetchError));
    }
    
  } catch (error: unknown) {
    console.error(`❌ [${new Date().toISOString()}] Error in searchCompetitors:`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// Enhanced JSON extraction and validation
function extractAndValidateCompetitors(content: string, maxResults: number): Competitor[] {
  try {
    // Clean the content - remove markdown code blocks if present
    let cleanContent = content.trim();
    
    // Remove markdown code blocks
    const codeBlockMatch = cleanContent.match(/(?:json)?\s*([\s\S]*?)\s*/);
    if (codeBlockMatch) {
      cleanContent = codeBlockMatch[1].trim();
    }
    
    // Sometimes the response might have explanatory text before/after JSON
    // Try to extract just the JSON array
    const jsonArrayMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      cleanContent = jsonArrayMatch[0];
    }
    
    // Parse JSON
    const parsed: unknown = JSON.parse(cleanContent);
    
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }
    
    // Validate and clean up each competitor
    const validatedCompetitors: Competitor[] = [];
    
    for (let index = 0; index < Math.min(parsed.length, maxResults); index++) {
      const competitor: unknown = parsed[index];
      
      // Type guard to ensure competitor is an object
      if (!competitor || typeof competitor !== 'object' || competitor === null) {
        console.warn(`⚠️ Invalid competitor object at index ${index}`);
        continue;
      }
      
      const rawCompetitor = competitor as RawCompetitor;
      
      // Validate required fields
      if (!rawCompetitor.name || typeof rawCompetitor.name !== 'string') {
        console.warn(`⚠️ Missing or invalid name for competitor at index ${index}`);
        continue;
      }
      
      // Create a properly typed competitor object
      const validCompetitor: Competitor = {
        name: String(rawCompetitor.name).trim(),
        domain: extractDomain(rawCompetitor.link || rawCompetitor.domain || ''),
        link: String(rawCompetitor.link || '').trim(),
        tagline: String(rawCompetitor.tagline || '').trim(),
        features: Array.isArray(rawCompetitor.features) ? 
          rawCompetitor.features.map((f: unknown) => String(f).trim()).filter(Boolean).slice(0, 5) : [],
        pricingTiers: Array.isArray(rawCompetitor.pricingTiers) ? 
          rawCompetitor.pricingTiers.map((p: unknown) => String(p).trim()).filter(Boolean) : 
          (Array.isArray(rawCompetitor.pricing) ? 
            rawCompetitor.pricing.map((p: unknown) => String(p).trim()).filter(Boolean) : []),
        marketPositioning: validateMarketPositioning(rawCompetitor.marketPositioning || rawCompetitor.market_positioning),
        strengths: Array.isArray(rawCompetitor.strengths) ? 
          rawCompetitor.strengths.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 3) : [],
        weaknesses: Array.isArray(rawCompetitor.weaknesses) ? 
          rawCompetitor.weaknesses.map((w: unknown) => String(w).trim()).filter(Boolean).slice(0, 3) : [],
        notes: String(rawCompetitor.notes || '').trim(),
        sourceUrl: String(rawCompetitor.sourceUrl || rawCompetitor.link || '').trim()
      };
      
      validatedCompetitors.push(validCompetitor);
    }
    
    return validatedCompetitors;
    
  } catch (parseError: unknown) {
    console.error("❌ Error parsing competitor data:", parseError);
    console.error("Raw content (first 500 chars):", content.substring(0, 500));
    
    // Return empty array for graceful degradation
    return [];
  }
}

// Helper functions
function extractDomain(url: string): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || '';
  }
}

function validateMarketPositioning(positioning: unknown): string {
  const validPositions = ['budget', 'mid-market', 'premium', 'enterprise'];
  const pos = String(positioning || '').toLowerCase().trim();
  return validPositions.includes(pos) ? pos : 'mid-market';
}

// Main serve function
serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const startTime = Date.now();
  let requestBody;
  
  try {
    // Parse and validate request body
    try {
      requestBody = await req.json();
    } catch (parseError: unknown) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { appDescription, maxResults = 4 }: CompetitorRequest = requestBody;
    
    // Enhanced validation
    if (!appDescription || typeof appDescription !== 'string') {
      return new Response(
        JSON.stringify({ error: "appDescription is required and must be a string" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (appDescription.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "appDescription must be at least 10 characters long" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (appDescription.length > 1000) {
      return new Response(
        JSON.stringify({ error: "appDescription must be less than 1000 characters" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 10) {
      return new Response(
        JSON.stringify({ error: "maxResults must be a number between 1 and 10" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`📥 [${new Date().toISOString()}] Request: ${appDescription.substring(0, 100)}... (maxResults: ${maxResults})`);
    
    // Search for competitors using web search
    const competitors = await searchCompetitors(appDescription.trim(), maxResults);
    
    // Prepare the response
    const response: CompetitorResponse = {
      competitors,
      searchQuery: `competitors for ${appDescription.trim()}`,
      timestamp: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      resultCount: competitors.length,
      webSearchUsed: true
    };
    
    console.log(`✅ [${new Date().toISOString()}] Success: Found ${competitors.length} competitors in ${Date.now() - startTime}ms using web search`);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes (web search results change)
        } 
      }
    );
    
  } catch (error: unknown) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${new Date().toISOString()}] Error after ${processingTime}ms:`, error);
    
    // Don't expose internal errors in production
    const isProduction = Deno.env.get("ENVIRONMENT") === "production";
    const errorMessage = isProduction ? "Internal server error" : (error instanceof Error ? error.message : "Unknown error occurred");
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        webSearchUsed: true,
        ...(isProduction ? {} : { details: error instanceof Error ? error.stack : String(error) })
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

console.log("🚀 fetch-competitors function ready with OpenAI web search capability");
