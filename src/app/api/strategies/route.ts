import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { strategyData } = body

    // Get the authenticated user from the client session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Use admin client to create strategy (bypasses RLS)
    const { data, error: createError } = await supabaseAdmin
      .from('strategies')
      .insert({
        userId: user.id,
        created_by: user.id,
        title: strategyData.title || 'Untitled Strategy',
        client: strategyData.client || '',
        description: strategyData.description || '',
        status: strategyData.status || 'draft',
        progress: strategyData.progress || 0,
        
        // JSONB fields with defaults
        vision: strategyData.vision || {},
        okrs: strategyData.okrs || {},
        problems: strategyData.problems || {},
        initiatives: strategyData.initiatives || {},
        personas: strategyData.personas || {},
        epics: strategyData.epics || {},
        customerExperience: strategyData.customerExperience || {},
        experienceSections: strategyData.experienceSections || {},
        userJourneys: strategyData.userJourneys || {},
        features: strategyData.features || {},
        roadmap: strategyData.roadmap || {},
        techRequirements: strategyData.techRequirements || {},
        techStack: strategyData.techStack || {},
        team: strategyData.team || {},
        cost: strategyData.cost || {},
        deliveryPlan: strategyData.deliveryPlan || {},
        strategicContext: strategyData.strategicContext || {},
        valuePropositions: strategyData.valuePropositions || {},
        workstreams: strategyData.workstreams || {},
        technicalStacks: strategyData.technicalStacks || {},
        organisationalCapabilities: strategyData.organisationalCapabilities || {},
        gtmPlays: strategyData.gtmPlays || {},
        serviceBlueprints: strategyData.serviceBlueprints || {},
        ideasBank: strategyData.ideasBank || {},
        blueprintConfiguration: strategyData.blueprintConfiguration || {},
      })
      .select()
      .single()

    if (createError) {
      console.error('Strategy creation error:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}