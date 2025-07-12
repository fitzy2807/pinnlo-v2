import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001'
const MCP_SERVER_TOKEN = process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'

interface Feature {
  id: string
  name: string
  description: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌐 API: Received TRD generation request')
    
    const body = await request.json()
    console.log('📦 API: Request body:', JSON.stringify(body, null, 2))
    
    const { strategyId, features, options = {} } = body
    console.log('🎯 API: Extracted fields:')
    console.log('  - strategyId:', strategyId)
    console.log('  - features count:', features?.length)
    console.log('  - options:', options)

    // Validate required fields
    if (!strategyId || !features || !Array.isArray(features)) {
      console.error('❌ API: Validation failed - missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields: strategyId, features' },
        { status: 400 }
      )
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get strategy context for better requirements
    console.log('🔍 API: Fetching strategy context for ID:', strategyId)
    const { data: strategy } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .eq('userId', user.id)
      .single()

    console.log('📊 API: Strategy data:', strategy)
    
    if (!strategy) {
      console.error('❌ API: Strategy not found')
      return NextResponse.json(
        { success: false, error: 'Strategy not found' },
        { status: 404 }
      )
    }

    // Get related cards for additional context
    console.log('🃏 API: Fetching related cards')
    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('strategy_id', strategyId)
      .limit(10)
      
    console.log('🃏 API: Found cards:', cards?.length || 0)

    const mcpPayload = {
      strategyContext: {
        title: strategy.title,
        description: strategy.description,
        cards: cards || []
      },
      features,
      options: {
        model: 'claude-4', // Explicitly request Claude 4
        includeArchitecture: options.includeArchitecture !== false,
        includeDataModels: options.includeDataModels !== false,
        includeAPIs: options.includeAPIs !== false,
        includeSecurityRequirements: options.includeSecurityRequirements !== false,
        format: 'comprehensive'
      }
    }
    
    console.log('🚀 API: Generating technical requirement with Claude 4 for features:', features.map((f: Feature) => f.name))
    console.log('📤 API: MCP payload being sent:', JSON.stringify(mcpPayload, null, 2))
    console.log('🔗 API: MCP server URL:', `${MCP_SERVER_URL}/api/tools/generate_technical_requirement`)

    // Call MCP server to generate technical requirement using Claude 4
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/api/tools/generate_technical_requirement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify(mcpPayload)
    })

    console.log('📞 API: MCP response status:', mcpResponse.status)
    
    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text()
      console.error('❌ API: MCP server error:', errorText)
      return NextResponse.json(
        { success: false, error: `MCP server error: ${mcpResponse.status}` },
        { status: 500 }
      )
    }

    const mcpResult = await mcpResponse.json()
    console.log('✅ API: MCP server returned prompts for TRD generation')
    console.log('📊 API: MCP result:', JSON.stringify(mcpResult, null, 2))

    // Parse the MCP response format
    let parsedMcpResult
    if (mcpResult.content && mcpResult.content[0] && mcpResult.content[0].text) {
      try {
        parsedMcpResult = JSON.parse(mcpResult.content[0].text)
      } catch (parseError) {
        console.error('❌ API: Failed to parse MCP JSON response:', parseError)
        throw new Error(`Failed to parse MCP response: ${parseError.message}`)
      }
    } else {
      throw new Error('Invalid MCP response structure')
    }

    if (!parsedMcpResult.success) {
      throw new Error(`MCP generation failed: ${parsedMcpResult.error || 'Unknown error'}`)
    }

    // Get the generated prompts and config
    const { prompts, config, metadata } = parsedMcpResult
    
    console.log('🤖 API: Calling OpenAI with generated prompts for TRD creation')
    
    // Call OpenAI with the prompts from MCP
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompts.system },
          { role: 'user', content: prompts.user }
        ],
        temperature: config.temperature || 0.3,
        max_tokens: config.max_tokens || 4000
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
    }

    const openaiResult = await openaiResponse.json()
    console.log('✅ API: OpenAI generated TRD content successfully')
    
    if (!openaiResult.choices || !openaiResult.choices[0] || !openaiResult.choices[0].message) {
      throw new Error('Invalid OpenAI response structure')
    }

    const generatedContent = openaiResult.choices[0].message.content
    console.log('📝 API: Generated TRD length:', generatedContent.length, 'characters')
    
    // Return the generated TRD content
    return NextResponse.json({
      success: true,
      requirement: {
        name: `Technical Requirements for ${features.map((f: Feature) => f.name).join(', ')}`,
        description: generatedContent,
        features: features.map((f: Feature) => f.name),
        generatedWith: 'gpt-4o',
        timestamp: new Date().toISOString()
      },
      model_used: 'gpt-4o',
      metadata: {
        ...metadata,
        openaiTokens: openaiResult.usage
      }
    })

  } catch (error) {
    console.error('❌ Error generating technical requirement:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
