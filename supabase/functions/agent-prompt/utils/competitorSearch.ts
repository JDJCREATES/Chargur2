/**
 * competitorSearch.ts
 * 
 * Utility function to fetch competitors from the fetch-competitors Edge Function.
 */

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

/**
 * Fetch competitors from the fetch-competitors Edge Function
 */
export async function fetchCompetitors(
  appDescription: string,
  maxResults: number = 3
): Promise<CompetitorResponse> {
  console.log(`🔍 Fetching competitors for: "${appDescription.substring(0, 100)}..."`);
  
  try {
    // Get Supabase URL from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }
    
    // Get service role key for internal function-to-function calls
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }
    
    // Call the fetch-competitors Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/fetch-competitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        appDescription: appDescription.trim(),
        maxResults
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`fetch-competitors API error: ${response.status} - ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Received ${data.competitors?.length || 0} competitors from fetch-competitors`);
    
    return data;
  } catch (error) {
    console.error('❌ Error in fetchCompetitors:', error);
    throw error;
  }
}