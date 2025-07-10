import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DevelopmentBankService } from '@/services/developmentBankService'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Generate test scenarios API called')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { strategyId, featureIds, techStackId, options = {} } = body

    if (!strategyId || !featureIds || !techStackId) {
      return NextResponse.json(
        { error: 'Strategy ID, feature IDs, and tech stack ID are required' },
        { status: 400 }
      )
    }

    // Fetch features
    const { data: features } = await supabase
      .from('cards')
      .select('*')
      .in('id', featureIds)
      .eq('card_type', 'feature')

    // Fetch tech stack
    const techStack = await DevelopmentBankService.getTechStack(techStackId)
    if (!techStack) {
      throw new Error('Tech stack not found')
    }

    // Transform features
    const transformedFeatures = features?.map(f => ({
      id: f.id,
      title: f.title,
      acceptanceCriteria: f.card_data?.acceptanceCriteria || {},
      userStories: f.card_data?.userStories || {},
      linkedPersona: f.card_data?.linkedPersona || ''
    })) || []

    // Invoke MCP tool
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        tool: 'generate_test_scenarios',
        arguments: {
          features: transformedFeatures,
          techStack: {
            stackName: techStack.stack_name,
            layers: techStack.layers
          },
          options: {
            format: options.format || 'ai-ready',
            includeEdgeCases: options.includeEdgeCases !== false,
            includeTestData: options.includeTestData !== false
          }
        }
      })
    })

    if (!mcpResponse.ok) {
      throw new Error(`MCP server error: ${mcpResponse.status}`)
    }

    const mcpResult = await mcpResponse.json()

    if (!mcpResult.success || !mcpResult.content) {
      throw new Error(mcpResult.error || 'Failed to generate test scenarios')
    }

    // Save as asset
    const asset = await DevelopmentBankService.createAsset(
      Number(strategyId),
      {
        asset_type: 'test-scenario',
        source_card_ids: featureIds,
        tech_stack_id: techStackId,
        content: {
          formats: {
            aiReady: mcpResult.content,
            markdown: '',
            raw: { scenarios: mcpResult.content }
          },
          sections: {
            scenarios: mcpResult.content
          }
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: user.id,
          version: 1,
          featureCount: features?.length || 0,
          options
        },
        created_by: user.id
      }
    )

    return NextResponse.json({
      success: true,
      asset,
      content: mcpResult.content
    })
  } catch (error) {
    console.error('Error generating test scenarios:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate test scenarios' },
      { status: 500 }
    )
  }
}