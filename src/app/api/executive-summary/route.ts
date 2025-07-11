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

    // Call MCP server to generate executive summary prompts
    const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/mcp/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'generate_executive_summary',
        arguments: {
          cards,
          blueprint_type: blueprintId
        }
      })
    })

    if (!mcpResponse.ok) {
      throw new Error('Failed to get MCP prompts')
    }

    const mcpResult = await mcpResponse.json()
    
    if (!mcpResult.success || !mcpResult.prompts) {
      throw new Error('Invalid MCP response format')
    }

    // Call OpenAI to generate the actual summary
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: mcpResult.prompts.system },
          { role: 'user', content: mcpResult.prompts.user }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const openaiResult = await openaiResponse.json()
    let summaryData = { themes: [], implications: [], nextSteps: [], summary: '' }
    
    try {
      const parsedContent = JSON.parse(openaiResult.choices[0].message.content)
      summaryData = {
        themes: parsedContent.themes || [],
        implications: parsedContent.implications || [],
        nextSteps: parsedContent.nextSteps || [],
        summary: parsedContent.summary || ''
      }
    } catch (e) {
      console.error('Failed to parse OpenAI result:', e)
      // Fallback to raw content
      summaryData.summary = openaiResult.choices[0].message.content
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
      nextSteps: summaryData.nextSteps || [],
      summary: summaryData.summary || '',
      metadata: mcpResult.metadata || {}
    })
  } catch (error) {
    console.error('Executive summary error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}