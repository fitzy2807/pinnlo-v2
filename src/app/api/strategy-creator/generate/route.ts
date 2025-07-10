import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { blueprintRegistry } from '@/components/blueprints/registry'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, contextSummary, targetBlueprint, generationOptions } = body

    if (!sessionId || !contextSummary || !targetBlueprint) {
      return NextResponse.json({ 
        error: 'Session ID, context summary, and target blueprint required' 
      }, { status: 400 })
    }

    const supabase = createClient(cookies())
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify session ownership and get strategy ID
    const { data: session, error: sessionError } = await supabase
      .from('strategy_creator_sessions')
      .select('strategy_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get existing cards to avoid duplication
    const { data: existingCards } = await supabase
      .from('cards')
      .select('title, card_type')
      .eq('strategy_id', session.strategy_id)
      .eq('card_type', targetBlueprint)

    // Call MCP tool to generate strategy cards
    const mpcResponse = await fetch(`${process.env.MCP_SERVER_URL || 'http://localhost:3001'}/api/tools/generate_strategy_cards`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'}`
      },
      body: JSON.stringify({ 
        contextSummary,
        targetBlueprint,
        generationOptions,
        existingCards: existingCards || []
      })
    })

    if (!mpcResponse.ok) {
      throw new Error('Failed to generate strategy cards')
    }

    const mpcResult = await mpcResponse.json()
    const { prompts } = JSON.parse(mpcResult.content)

    // Call OpenAI to generate the actual cards
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
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('Failed to call OpenAI')
    }

    const openaiResult = await openaiResponse.json()
    const generatedContent = JSON.parse(openaiResult.choices[0].message.content)
    
    // Ensure we have an array of cards
    const cards = Array.isArray(generatedContent) ? generatedContent : generatedContent.cards || []

    // Transform cards to match our format
    const blueprint = blueprintRegistry[targetBlueprint]
    const transformedCards = cards.map((card: any, index: number) => {
      const prefix = blueprint?.idPrefix || targetBlueprint.toUpperCase().slice(0, 3)
      return {
        id: `${prefix}-${Date.now()}-${index}`,
        cardType: targetBlueprint,
        title: card.title,
        description: card.description,
        priority: card.priority || 'medium',
        confidence: card.confidence || { level: 'medium', rationale: 'AI-generated' },
        tags: card.tags || [],
        relationships: card.relationships || [],
        blueprintFields: card.blueprintFields || {},
        keyPoints: card.keyPoints || [],
        implementation: card.implementation || {},
        metadata: {
          aiGenerated: true,
          generatedAt: new Date().toISOString(),
          sessionId,
          generationStyle: generationOptions?.style || 'comprehensive'
        }
      }
    })

    // Update session with generated cards
    await supabase
      .from('strategy_creator_sessions')
      .update({ 
        generated_cards: transformedCards,
        target_blueprint_id: targetBlueprint,
        generation_options: generationOptions,
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
        action_type: 'cards_generated',
        action_data: {
          targetBlueprint,
          cardsGenerated: transformedCards.length,
          generationOptions
        }
      })

    return NextResponse.json({ 
      cards: transformedCards,
      metadata: {
        blueprint: targetBlueprint,
        count: transformedCards.length,
        style: generationOptions?.style || 'comprehensive'
      }
    })
  } catch (error: any) {
    console.error('Card generation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to generate cards' 
    }, { status: 500 })
  }
}