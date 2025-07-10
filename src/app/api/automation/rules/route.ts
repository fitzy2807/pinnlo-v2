import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const automationOnly = searchParams.get('automation_enabled') === 'true'

    let query = supabase
      .from('ai_generation_rules')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })

    if (automationOnly) {
      query = query.eq('automation_enabled', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Ensure user_id is set to the authenticated user
    const ruleData = {
      ...body,
      user_id: session.user.id,
      created_by_user_id: session.user.id
    }

    const { data, error } = await supabase
      .from('ai_generation_rules')
      .insert(ruleData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // If automation is enabled, set initial next_run_at
    if (data.automation_enabled && !data.next_run_at) {
      const nextRun = calculateNextRun(data.schedule_frequency)
      await supabase
        .from('ai_generation_rules')
        .update({ next_run_at: nextRun })
        .eq('id', data.id)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function calculateNextRun(frequency: string): string {
  const now = new Date()
  switch (frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  }
}