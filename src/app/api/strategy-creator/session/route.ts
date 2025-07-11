import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

// GET - Retrieve existing session or create new one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const strategyId = searchParams.get('strategyId')
    
    if (!strategyId) {
      return NextResponse.json({ error: 'Strategy ID required' }, { status: 400 })
    }

    const supabase = createClient(cookies())
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get existing session (removed expires_at check since column doesn't exist)
    const { data: session, error: sessionError } = await supabase
      .from('strategy_creator_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('strategy_id', strategyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError && sessionError.code !== 'PGRST116') { // Not found is ok
      console.error('Session fetch error:', sessionError)
      // If table doesn't exist, treat as no session found
      if (sessionError.code === '42P01') {
        console.log('Strategy creator sessions table does not exist - treating as no session')
        // Continue to create new session section
      } else {
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
      }
    }

    // If no session exists, create a new one
    if (!session) {
      const { data: newSession, error: createError } = await supabase
        .from('strategy_creator_sessions')
        .insert({
          user_id: user.id,
          strategy_id: strategyId,
          current_step: 1,
          completed_steps: [],
          selected_blueprint_cards: [],
          selected_intelligence_cards: [],
          generation_options: { count: 3, style: 'comprehensive' }
        })
        .select()
        .single()

      if (createError) {
        console.error('Session creation error:', createError)
        if (createError.code === '42P01') {
          return NextResponse.json({ 
            error: 'Database tables not set up. Please run migrations first.',
            setupRequired: true 
          }, { status: 503 })
        }
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
      }

      // Log session creation
      await supabase
        .from('strategy_creator_history')
        .insert({
          user_id: user.id,
          strategy_id: strategyId,
          session_id: newSession.id,
          action_type: 'session_start',
          action_data: { step: 1 }
        })

      return NextResponse.json({ session: newSession })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('Session GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strategyId, sessionData } = body

    if (!strategyId) {
      return NextResponse.json({ error: 'Strategy ID required' }, { status: 400 })
    }

    const supabase = createClient(cookies())
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create new session
    const { data: newSession, error: createError } = await supabase
      .from('strategy_creator_sessions')
      .insert({
        user_id: user.id,
        strategy_id: strategyId,
        current_step: 1,
        completed_steps: [],
        selected_blueprint_cards: [],
        selected_intelligence_cards: [],
        generation_options: { count: 3, style: 'comprehensive' },
        ...sessionData
      })
      .select()
      .single()

    if (createError) {
      console.error('Session creation error:', createError)
      if (createError.code === '42P01') {
        return NextResponse.json({ 
          error: 'Database tables not set up. Please run migrations first.',
          setupRequired: true 
        }, { status: 503 })
      }
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Log session creation
    await supabase
      .from('strategy_creator_history')
      .insert({
        user_id: user.id,
        strategy_id: strategyId,
        session_id: newSession.id,
        action_type: 'session_start',
        action_data: { step: 1 }
      })

    return NextResponse.json({ session: newSession })
  } catch (error: any) {
    console.error('Session POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, updates } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const supabase = createClient(cookies())
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update session
    const { data: session, error: updateError } = await supabase
      .from('strategy_creator_sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Session update error:', updateError)
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('Session PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}