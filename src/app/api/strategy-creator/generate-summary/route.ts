import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { blueprintCards, intelligenceCards, intelligenceGroups, strategyName } = await request.json()

    // Call MCP server directly (like Executive Summary does)
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL || 'http://localhost:3001'}/api/tools/generate_context_summary`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'}`
      },
      body: JSON.stringify({
        blueprintCards,
        intelligenceCards,
        intelligenceGroups,
        strategyName
      })
    })

    if (!mcpResponse.ok) {
      console.log('❌ MCP server not available, using fallback')
      // Fallback summary generation
      const fallbackSummary = `# Context Summary for ${strategyName}\n\nBased on ${blueprintCards.length} blueprint cards and ${intelligenceCards.length} intelligence cards:\n\n## Strategic Context\nThis analysis incorporates the selected strategic elements to provide context for AI-powered card generation.\n\n## Key Themes\n- Strategic alignment with existing initiatives\n- Integration of intelligence insights\n- Focus on actionable outcomes`
      
      return NextResponse.json({ 
        success: true,
        summary: fallbackSummary,
        metadata: {
          blueprintCardCount: blueprintCards.length,
          intelligenceCardCount: intelligenceCards.length,
          intelligenceGroupCount: intelligenceGroups.length,
          strategyName,
          source: 'fallback'
        }
      })
    }

    const mcpResult = await mcpResponse.json()
    
    // MCP server now returns final content (like Executive Summary)
    if (mcpResult.success && mcpResult.summary) {
      return NextResponse.json({ 
        success: true,
        summary: mcpResult.summary,
        metadata: {
          blueprintCardCount: blueprintCards.length,
          intelligenceCardCount: intelligenceCards.length,
          intelligenceGroupCount: intelligenceGroups.length,
          strategyName,
          source: 'mcp'
        }
      })
    }

    throw new Error('Invalid MCP response format')

  } catch (error: any) {
    console.error('Error generating context summary:', error)
    
    // Always provide fallback
    const fallbackSummary = `# Context Summary\n\nStrategic analysis based on selected context cards.\n\n## Key Elements\n- Blueprint cards: ${(await request.json()).blueprintCards?.length || 0}\n- Intelligence cards: ${(await request.json()).intelligenceCards?.length || 0}\n\n## Strategic Focus\nContext-driven strategy development with AI enhancement.`
    
    return NextResponse.json({ 
      success: true,
      summary: fallbackSummary,
      metadata: { source: 'fallback' }
    })
  }
}