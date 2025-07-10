import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json()

    // Call MCP tool to generate summary
    const response = await fetch('http://localhost:3001/api/tools/generate_context_summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    })

    if (!response.ok) {
      throw new Error('Failed to generate summary')
    }

    const result = await response.json()
    
    // Extract prompts from MCP response
    const { prompts } = JSON.parse(result.content)

    // Call OpenAI to generate the actual summary
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
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('Failed to call OpenAI')
    }

    const openaiResult = await openaiResponse.json()
    const summary = openaiResult.choices[0].message.content

    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}