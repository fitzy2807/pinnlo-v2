import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CreateIntelligenceGroupData } from '@/types/intelligence-groups'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: groups, error } = await supabase
      .from('intelligence_groups')
      .select('*')
      .eq('user_id', user.id)
      .order('last_used_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching intelligence groups:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: groups })
  } catch (error) {
    console.error('Intelligence groups GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateIntelligenceGroupData = await request.json()
    
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    const groupData = {
      user_id: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      color: body.color || '#3B82F6'
    }

    const { data: group, error } = await supabase
      .from('intelligence_groups')
      .insert(groupData)
      .select()
      .single()

    if (error) {
      console.error('Error creating intelligence group:', error)
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    console.error('Intelligence groups POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}