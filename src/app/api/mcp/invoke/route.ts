import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tool, arguments: args } = await request.json()

    // For automation, enrich with user context
    if (tool === 'generate_automation_intelligence' && !args.userId) {
      args.userId = user.id
    }

    // Call MCP server
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/api/mcp/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        tool,
        arguments: args
      })
    })

    const mcpResult = await mcpResponse.json()

    if (!mcpResponse.ok) {
      return NextResponse.json(
        { success: false, error: mcpResult.error || 'MCP server error' },
        { status: 500 }
      )
    }

    // The HTTP MCP server returns results directly
    return NextResponse.json({ success: true, ...mcpResult })
  } catch (error) {
    console.error('MCP invoke error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}