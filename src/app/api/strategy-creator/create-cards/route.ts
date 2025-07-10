import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { cards, strategyId } = await request.json()
    
    const supabase = createServerComponentClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify strategy ownership
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('id')
      .eq('id', strategyId)
      .eq('user_id', user.id)
      .single()

    if (strategyError || !strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
    }

    // Transform cards for database insertion
    const cardsToInsert = cards.map((card: any) => ({
      strategy_id: strategyId,
      user_id: user.id,
      card_type: card.cardType,
      title: card.title,
      description: card.description,
      priority: card.priority || 'medium',
      tags: card.tags || [],
      confidence: card.confidence || { level: 'medium', rationale: 'AI-generated' },
      relationships: [],
      blueprint_fields: card.blueprintFields || {},
      metadata: {
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
        keyPoints: card.keyPoints || []
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

    return NextResponse.json({ 
      success: true, 
      cards: insertedCards,
      count: insertedCards.length 
    })
  } catch (error: any) {
    console.error('Error creating cards:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create cards' },
      { status: 500 }
    )
  }
}