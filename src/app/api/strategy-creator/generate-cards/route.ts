import { NextRequest, NextResponse } from 'next/server'
import { blueprintRegistry } from '@/components/blueprints/registry'

export async function POST(request: NextRequest) {
  try {
    const { 
      contextSummary, 
      targetBlueprint, 
      generationOptions = { count: 3, style: 'comprehensive' },
      existingCards = [],
      strategyId 
    } = await request.json()

    // Call MCP tool to generate strategy card prompts
    const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/mcp/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'generate_strategy_cards',
        arguments: {
          contextSummary,
          targetBlueprint,
          generationOptions,
          existingCards
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

    // Call OpenAI to generate the actual cards
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
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const openaiResult = await openaiResponse.json()
    const generatedContent = JSON.parse(openaiResult.choices[0].message.content)
    
    // Ensure we have an array of cards
    const cards = Array.isArray(generatedContent) ? generatedContent : generatedContent.cards || []

    // Transform cards to include proper IDs and blueprint fields
    const transformedCards = cards.map((card: any, index: number) => {
      const blueprint = blueprintRegistry[targetBlueprint]
      if (!blueprint) return null

      // Generate a unique ID
      const prefix = blueprint.idPrefix || targetBlueprint.toUpperCase().slice(0, 3)
      const id = `${prefix}-${Date.now()}-${index}`

      return {
        id,
        title: card.title,
        description: card.description,
        cardType: targetBlueprint,
        priority: card.priority || 'medium',
        keyPoints: card.keyPoints || [],
        blueprintFields: card.blueprintFields || {},
        tags: card.tags || [],
        relationships: card.relationships || [],
        implementation: card.implementation || {},
        confidence: card.confidence || {
          level: 'medium',
          rationale: 'AI-generated based on provided context'
        },
        generatedAt: new Date().toISOString(),
        strategyId: parseInt(strategyId)
      }
    }).filter(Boolean)

    return NextResponse.json({ 
      success: true,
      cards: transformedCards,
      metadata: {
        targetBlueprint,
        generationOptions,
        cardCount: transformedCards.length
      }
    })
  } catch (error: any) {
    console.error('Error generating strategy cards:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate strategy cards' 
      },
      { status: 500 }
    )
  }
}