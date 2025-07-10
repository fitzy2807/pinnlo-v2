import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies())
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify group ownership
    const { data: group } = await supabase
      .from('intelligence_groups')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get cards in the group
    const { data: cards, error } = await supabase
      .from('intelligence_group_cards')
      .select(`
        position,
        added_at,
        intelligence_cards (*)
      `)
      .eq('group_id', params.id)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching group cards:', error)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: cards })
  } catch (error) {
    console.error('Group cards GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies())
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardIds } = await request.json()
    
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json({ error: 'Card IDs array required' }, { status: 400 })
    }

    // Verify group ownership
    const { data: group } = await supabase
      .from('intelligence_groups')
      .select('id, card_count')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get current max position
    const { data: maxPositionData } = await supabase
      .from('intelligence_group_cards')
      .select('position')
      .eq('group_id', params.id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const startPosition = (maxPositionData?.position || 0) + 1

    // Prepare insert data
    const insertData = cardIds.map((cardId, index) => ({
      group_id: params.id,
      intelligence_card_id: cardId,
      added_by: user.id,
      position: startPosition + index
    }))

    // Insert cards (duplicates will be ignored due to unique constraint)
    const { data: inserted, error } = await supabase
      .from('intelligence_group_cards')
      .insert(insertData)
      .select()

    if (error && !error.message.includes('duplicate')) {
      console.error('Error adding cards to group:', error)
      return NextResponse.json({ error: 'Failed to add cards' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: { added: inserted?.length || 0 } 
    })
  } catch (error) {
    console.error('Group cards POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}