import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

/**
 * Process URL into intelligence cards using AI
 * POST /api/intelligence-processing/url
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
    const { url, context, targetCategory, targetGroups } = body

    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log(`🔍 URL analysis request from user ${user.id}`)
    console.log(`🌐 URL: ${url}`)
    console.log(`🎯 Context: ${context || 'None'}`)
    console.log(`📋 Target Category: ${targetCategory || 'General'}`)

    // Call MCP server
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/api/tools/analyze_url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        url,
        context,
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
      
      // First, we need to fetch the URL content
      console.log('📥 Fetching URL content...')
      
      try {
        // Use a web scraping service or proxy to fetch the content
        // For now, we'll use a simple fetch with error handling
        const urlResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PinnloBot/1.0; +https://pinnlo.com)'
          }
        })
        
        if (!urlResponse.ok) {
          throw new Error(`Failed to fetch URL: ${urlResponse.status}`)
        }
        
        const contentType = urlResponse.headers.get('content-type') || ''
        let urlContent = ''
        let title = ''
        let description = ''
        
        if (contentType.includes('text/html')) {
          const html = await urlResponse.text()
          
          // Extract title
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
          title = titleMatch ? titleMatch[1].trim() : ''
          
          // Extract meta description
          const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
          description = descMatch ? descMatch[1].trim() : ''
          
          // Extract text content (basic extraction - could be improved)
          urlContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 10000) // Limit to 10k chars
        } else if (contentType.includes('application/json')) {
          urlContent = await urlResponse.text()
        } else {
          urlContent = await urlResponse.text()
        }
        
        console.log(`📄 Fetched content: ${urlContent.length} characters`)
        
        // Enhanced system prompt for URL analysis
        const systemPrompt = `You are a strategic analyst AI working inside a business planning platform. Your role is to analyze web content and extract valuable intelligence insights.

Your objective is to extract **at least 5-7 distinct, high-quality insights** from the web page content. These insights will be used to create Intelligence Cards in a product strategy platform.

For each insight, include:
- Clear, actionable summary (1–2 sentences)
- Category classification (Market, Competitor, Technology, Trends, Consumer, Risk, or Opportunities)
- Key evidence or data points from the content
- Strategic implications for business planning
- Relevance score (1-10)
- Confidence level based on source credibility

Rules:
- Focus on factual, strategic insights
- Extract specific data points, statistics, or trends
- Identify competitive intelligence when available
- Note any emerging technologies or market shifts
- Highlight risks and opportunities
- Consider the source credibility

Analyze the content and create structured intelligence cards.`

        const userPrompt = `Analyze this web page content:

URL: ${url}
Title: ${title || 'N/A'}
Description: ${description || 'N/A'}
Context: ${context || 'General strategic intelligence extraction'}
Target Category: ${targetCategory || 'Auto-detect'}

Content:
${urlContent}

Extract strategic intelligence insights and create detailed intelligence cards.`

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" }
          })
        })

        if (!openaiResponse.ok) {
          const error = await openaiResponse.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const aiResponse = await openaiResponse.json()
        const insights = JSON.parse(aiResponse.choices[0].message.content)

        console.log('🤖 AI extracted insights:', insights)

        // Create intelligence cards from insights
        const cardsCreated = []
        const intelligenceCards = insights.cards || insights.insights || []

        for (const insight of intelligenceCards) {
          const cardData = {
            title: insight.title || insight.summary?.substring(0, 100),
            category: targetCategory || insight.category || 'market',
            content: insight.content || insight.summary,
            source: url,
            source_type: 'url',
            relevance_score: insight.relevance || 7,
            credibility_score: insight.confidence || 7,
            key_insights: insight.key_insights || [insight.summary],
            tags: insight.tags || [],
            user_id: user.id,
            status: 'active',
            groups: targetGroups || []
          }

          const { data, error } = await supabase
            .from('intelligence_cards')
            .insert(cardData)
            .select()
            .single()

          if (!error && data) {
            cardsCreated.push(data)
            
            // Add to groups if specified
            if (targetGroups && targetGroups.length > 0) {
              for (const groupId of targetGroups) {
                await supabase
                  .from('intelligence_card_groups')
                  .insert({
                    card_id: data.id,
                    group_id: groupId
                  })
              }
            }
          }
        }

        // Calculate costs
        const tokensUsed = aiResponse.usage?.total_tokens || 0
        const cost = (tokensUsed / 1000) * 0.03 // Approximate GPT-4 pricing

        const result = {
          success: true,
          message: `Successfully analyzed URL and created ${cardsCreated.length} intelligence cards`,
          cardsCreated: cardsCreated.length,
          cards: cardsCreated,
          tokensUsed,
          cost,
          url,
          title,
          description,
          contentLength: urlContent.length
        }

        return NextResponse.json(result)
        
      } catch (urlError: any) {
        console.error('Failed to fetch/process URL:', urlError)
        
        // If we can't fetch the URL directly, return an error
        return NextResponse.json(
          { 
            error: 'Failed to fetch URL content', 
            details: urlError.message 
          },
          { status: 400 }
        )
      }
    }

    // If MCP returned actual results
    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error('URL analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze URL', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}