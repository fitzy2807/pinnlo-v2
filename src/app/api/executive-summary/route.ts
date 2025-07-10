import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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
    const { strategyId, blueprintId, cards, regenerate } = body

    // Call MCP server to generate executive summary
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'generate_executive_summary',
          arguments: {
            cards,
            blueprint_type: blueprintId
          }
        },
        id: Date.now()
      })
    })

    const mcpResult = await mcpResponse.json()

    if (mcpResult.error) {
      return NextResponse.json(
        { success: false, error: mcpResult.error.message || 'MCP error' },
        { status: 500 }
      )
    }

    // Parse the result
    let summaryData = { themes: [], implications: [] }
    if (mcpResult.result?.content?.[0]?.text) {
      try {
        summaryData = JSON.parse(mcpResult.result.content[0].text)
      } catch (e) {
        console.error('Failed to parse MCP result:', e)
      }
    }

    // Save to database if regenerate is true
    if (regenerate && summaryData.themes.length > 0) {
      const { error: upsertError } = await supabase
        .from('executive_summaries')
        .upsert({
          strategy_id: strategyId,
          blueprint_id: blueprintId,
          user_id: session.user.id,
          summary_data: summaryData,
          cards_count: cards.length,
          generated_at: new Date().toISOString()
        }, {
          onConflict: 'strategy_id,blueprint_id,user_id'
        })

      if (upsertError) {
        console.error('Failed to save summary:', upsertError)
      }
    }

    return NextResponse.json({
      success: true,
      themes: summaryData.themes || [],
      implications: summaryData.implications || [],
      summary: summaryData.summary || ''
    })
  } catch (error) {
    console.error('Executive summary error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}