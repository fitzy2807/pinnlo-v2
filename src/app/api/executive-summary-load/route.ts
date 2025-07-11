import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const strategyId = searchParams.get('strategyId')
    const blueprintId = searchParams.get('blueprintId')

    if (!strategyId || !blueprintId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('executive_summaries')
      .select('*')
      .eq('strategy_id', strategyId)
      .eq('blueprint_type', blueprintId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (data) {
      return NextResponse.json({
        success: true,
        summary: {
          themes: data.metadata?.themes || [],
          implications: data.metadata?.implications || [],
          lastUpdated: data.generated_at,
          cardCount: data.word_count || 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      summary: null
    })
  } catch (error) {
    console.error('Executive summary load error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}