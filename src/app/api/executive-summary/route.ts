import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  console.log('🔍 Executive Summary API called')
  
  try {
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔐 Session check:', session ? 'Found' : 'Missing')
    
    if (sessionError || !session) {
      console.log('❌ Auth error:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📄 Request body:', { 
      strategyId: body.strategyId, 
      blueprintType: body.blueprintType, 
      cardsCount: body.cards?.length 
    })
    
    const { strategyId, blueprintType, blueprintId, cards, regenerate = true } = body
    const finalBlueprintType = blueprintType || blueprintId

    if (!cards || cards.length === 0) {
      console.log('❌ No cards provided')
      return NextResponse.json({ 
        success: false, 
        error: 'No cards provided for summary generation' 
      }, { status: 400 })
    }

    console.log('🤖 Calling MCP server...')
    console.log('📊 Cards being sent to MCP:', cards.length, 'cards')
    console.log('📋 Sample card data:', cards.slice(0, 2).map(c => ({ title: c.title, description: c.description?.substring(0, 100) + '...' })))
    
    // Call MCP server to generate executive summary prompts
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL || 'http://localhost:3001'}/api/tools/generate_executive_summary`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'}`
      },
      body: JSON.stringify({
        cards,
        blueprint_type: finalBlueprintType
      })
    })

    console.log('📡 MCP Response status:', mcpResponse.status)
    
    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text()
      console.log('❌ MCP Error:', errorText)
      throw new Error('Failed to get MCP prompts')
    }

    const mcpResult = await mcpResponse.json()
    console.log('✅ MCP Result received:', mcpResult.success ? 'Success' : 'Failed')
    
    if (!mcpResult.success || !mcpResult.prompts) {
      console.log('❌ Invalid MCP response format:', mcpResult)
      throw new Error('Invalid MCP response format')
    }

    console.log('🧠 Calling OpenAI...')
    console.log('🔑 API Key check:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...${process.env.OPENAI_API_KEY.slice(-4)}` : 'MISSING')
    console.log('👤 User ID for database:', session.user.id)

    // Call OpenAI to generate the actual summary
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: mcpResult.prompts.system },
          { role: 'user', content: mcpResult.prompts.user }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    console.log('🧠 OpenAI Response status:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.log('❌ OpenAI Error:', errorText)
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const openaiResult = await openaiResponse.json()
    let summaryData = { 
      detected_blueprint: finalBlueprintType,
      themes: [], 
      implications: [], 
      nextSteps: [], 
      summary: '' 
    }
    
    try {
      let content = openaiResult.choices[0].message.content
      
      // Clean up markdown code blocks if present
      if (content.includes('```json')) {
        content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
      }
      
      const parsedContent = JSON.parse(content)
      summaryData = {
        detected_blueprint: parsedContent.detected_blueprint || finalBlueprintType,
        themes: parsedContent.themes || [],
        implications: parsedContent.implications || [],
        nextSteps: parsedContent.nextSteps || [],
        summary: parsedContent.summary || ''
      }
    } catch (e) {
      console.error('Failed to parse OpenAI result:', e)
      console.log('Raw OpenAI content:', openaiResult.choices[0].message.content)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to parse AI response' 
      }, { status: 500 })
    }

    // Save to database using admin client to bypass RLS
    const { error: upsertError } = await supabaseAdmin
      .from('executive_summaries')
      .upsert({
        strategy_id: strategyId,
        blueprint_type: finalBlueprintType,
        user_id: session.user.id,
        summary_content: summaryData.summary || 'AI-generated executive summary',
        summary_data: summaryData,
        cards_count: cards.length,
        generated_at: new Date().toISOString()
      }, {
        onConflict: 'strategy_id,blueprint_type',
        ignoreDuplicates: false
      })

    if (upsertError) {
      console.error('Failed to save summary:', upsertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save summary' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ...summaryData,
      metadata: mcpResult.metadata || {}
    })
  } catch (error) {
    console.error('Executive summary error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}