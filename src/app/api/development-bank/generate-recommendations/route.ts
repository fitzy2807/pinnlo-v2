import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DevelopmentBankService } from '@/services/developmentBankService'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Generate tech stack recommendations API called')
    
    // Get auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { strategyId, companyProfile, projectRequirements, options = {} } = body

    if (!strategyId || !companyProfile || !projectRequirements) {
      return NextResponse.json(
        { error: 'Strategy ID, company profile, and project requirements are required' },
        { status: 400 }
      )
    }

    console.log('📊 Fetching strategy context for recommendations...')

    // Fetch strategy context
    const strategy = await DevelopmentBankService.getStrategy(strategyId)
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
    }

    // Fetch strategy cards for context
    const cards = await DevelopmentBankService.getStrategyCards(strategyId)
    
    console.log(`📡 Invoking MCP tool for tech stack recommendations`)

    // Invoke MCP tool
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        tool: 'generate_tech_stack_recommendations',
        arguments: {
          companyProfile,
          projectRequirements,
          strategyContext: {
            vision: strategy.description,
            targetMarket: strategy.target_market || 'Not specified',
            timeframe: strategy.timeframe || 'Not specified',
            cards: cards.map(card => ({
              title: card.title,
              description: card.description,
              cardType: card.card_type,
              techConsiderations: card.card_data?.techConsiderations || ''
            }))
          }
        }
      })
    })

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text()
      console.error('❌ MCP server error:', errorText)
      throw new Error(`MCP server error: ${mcpResponse.status}`)
    }

    const mcpResult = await mcpResponse.json()
    console.log('✅ MCP response received')

    if (!mcpResult.success || !mcpResult.content) {
      throw new Error(mcpResult.error || 'Failed to generate recommendations')
    }

    // Parse the MCP response to get recommendations
    const recommendations = JSON.parse(mcpResult.content)

    // Save the recommendations to database
    const savedRecommendations = []
    for (const rec of recommendations) {
      try {
        const techStack = await DevelopmentBankService.createTechStack({
          strategy_id: strategyId,
          stack_name: rec.stackName,
          stack_type: 'ai-generated',
          layers: rec.layers,
          metadata: rec.metadata,
          created_by: user.id
        })
        savedRecommendations.push(techStack)
      } catch (error) {
        console.error('Error saving tech stack:', error)
        // Continue with other recommendations even if one fails
      }
    }

    // Cache the AI recommendation for future reference
    try {
      await DevelopmentBankService.createVendorRecommendation({
        strategy_id: strategyId,
        category: 'tech-stack',
        context: { companyProfile, projectRequirements },
        recommendations: recommendations,
        confidence_score: recommendations[0]?.metadata?.confidenceScore || 0.8,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        generated_by: user.id
      })
    } catch (error) {
      console.error('Error caching AI recommendation:', error)
      // Non-critical error, continue
    }

    return NextResponse.json({
      success: true,
      recommendations: savedRecommendations,
      metadata: {
        recommendationsGenerated: savedRecommendations.length,
        strategyContext: {
          name: strategy.name,
          cardsConsidered: cards.length
        }
      }
    })
  } catch (error) {
    console.error('Error generating tech stack recommendations:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}