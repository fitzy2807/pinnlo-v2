import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { systemPrompt, userPrompt } = await request.json()

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { success: false, error: 'Missing prompts' },
        { status: 400 }
      )
    }

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      return NextResponse.json(
        { success: false, error: `OpenAI API error: ${errorText}` },
        { status: 500 }
      )
    }

    const openaiResult = await openaiResponse.json()
    const content = openaiResult.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No content in AI response' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    const parsed = JSON.parse(content)
    
    // Return the cards
    let cards = []
    if (Array.isArray(parsed)) {
      cards = parsed
    } else if (parsed.cards && Array.isArray(parsed.cards)) {
      cards = parsed.cards
    } else {
      cards = [parsed]
    }

    return NextResponse.json({ 
      success: true, 
      cards,
      usage: openaiResult.usage
    })
  } catch (error) {
    console.error('Card generation error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}