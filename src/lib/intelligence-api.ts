import { supabase } from '@/lib/supabase'

export interface IntelligenceProfileData {
  // Business Context
  businessModel: string[]
  industrySector: string[]
  stageOfGrowth: string
  strategicHorizon: string
  primaryStrategicGoals: string[]
  // Market Focus
  targetGeographies: string[]
  marketType: string
  marketInsightsPriority: string[]
  preferredSources: string[]
  // Competitor Focus
  directCompetitors: string[]
  watchCategories: string[]
  businessModelMatch: string
  competitiveIntensity: string
  // Trends
  designTrends: string[]
  behaviouralTrends: string[]
  contentMediaTrends: string[]
  relevantTimeframe: string
  // Technology Signals
  techCategories: string[]
  specificTechnologies: string[]
  adoptionStrategy: string
  techStackBias: string[]
  // Stakeholder Alignment
  internalStakeholders: string[]
  strategicThemes: string[]
  governancePriority: string
  // Consumer Insights
  feedbackChannels: string[]
  topUserFrictions: string[]
  personasOfInterest: string[]
  behaviourTriggers: string[]
  // Risk
  riskTypes: string[]
  complianceFrameworks: string[]
  jurisdictionalFocus: string[]
  riskAppetite: string
  // Opportunities
  opportunityCategories: string[]
  innovationAppetite: string
  linkedProblems: string[]
}

export interface SaveIntelligenceProfileResponse {
  success: boolean
  data?: IntelligenceProfileData & {
    id: string
    userId: string
    createdAt: string
    updatedAt: string
  }
  error?: string
  timestamp: string
}

export interface LoadIntelligenceProfileResponse {
  success: boolean
  data?: Partial<IntelligenceProfileData> & {
    userId: string
  }
  exists: boolean
  error?: string
  timestamp: string
}

// Complete save function - now works with all fields
export async function saveIntelligenceProfile(
  profileData: Partial<IntelligenceProfileData>
): Promise<SaveIntelligenceProfileResponse> {
  try {
    console.log('Saving complete profile data:', profileData)
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    // Prepare the data for insertion/update using all available fields
    const dbData: any = {
      userId: session.user.id,
      updatedAt: new Date().toISOString()
    }

    // Include ALL fields from the database schema
    const allFields = [
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

    for (const field of allFields) {
      if (profileData[field] !== undefined) {
        dbData[field] = profileData[field]
      }
    }

    console.log('Prepared complete DB data:', dbData)

    // Check if profile exists for this user
    const { data: existingProfile } = await supabase
      .from('intelligence_profiles')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    let result
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('intelligence_profiles')
        .update(dbData)
        .eq('id', existingProfile.id)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        throw error
      }
      result = data
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('intelligence_profiles')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }
      result = data
    }

    console.log('Save successful with all fields:', result)

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error saving intelligence profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save intelligence profile',
      timestamp: new Date().toISOString()
    }
  }
}

// Complete load function
export async function loadIntelligenceProfile(): Promise<LoadIntelligenceProfileResponse> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    // Load the user's global intelligence profile
    const { data: profile, error: profileError } = await supabase
      .from('intelligence_profiles')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    // If no profile exists, return default empty structure
    if (profileError?.code === 'PGRST116' || !profile) {
      const defaultProfile = {
        userId: session.user.id,
        // Business Context
        businessModel: [],
        industrySector: [],
        stageOfGrowth: '',
        strategicHorizon: '',
        primaryStrategicGoals: [],
        // Market Focus
        targetGeographies: [],
        marketType: '',
        marketInsightsPriority: [],
        preferredSources: [],
        // Competitor Focus
        directCompetitors: [],
        watchCategories: [],
        businessModelMatch: '',
        competitiveIntensity: '',
        // Trends
        designTrends: [],
        behaviouralTrends: [],
        contentMediaTrends: [],
        relevantTimeframe: '',
        // Technology Signals
        techCategories: [],
        specificTechnologies: [],
        adoptionStrategy: '',
        techStackBias: [],
        // Stakeholder Alignment
        internalStakeholders: [],
        strategicThemes: [],
        governancePriority: '',
        // Consumer Insights
        feedbackChannels: [],
        topUserFrictions: [],
        personasOfInterest: [],
        behaviourTriggers: [],
        // Risk
        riskTypes: [],
        complianceFrameworks: [],
        jurisdictionalFocus: [],
        riskAppetite: '',
        // Opportunities
        opportunityCategories: [],
        innovationAppetite: '',
        linkedProblems: []
      }

      return {
        success: true,
        data: defaultProfile,
        exists: false,
        timestamp: new Date().toISOString()
      }
    }

    // Handle other errors
    if (profileError) {
      console.error('Profile load error:', profileError)
      throw profileError
    }

    console.log('Complete profile loaded successfully:', profile)

    return {
      success: true,
      data: profile,
      exists: true,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error loading intelligence profile:', error)
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to load intelligence profile',
      timestamp: new Date().toISOString()
    }
  }
}
