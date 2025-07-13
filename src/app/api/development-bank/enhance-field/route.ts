import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { fieldContent, fieldType, enhancementType } = await request.json()

    // Get user for tracking
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Call MCP server for AI enhancement
    const response = await fetch('http://localhost:3001/enhance-trd-field', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: fieldContent,
        field_type: fieldType,
        enhancement_type: enhancementType,
        context: {
          document_type: 'technical_requirements',
          improvement_focus: 'clarity_and_completeness'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.status}`)
    }

    const result = await response.json()
    
    // Track AI usage in database
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('ai_usage').insert({
        user_id: user.id,
        generation_type: 'field_enhancement',
        feature_used: 'trd_field_enhancement',
        request_type: enhancementType,
        status: 'success',
        tokens_used: result.tokens_used || 0,
        cost_incurred: result.cost_incurred || 0,
        model_used: result.model_used || 'claude-sonnet-4'
      })
    }
    
    return NextResponse.json({
      success: true,
      enhancedContent: result.enhanced_content,
      improvements: result.improvements_made || ['Enhanced clarity', 'Added technical depth'],
      tokensUsed: result.tokens_used || 0
    })
  } catch (error) {
    console.error('AI enhancement error:', error)
    
    // Track failed usage
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('ai_usage').insert({
        user_id: user.id,
        generation_type: 'field_enhancement',
        feature_used: 'trd_field_enhancement',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to enhance content'
    }, { status: 500 })
  }
}