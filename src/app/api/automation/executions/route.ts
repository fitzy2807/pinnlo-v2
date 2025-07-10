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
    const ruleId = searchParams.get('rule_id')
    const limit = searchParams.get('limit')
    const status = searchParams.get('status')

    let query = supabase
      .from('ai_automation_executions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false })

    if (ruleId) {
      query = query.eq('rule_id', ruleId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Calculate aggregated stats
    const stats = {
      total: data?.length || 0,
      completed: data?.filter(e => e.status === 'completed').length || 0,
      failed: data?.filter(e => e.status === 'failed').length || 0,
      running: data?.filter(e => e.status === 'running').length || 0,
      totalCardsCreated: data?.reduce((sum, e) => sum + (e.cards_created || 0), 0) || 0,
      totalTokensUsed: data?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0,
      totalCost: data?.reduce((sum, e) => sum + (e.cost_incurred || 0), 0) || 0
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      stats 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}