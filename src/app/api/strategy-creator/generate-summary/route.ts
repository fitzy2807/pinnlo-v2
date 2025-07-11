import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { blueprintCards, intelligenceCards, intelligenceGroups, strategyName } = await request.json()

    // Call MCP tool to generate context summary prompts
    const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/mcp/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'generate_context_summary',
        arguments: {
          blueprintCards,
          intelligenceCards,
          intelligenceGroups,
          strategyName
        }
      })
    })

    if (!mcpResponse.ok) {
      throw new Error('Failed to get MCP prompts')
    }

    const mcpResult = await mcpResponse.json()
    
    if (!mcpResult.success || !mcpResult.prompts) {
      throw new Error('Invalid MCP response format')
    }

    // Call OpenAI to generate the actual summary
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: mcpResult.prompts.system },
          { role: 'user', content: mcpResult.prompts.user }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const openaiResult = await openaiResponse.json()
    const summary = openaiResult.choices[0].message.content

    return NextResponse.json({ 
      success: true,
      summary,
      metadata: {
        blueprintCardCount: blueprintCards.length,
        intelligenceCardCount: intelligenceCards.length,
        intelligenceGroupCount: intelligenceGroups.length,
        strategyName
      }
    })
  } catch (error: any) {
    console.error('Error generating context summary:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate context summary' 
      },
      { status: 500 }
    )
  }
}