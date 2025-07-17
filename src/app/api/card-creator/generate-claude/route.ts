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

    const { systemPrompt, userPrompt, isPreview } = await request.json()

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { success: false, error: 'Missing prompts' },
        { status: 400 }
      )
    }

    // Call Claude
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ],
        temperature: 0.7,
        max_tokens: isPreview ? 500 : 4000
      })
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API error:', errorText)
      return NextResponse.json(
        { success: false, error: `Claude API error: ${errorText}` },
        { status: 500 }
      )
    }

    const claudeResult = await claudeResponse.json()
    const content = claudeResult.content[0]?.text

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No content in AI response' },
        { status: 500 }
      )
    }

    // For preview requests, return the text directly
    if (isPreview) {
      return NextResponse.json({
        success: true,
        preview: content,
        text: content,
        usage: claudeResult.usage
      })
    }

    // Parse the JSON response for card generation
    console.log('🤖 Claude raw response:', content.substring(0, 500))
    
    let parsed;
    try {
      parsed = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON response from Claude' },
        { status: 500 }
      )
    }
    
    console.log('📦 Parsed response structure:', Object.keys(parsed))
    
    // Return the cards
    let cards = []
    if (Array.isArray(parsed)) {
      cards = parsed
      console.log('✅ Response is an array with', cards.length, 'cards')
    } else if (parsed.cards && Array.isArray(parsed.cards)) {
      cards = parsed.cards
      console.log('✅ Response has cards array with', cards.length, 'cards')
    } else {
      // Check for other common response formats
      const possibleArrayKeys = Object.keys(parsed).filter(key => 
        key.toLowerCase().includes('card') || key.toLowerCase().includes('proposition')
      )
      
      console.log('🔍 Checking possible keys:', possibleArrayKeys)
      
      // Look for arrays in these keys
      for (const key of possibleArrayKeys) {
        if (Array.isArray(parsed[key])) {
          cards = parsed[key]
          console.log('✅ Found cards array in key:', key, 'with', cards.length, 'cards')
          break
        }
      }
      
      // If still no cards found, check if it's a single card
      if (cards.length === 0) {
        cards = [parsed]
        console.log('⚠️ Response is a single object, wrapping in array')
      }
    }

    console.log('📊 Final card count:', cards.length)
    
    // Log first card structure for debugging
    if (cards.length > 0) {
      console.log('🔍 First card structure:', JSON.stringify(cards[0], null, 2).substring(0, 300))
    }

    return NextResponse.json({ 
      success: true, 
      cards,
      usage: claudeResult.usage,
      debug: {
        requestedCount: userPrompt.match(/exactly (\d+)/)?.[1],
        actualCount: cards.length
      }
    })
  } catch (error) {
    console.error('Claude card generation error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}