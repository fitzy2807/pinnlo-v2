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

    const { tool, arguments: args } = await request.json()

    // For automation, enrich with user context
    if (tool === 'generate_automation_intelligence' && !args.userId) {
      args.userId = session.user.id
    }

    // Call MCP server
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: tool,
          arguments: args
        },
        id: Date.now()
      })
    })

    const mcpResult = await mcpResponse.json()

    if (mcpResult.error) {
      return NextResponse.json(
        { success: false, error: mcpResult.error.message || 'MCP error' },
        { status: 500 }
      )
    }

    // Parse the result
    if (mcpResult.result?.content?.[0]?.text) {
      try {
        const resultData = JSON.parse(mcpResult.result.content[0].text)
        return NextResponse.json({ success: true, ...resultData })
      } catch (e) {
        // If not JSON, return as is
        return NextResponse.json({ 
          success: true, 
          result: mcpResult.result.content[0].text 
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      result: mcpResult.result 
    })
  } catch (error) {
    console.error('MCP invoke error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}