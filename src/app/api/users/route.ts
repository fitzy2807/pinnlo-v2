import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json()
    
    // Create a Supabase client with the request cookies
    const supabase = createClient(cookies())
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized - No valid user' },
        { status: 401 }
      )
    }
    
    // Verify the user ID matches
    if (userData.id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Can only update own record' },
        { status: 403 }
      )
    }
    
    // Use admin client to create/update user record
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userData.id,
        email: userData.email || user.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profileImageUrl: userData.profileImageUrl || '',
        updatedAt: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error upserting user record:', error)
      return NextResponse.json(
        { error: 'Failed to update user record', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('Exception in user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Add GET endpoint to fetch current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch user record from database
    const { data: userRecord, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user: userRecord })
    
  } catch (error) {
    console.error('Exception in user GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}