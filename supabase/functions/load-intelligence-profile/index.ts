import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface IntelligenceProfileResponse {
  id: string
  userId: string
  // Business Context
  businessModel: string[]
  industrySector: string[]
  stageOfGrowth: string | null
  strategicHorizon: string | null
  primaryStrategicGoals: string[]
  // Market Focus
  targetGeographies: string[]
  marketType: string | null
  marketInsightsPriority: string[]
  preferredSources: string[]
  // Competitor Focus
  directCompetitors: string[]
  watchCategories: string[]
  businessModelMatch: string | null
  competitiveIntensity: string | null
  // Trends
  designTrends: string[]
  behaviouralTrends: string[]
  contentMediaTrends: string[]
  relevantTimeframe: string | null
  // Technology Signals
  techCategories: string[]
  specificTechnologies: string[]
  adoptionStrategy: string | null
  techStackBias: string[]
  // Stakeholder Alignment
  internalStakeholders: string[]
  strategicThemes: string[]
  governancePriority: string | null
  // Consumer Insights
  feedbackChannels: string[]
  topUserFrictions: string[]
  personasOfInterest: string[]
  behaviourTriggers: string[]
  // Risk
  riskTypes: string[]
  complianceFrameworks: string[]
  jurisdictionalFocus: string[]
  riskAppetite: string | null
  // Opportunities
  opportunityCategories: string[]
  innovationAppetite: string | null
  linkedProblems: string[]
  // Timestamps
  createdAt: string
  updatedAt: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with anon key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization header',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    // Create client with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid authentication token',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    // Load the user's global intelligence profile (RLS handles filtering)
    const { data: profile, error: profileError } = await supabase
      .from('intelligence_profiles')
      .select('*')
      .eq('userId', user.id)
      .single()

    // If no profile exists, return a default empty profile structure
    if (profileError?.code === 'PGRST116' || !profile) {
      const defaultProfile: Partial<IntelligenceProfileResponse> = {
        userId: user.id,
        // Business Context
        businessModel: [],
        industrySector: [],
        stageOfGrowth: null,
        strategicHorizon: null,
        primaryStrategicGoals: [],
        // Market Focus
        targetGeographies: [],
        marketType: null,
        marketInsightsPriority: [],
        preferredSources: [],
        // Competitor Focus
        directCompetitors: [],
        watchCategories: [],
        businessModelMatch: null,
        competitiveIntensity: null,
        // Trends
        designTrends: [],
        behaviouralTrends: [],
        contentMediaTrends: [],
        relevantTimeframe: null,
        // Technology Signals
        techCategories: [],
        specificTechnologies: [],
        adoptionStrategy: null,
        techStackBias: [],
        // Stakeholder Alignment
        internalStakeholders: [],
        strategicThemes: [],
        governancePriority: null,
        // Consumer Insights
        feedbackChannels: [],
        topUserFrictions: [],
        personasOfInterest: [],
        behaviourTriggers: [],
        // Risk
        riskTypes: [],
        complianceFrameworks: [],
        jurisdictionalFocus: [],
        riskAppetite: null,
        // Opportunities
        opportunityCategories: [],
        innovationAppetite: null,
        linkedProblems: []
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: defaultProfile,
          exists: false,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      )
    }

    // Handle other profile errors
    if (profileError) {
      throw profileError
    }

    // Return the existing profile
    return new Response(
      JSON.stringify({
        success: true,
        data: profile,
        exists: true,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error loading intelligence profile:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
