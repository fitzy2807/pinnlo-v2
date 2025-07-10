import { NextRequest, NextResponse } from 'next/server'
import { blueprintRegistry } from '@/components/blueprints/registry'

export async function POST(request: NextRequest) {
  try {
    const { summary, cardTypes, strategyId } = await request.json()

    // Call MCP tool to generate strategy cards
    const response = await fetch('http://localhost:3001/api/tools/generate_strategy_cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        summary, 
        cardTypes,
        count: Math.min(cardTypes.length * 2, 10) // Generate up to 2 cards per type, max 10
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate cards')
    }

    const result = await response.json()
    
    // Extract prompts from MCP response
    const { prompts } = JSON.parse(result.content)

    // Call OpenAI to generate the actual cards
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
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('Failed to call OpenAI')
    }

    const openaiResult = await openaiResponse.json()
    const generatedContent = JSON.parse(openaiResult.choices[0].message.content)
    
    // Ensure we have an array of cards
    const cards = Array.isArray(generatedContent) ? generatedContent : generatedContent.cards || []

    // Transform cards to include proper IDs and blueprint fields
    const transformedCards = cards.map((card: any, index: number) => {
      const blueprint = blueprintRegistry[card.cardType]
      if (!blueprint) return null

      // Generate a unique ID
      const prefix = blueprint.idPrefix || card.cardType.toUpperCase().slice(0, 3)
      const id = `${prefix}-${Date.now()}-${index}`

      // Prepare blueprint-specific fields based on key points
      const blueprintFields: any = {}
      
      // Add some default blueprint fields based on card type
      if (card.cardType === 'vision' && card.keyPoints) {
        blueprintFields.visionStatement = card.keyPoints[0] || ''
        blueprintFields.timeHorizon = '3-5 years'
        blueprintFields.successMetrics = card.keyPoints.slice(1, 4)
      } else if (card.cardType === 'personas' && card.keyPoints) {
        blueprintFields.demographics = {
          age: '25-45',
          location: 'Urban areas',
          occupation: 'Professional'
        }
        blueprintFields.painPoints = card.keyPoints.slice(0, 3)
        blueprintFields.goals = card.keyPoints.slice(3, 6)
      } else if (card.cardType === 'okrs' && card.keyPoints) {
        blueprintFields.objective = card.keyPoints[0] || ''
        blueprintFields.keyResults = card.keyPoints.slice(1, 4).map((kr: string, i: number) => ({
          id: `kr-${i + 1}`,
          description: kr,
          target: '100%',
          current: '0%'
        }))
      }

      return {
        id,
        title: card.title,
        description: card.description,
        cardType: card.cardType,
        priority: card.priority || 'medium',
        keyPoints: card.keyPoints || [],
        blueprintFields,
        tags: [],
        confidence: {
          level: 'medium',
          rationale: 'AI-generated based on provided context'
        }
      }
    }).filter(Boolean)

    return NextResponse.json({ cards: transformedCards })
  } catch (error: any) {
    console.error('Error generating cards:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate cards' },
      { status: 500 }
    )
  }
}