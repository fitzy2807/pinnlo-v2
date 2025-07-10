import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, selectedCards } = body

    if (!sessionId || !selectedCards || !Array.isArray(selectedCards)) {
      return NextResponse.json({ 
        error: 'Session ID and selected cards array required' 
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

    // Transform cards for database insertion
    const cardsToInsert = selectedCards.map((card: any) => ({
      strategy_id: session.strategy_id,
      user_id: user.id,
      card_type: card.cardType,
      title: card.title,
      description: card.description,
      priority: card.priority || 'medium',
      tags: card.tags || [],
      confidence: card.confidence || { level: 'medium', rationale: 'AI-generated' },
      relationships: card.relationships || [],
      blueprint_fields: card.blueprintFields || {},
      metadata: {
        ...card.metadata,
        committedAt: new Date().toISOString()
      }
    }))

    // Insert cards
    const { data: insertedCards, error: insertError } = await supabase
      .from('cards')
      .insert(cardsToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting cards:', insertError)
      return NextResponse.json({ error: 'Failed to create cards' }, { status: 500 })
    }

    // Log to history
    await supabase
      .from('strategy_creator_history')
      .insert({
        user_id: user.id,
        strategy_id: session.strategy_id,
        session_id: sessionId,
        action_type: 'cards_committed',
        action_data: {
          cardsCommitted: insertedCards.length,
          cardIds: insertedCards.map(c => c.id),
          cardTypes: [...new Set(insertedCards.map(c => c.card_type))]
        }
      })

    // Clear session after successful commit
    await supabase
      .from('strategy_creator_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id)

    return NextResponse.json({ 
      success: true,
      cards: insertedCards,
      count: insertedCards.length
    })
  } catch (error: any) {
    console.error('Card commit error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to commit cards' 
    }, { status: 500 })
  }
}