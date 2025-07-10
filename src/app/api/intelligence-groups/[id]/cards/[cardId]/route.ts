import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; cardId: string } }
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

    // Remove card from group
    const { error } = await supabase
      .from('intelligence_group_cards')
      .delete()
      .eq('group_id', params.id)
      .eq('intelligence_card_id', params.cardId)

    if (error) {
      console.error('Error removing card from group:', error)
      return NextResponse.json({ error: 'Failed to remove card' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Group card DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}