import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

/**
 * Process raw text into intelligence cards using AI
 * POST /api/intelligence-processing/text
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { text, context, type, targetCategory, targetGroups } = body

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Text processing request from user ${user.id}`)
    console.log(`📝 Text length: ${text.length} characters`)
    console.log(`🎯 Context: ${context || 'None'}`)
    console.log(`📋 Type: ${type || 'General'}`)

    // Call MCP server
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/api/tools/process_intelligence_text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        text,
        context,
        type,
        targetCategory,
        targetGroups,
        userId: user.id
      })
    })

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text()
      console.error('MCP server error:', errorText)
      throw new Error(`MCP server error: ${mcpResponse.status}`)
    }

    const mcpResult = await mcpResponse.json()
    console.log('📡 MCP Response:', mcpResult)

    // Parse MCP response
    let parsedResult
    try {
      parsedResult = JSON.parse(mcpResult.content[0].text)
    } catch (parseError) {
      console.error('Failed to parse MCP response:', mcpResult)
      throw new Error('Invalid response from AI processing service')
    }

    // Check if MCP returned prompts instead of processed results (fallback mode)
    if (parsedResult.prompts && !parsedResult.cardsCreated) {
      console.log('🔄 MCP returned prompts - calling OpenAI directly as fallback')
      
      // Check if this is likely an interview
      const isInterview = type === 'interview' || 
                         text.toLowerCase().includes('interviewer') ||
                         text.toLowerCase().includes('interviewee') ||
                         /\b(q:|a:|question:|answer:)/i.test(text) ||
                         text.length > 2000
      
      const minimumCards = isInterview ? 10 : 3
      
      // Enhanced system prompt for interviews
      const systemPrompt = isInterview ? 
        `You are a strategic analyst AI working inside a business planning platform. Your role is to extract valuable, context-rich insights from interview transcript chunks.

Your objective is to extract **at least 10 distinct, high-quality insights** from the interview transcript. These insights will be used to create Intelligence Cards in a product strategy platform.

For each insight, include:
- Clear, actionable summary (1–2 sentences)
- Strategic theme or category (e.g. Safety, Workforce, Automation, Tech Integration, Operations, Customer Experience)
- Supporting quote or paraphrase from the stakeholder
- Opportunity for what could be explored or solved
- Stakeholder motivation (why this matters to them - explicit or inferred)

Rules:
- Do NOT return fewer than 10 insights
- Do NOT repeat the same insight with different wording
- Focus on real-world operational, safety, integration, and workforce challenges
- Use the stakeholder's own words when possible for evidence
- If you find fewer obvious insights, include extrapolated or adjacent insights that are implied but not stated directly` :
        `You are an expert intelligence analyst. Your task is to process raw text content and extract structured, actionable intelligence insights.`
      
      const userPrompt = isInterview ?
        `Analyze this interview transcript and extract **at least 10 distinct strategic insights**:

--- INTERVIEW TRANSCRIPT ---
${text}
--- END TRANSCRIPT ---

${context ? `\nAdditional Context: ${context}` : ''}

For each insight, create a JSON object with these exact fields:
- title: (specific, actionable title for the intelligence card)
- summary: (concise overview - max 200 chars)
- intelligence_content: (detailed analysis incorporating the insight - max 1000 chars)
- key_findings: (array of 3-5 specific bullet points)
- strategic_implications: (brief strategic impact description)
- recommended_actions: (specific actionable recommendations)
- credibility_score: (integer 1-10 based on source quality)
- relevance_score: (integer 1-10 based on strategic importance)
- tags: (array of relevant keywords for categorization)
- category: (one of: market, competitor, trends, technology, customer, regulatory, opportunities, risks)

Return ONLY a JSON array of at least 10 intelligence cards. No additional text or formatting.` :
        `Process the following ${type || 'text'} content and extract 3-5 high-quality intelligence cards:

--- TEXT CONTENT ---
${text}
--- END CONTENT ---

${context ? `\nAdditional Context: ${context}` : ''}

For each intelligence insight you identify, create a JSON object with these exact fields:
- title: (specific, actionable title - max 100 chars)
- summary: (concise overview - max 200 chars)
- intelligence_content: (detailed analysis - max 1000 chars)
- key_findings: (array of 3-5 specific bullet points)
- strategic_implications: (brief strategic impact description)
- recommended_actions: (specific actionable recommendations)
- credibility_score: (integer 1-10 based on source quality)
- relevance_score: (integer 1-10 based on strategic importance)
- tags: (array of relevant keywords for categorization)
- category: (one of: market, competitor, trends, technology, customer, regulatory, opportunities, risks)

Return ONLY a JSON array of intelligence cards. No additional text or formatting.`
      
      // Call OpenAI directly
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
          temperature: 0.6,
          max_tokens: 4000
        })
      })
      
      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`)
      }
      
      const openaiResult = await openaiResponse.json()
      
      // Handle different response formats (OpenAI vs Claude)
      let aiContent, tokensUsed, cost
      if (openaiResult.choices) {
        // OpenAI format
        aiContent = openaiResult.choices[0].message.content
        tokensUsed = openaiResult.usage.total_tokens
        cost = tokensUsed * 0.00001 // OpenAI pricing
      } else if (openaiResult.content) {
        // Claude format
        aiContent = openaiResult.content[0].text
        tokensUsed = openaiResult.usage.input_tokens + openaiResult.usage.output_tokens
        cost = tokensUsed * 0.000008 // Claude pricing (approximate)
      } else {
        throw new Error('Unexpected API response format')
      }
      
      // Parse AI response (handle markdown code blocks)
      let aiCards
      try {
        // Remove markdown code blocks if present
        let cleanContent = aiContent.trim()
        
        // More aggressive markdown cleanup
        if (cleanContent.includes('```')) {
          // Remove everything before the first [ and after the last ]
          const firstBrace = cleanContent.indexOf('[')
          const lastBrace = cleanContent.lastIndexOf(']')
          
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanContent = cleanContent.substring(firstBrace, lastBrace + 1)
          } else {
            // Fallback: remove common markdown patterns
            cleanContent = cleanContent
              .replace(/^```(?:json)?\s*\n?/gm, '')
              .replace(/\n?```\s*$/gm, '')
              .replace(/^\s*```\s*/gm, '')
              .trim()
          }
        }
        
        console.log('🧹 Cleaned content for parsing:', cleanContent.substring(0, 200) + '...')
        
        aiCards = JSON.parse(cleanContent)
        if (!Array.isArray(aiCards)) {
          throw new Error('AI response is not an array')
        }
      } catch (parseError) {
        console.error('❌ Failed to parse AI response. Raw content:', aiContent.substring(0, 500))
        console.error('❌ Parse error:', parseError.message)
        throw new Error('Failed to parse AI response as JSON')
      }
      
      // Store cards in database (simplified version)
      const savedCards = []
      for (const aiCard of aiCards) {
        const card = {
          user_id: user.id,
          category: aiCard.category || 'market',
          title: aiCard.title || 'AI Generated Intelligence',
          summary: aiCard.summary || aiCard.intelligence_content?.substring(0, 200) || 'AI generated insight',
          intelligence_content: aiCard.intelligence_content || 'AI generated content',
          key_findings: aiCard.key_findings || ['AI generated finding'],
          strategic_implications: aiCard.strategic_implications || 'Strategic implications from AI analysis',
          recommended_actions: aiCard.recommended_actions || 'Recommended actions from AI analysis',
          source_reference: `${isInterview ? 'Interview Transcript' : 'Text Processing'} - ${type || 'General'}${context ? ` (${context})` : ''}`,
          credibility_score: aiCard.credibility_score || (isInterview ? 8 : 7),
          relevance_score: aiCard.relevance_score || 8,
          tags: aiCard.tags || (isInterview ? ['interview', 'transcript', type || 'general'] : ['text-processing', type || 'general']),
          status: 'active'
        }
        
        const { data, error } = await supabase
          .from('intelligence_cards')
          .insert(card)
          .select()
          .single()
        
        if (!error && data) {
          savedCards.push(data)
        }
      }
      
      console.log(`✅ Successfully processed via fallback - created ${savedCards.length} intelligence cards`)
      
      return NextResponse.json({
        success: true,
        message: `Successfully created ${savedCards.length} intelligence cards from ${isInterview ? 'interview transcript' : 'text'}`,
        cardsCreated: savedCards.length,
        cards: savedCards,
        tokensUsed: tokensUsed,
        cost: cost,
        textLength: text.length,
        processingType: type || 'general',
        isInterview: isInterview,
        minimumCardsMet: savedCards.length >= minimumCards,
        targetCards: minimumCards,
        fallbackUsed: true
      })
    }

    if (!parsedResult.success) {
      throw new Error(parsedResult.error || 'AI processing failed')
    }

    console.log(`✅ Successfully processed text - created ${parsedResult.cardsCreated} intelligence cards`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${parsedResult.cardsCreated} intelligence cards from ${parsedResult.isInterview ? 'interview transcript' : 'text'}`,
      cardsCreated: parsedResult.cardsCreated,
      cards: parsedResult.cards,
      tokensUsed: parsedResult.tokensUsed,
      cost: parsedResult.cost,
      textLength: parsedResult.textLength,
      processingType: parsedResult.processingType,
      isInterview: parsedResult.isInterview,
      minimumCardsMet: parsedResult.minimumCardsMet,
      targetCards: parsedResult.targetCards
    })

  } catch (error: any) {
    console.error('🚨 Text processing API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process text', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Get text processing status/info
 * GET /api/intelligence-processing/text
 */
export async function GET() {
  return NextResponse.json({
    service: 'Intelligence Text Processing',
    status: 'active',
    description: 'Processes raw text content into structured intelligence cards using AI',
    supportedTypes: ['interview', 'article', 'report', 'news', 'research', 'email', 'document', 'general'],
    interviewProcessing: {
      minimumCards: 10,
      enhancedExtraction: true,
      retryLogic: true,
      specializedPrompts: true
    },
    maxTextLength: 50000, // ~50k characters
    estimatedProcessingTime: '2-8 seconds (interviews may take longer)',
    costPerRequest: '$0.001-0.005' // Higher for interviews due to retry logic
  })
}
