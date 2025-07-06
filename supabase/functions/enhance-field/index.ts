import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("PINNLO AI Enhancement Function loaded!")

interface EnhanceRequest {
  blueprintType: string
  currentData: Record<string, any>
  fieldsToEnhance: string[]
  context?: {
    companyName?: string
    industry?: string
    targetMarket?: string
    existingCards?: Record<string, any>[]
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { blueprintType, currentData, fieldsToEnhance, context }: EnhanceRequest = await req.json()
    
    console.log(`Enhancing ${blueprintType} fields:`, fieldsToEnhance)

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create context-aware prompt based on blueprint type
    const prompt = createEnhancementPrompt(blueprintType, currentData, fieldsToEnhance, context)
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are PINNLO AI, an expert strategy consultant helping founders and product leaders develop comprehensive business strategies. Always provide actionable, specific, and professional responses in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const enhancedContent = aiResponse.choices[0]?.message?.content

    if (!enhancedContent) {
      throw new Error('No content received from OpenAI')
    }

    // Parse the JSON response from OpenAI
    let enhancedData
    try {
      enhancedData = JSON.parse(enhancedContent)
    } catch (e) {
      // If JSON parsing fails, wrap the content
      console.warn('Failed to parse OpenAI response as JSON, wrapping content')
      enhancedData = { enhanced: enhancedContent }
    }

    return new Response(
      JSON.stringify({
        success: true,
        enhancedData,
        blueprintType,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      },
    )

  } catch (error) {
    console.error('Enhancement error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      },
    )
  }
})

function createEnhancementPrompt(
  blueprintType: string, 
  currentData: Record<string, any>, 
  fieldsToEnhance: string[], 
  context?: any
): string {
  const contextInfo = context ? `
Company Context:
- Company: ${context.companyName || 'Not specified'}
- Industry: ${context.industry || 'Not specified'}
- Target Market: ${context.targetMarket || 'Not specified'}
` : ''

  const currentDataInfo = Object.keys(currentData).length > 0 ? `
Current Data:
${JSON.stringify(currentData, null, 2)}
` : ''

  switch (blueprintType) {
    case 'strategic-context':
      return `${contextInfo}${currentDataInfo}
Please enhance the following Strategic Context fields: ${fieldsToEnhance.join(', ')}

Provide strategic, actionable content for each field. Focus on:
- Market positioning and competitive advantages
- Key stakeholders and their interests
- Strategic priorities and objectives
- Market dynamics and trends

For array fields (keyTrends, stakeholders, constraints, opportunities), provide comma-separated values.
For text fields (marketContext, competitiveLandscape), provide detailed strategic content.

Return as JSON with field names as keys and enhanced content as values.`

    case 'vision':
      return `${contextInfo}${currentDataInfo}
Please enhance the following Vision fields: ${fieldsToEnhance.join(', ')}

Create an inspiring, clear vision that:
- Articulates the company's future state and impact
- Is memorable and motivating
- Aligns with market opportunities
- Reflects the company's values and mission

Return as JSON with field names as keys and enhanced content as values.`

    case 'value-proposition':
      return `${contextInfo}${currentDataInfo}
Please enhance the following Value Proposition fields: ${fieldsToEnhance.join(', ')}

Develop compelling value propositions that:
- Clearly articulate unique benefits
- Address specific customer pain points
- Differentiate from competitors
- Are measurable and specific

Return as JSON with field names as keys and enhanced content as values.`

    case 'okrs':
      return `${contextInfo}${currentDataInfo}
Please enhance the following OKR fields: ${fieldsToEnhance.join(', ')}

Create specific, measurable OKRs that:
- Align with strategic objectives
- Include specific metrics and targets
- Are challenging but achievable
- Have clear timelines

Return as JSON with field names as keys and enhanced content as values.`

    case 'persona':
      return `${contextInfo}${currentDataInfo}
Please enhance the following Persona fields: ${fieldsToEnhance.join(', ')}

Develop detailed, realistic personas that include:
- Demographics and psychographics
- Pain points and motivations
- Behavioral patterns and preferences
- Goals and challenges

Return as JSON with field names as keys and enhanced content as values.`

    default:
      return `${contextInfo}${currentDataInfo}
Please enhance the following ${blueprintType} fields: ${fieldsToEnhance.join(', ')}

Provide professional, strategic content appropriate for ${blueprintType} planning.
Focus on actionable, specific, and valuable insights.

Return as JSON with field names as keys and enhanced content as values.`
  }
}

/* To invoke locally:

  1. Run `supabase start`
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/enhance-field' \
    --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{
      "blueprintType": "strategic-context", 
      "currentData": {"company": "PINNLO"}, 
      "fieldsToEnhance": ["market_position", "key_stakeholders"],
      "context": {"companyName": "PINNLO", "industry": "AI Strategy Tools"}
    }'

*/