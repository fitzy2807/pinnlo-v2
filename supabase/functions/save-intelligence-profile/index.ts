import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface IntelligenceProfileData {
  // Business Context
  businessModel?: string[]
  industrySector?: string[]
  stageOfGrowth?: string
  strategicHorizon?: string
  primaryStrategicGoals?: string[]
  // Market Focus
  targetGeographies?: string[]
  marketType?: string
  marketInsightsPriority?: string[]
  preferredSources?: string[]
  // Competitor Focus
  directCompetitors?: string[]
  watchCategories?: string[]
  businessModelMatch?: string
  competitiveIntensity?: string
  // Trends
  designTrends?: string[]
  behaviouralTrends?: string[]
  contentMediaTrends?: string[]
  relevantTimeframe?: string
  // Technology Signals
  techCategories?: string[]
  specificTechnologies?: string[]
  adoptionStrategy?: string
  techStackBias?: string[]
  // Stakeholder Alignment
  internalStakeholders?: string[]
  strategicThemes?: string[]
  governancePriority?: string
  // Consumer Insights
  feedbackChannels?: string[]
  topUserFrictions?: string[]
  personasOfInterest?: string[]
  behaviourTriggers?: string[]
  // Risk
  riskTypes?: string[]
  complianceFrameworks?: string[]
  jurisdictionalFocus?: string[]
  riskAppetite?: string
  // Opportunities
  opportunityCategories?: string[]
  innovationAppetite?: string
  linkedProblems?: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with anon key and user's JWT
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

    // Parse request body
    const requestData: IntelligenceProfileData = await req.json()

    // Prepare profile data (RLS will handle user filtering)
    const profileData: any = {
      userId: user.id,
      updatedAt: new Date().toISOString()
    }

    // Add all optional fields
    const optionalFields = [
      'businessModel', 'industrySector', 'stageOfGrowth', 'strategicHorizon', 'primaryStrategicGoals',
      'targetGeographies', 'marketType', 'marketInsightsPriority', 'preferredSources',
      'directCompetitors', 'watchCategories', 'businessModelMatch', 'competitiveIntensity',
      'designTrends', 'behaviouralTrends', 'contentMediaTrends', 'relevantTimeframe',
      'techCategories', 'specificTechnologies', 'adoptionStrategy', 'techStackBias',
      'internalStakeholders', 'strategicThemes', 'governancePriority',
      'feedbackChannels', 'topUserFrictions', 'personasOfInterest', 'behaviourTriggers',
      'riskTypes', 'complianceFrameworks', 'jurisdictionalFocus', 'riskAppetite',
      'opportunityCategories', 'innovationAppetite', 'linkedProblems'
    ]

    for (const field of optionalFields) {
      if (requestData[field] !== undefined) {
        profileData[field] = requestData[field]
      }
    }

    // Check if profile exists for this user (RLS will filter by user)
    const { data: existingProfile } = await supabase
      .from('intelligence_profiles')
      .select('id')
      .eq('userId', user.id)
      .single()

    let result
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('intelligence_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('intelligence_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
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
    console.error('Error saving intelligence profile:', error)
    
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
