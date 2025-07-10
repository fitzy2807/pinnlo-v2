import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, blueprintCards, intelligenceCards, intelligenceGroups, strategyName } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const supabase = createClient(cookies())
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('strategy_creator_sessions')
      .select('strategy_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Call MCP tool to generate context summary
    const mpcResponse = await fetch(`${process.env.MCP_SERVER_URL || 'http://localhost:3001'}/api/tools/generate_context_summary`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'}`
      },
      body: JSON.stringify({ 
        blueprintCards,
        intelligenceCards,
        intelligenceGroups: intelligenceGroups || [],
        strategyName
      })
    })

    if (!mpcResponse.ok) {
      throw new Error('Failed to generate context summary')
    }

    const mpcResult = await mpcResponse.json()
    const { prompts } = JSON.parse(mpcResult.content)

    // Call OpenAI to generate the actual summary
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompts.system },
          { role: 'user', content: prompts.user }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('Failed to call OpenAI')
    }

    const openaiResult = await openaiResponse.json()
    const contextSummary = openaiResult.choices[0].message.content

    // Update session with context summary
    await supabase
      .from('strategy_creator_sessions')
      .update({ 
        context_summary: contextSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    // Log to history
    await supabase
      .from('strategy_creator_history')
      .insert({
        user_id: user.id,
        strategy_id: session.strategy_id,
        session_id: sessionId,
        action_type: 'context_generated',
        action_data: {
          blueprintCardsCount: blueprintCards.length,
          intelligenceCardsCount: intelligenceCards.length,
          intelligenceGroupsCount: (intelligenceGroups || []).length,
          summaryLength: contextSummary.length
        }
      })

    return NextResponse.json({ 
      contextSummary,
      metadata: {
        blueprintCardsUsed: blueprintCards.length,
        intelligenceCardsUsed: intelligenceCards.length,
        intelligenceGroupsUsed: (intelligenceGroups || []).length,
        wordCount: contextSummary.split(/\s+/).length
      }
    })
  } catch (error: any) {
    console.error('Context generation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to generate context' 
    }, { status: 500 })
  }
}