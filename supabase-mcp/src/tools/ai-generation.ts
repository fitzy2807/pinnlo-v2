// Tool type will be inferred from the object structure

export const intelligenceTools = [
  {
    name: 'analyze_url',
    description: 'Analyze a URL and extract intelligence',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        context: { type: 'string' }
      },
      required: ['url']
    }
  },
  {
    name: 'process_intelligence_text',
    description: 'Process raw text into intelligence insights',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        context: { type: 'string' },
        type: { type: 'string' }
      },
      required: ['text']
    }
  },
  {
    name: 'generate_automation_intelligence',
    description: 'Generate intelligence cards based on automation rules',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        ruleId: { type: 'string' },
        categories: { 
          type: 'array',
          items: { type: 'string' }
        },
        maxCards: { type: 'number' },
        targetGroups: { 
          type: 'array',
          items: { type: 'string' }
        },
        optimizationLevel: { 
          type: 'string',
          enum: ['maximum_quality', 'balanced', 'maximum_savings']
        },
        triggerType: {
          type: 'string',
          enum: ['scheduled', 'manual']
        },
        systemPrompt: {
          type: 'string',
          description: 'Custom system prompt to guide AI generation'
        }
      },
      required: ['userId', 'ruleId']
    }
  }
];

export async function handleAnalyzeUrl(args: any, supabase: any) {
  try {
    const { url, context } = args;
    
    const systemPrompt = `You are an intelligence analyst. Analyze the provided URL content and extract key insights.`;
    
    const userPrompt = `Analyze this URL: ${url}
    
Context: ${context || 'General analysis'}

Extract key insights, trends, and actionable intelligence.`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            prompts: {
              system: systemPrompt,
              user: userPrompt
            },
            url
          })
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          })
        }
      ],
      isError: true
    };
  }
}

export async function handleProcessIntelligenceText(args: any, supabase: any) {
  try {
    const { text, context, type } = args;
    
    const systemPrompt = `You are an intelligence analyst. Process the provided text and extract structured insights.`;
    
    const userPrompt = `Process this ${type || 'text'} content:

${text}

Context: ${context || 'General processing'}

Extract structured insights, key points, and actionable intelligence.`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            prompts: {
              system: systemPrompt,
              user: userPrompt
            }
          })
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          })
        }
      ],
      isError: true
    };
  }
}

export async function handleGenerateAutomationIntelligence(args: any, supabase: any) {
  try {
    const { 
      userId, 
      ruleId, 
      categories = [], 
      maxCards = 5, 
      targetGroups = [],
      optimizationLevel = 'balanced',
      triggerType = 'scheduled',
      systemPrompt = ''
    } = args;
    
    console.log(`🤖 Generating automation intelligence for user ${userId}, rule ${ruleId}`);
    console.log(`🎯 System Prompt: ${systemPrompt}`);
    console.log(`📁 Categories: ${categories.join(', ')}`);
    
    // ONLY use the system prompt from the rule - no fallbacks or overrides
    let finalSystemPrompt = systemPrompt;
    
    if (!finalSystemPrompt || !finalSystemPrompt.trim()) {
      throw new Error('No system prompt provided in automation rule. System prompt is required.');
    }
    
    // Build completely neutral user prompt - NO category influence
    const userPrompt = `Generate ${maxCards} intelligence cards based solely on the system instructions above.

Optimization level: ${optimizationLevel}
Trigger type: ${triggerType}

For each card, provide a JSON object with these exact fields:
- title: (specific and actionable)
- summary: (brief overview, max 200 chars)
- intelligence_content: (detailed analysis, max 1000 chars)
- key_findings: (array of 3-5 bullet points)
- strategic_implications: (brief text)
- recommended_actions: (brief text)
- credibility_score: (integer 1-10)
- relevance_score: (integer 1-10)
- tags: (array of relevant keywords)

Return ONLY a JSON array of ${maxCards} cards. No additional text or formatting.`;

    console.log(`🔮 Calling OpenAI with system prompt...`);
    console.log(`📝 Final System Prompt: ${finalSystemPrompt}`);
    console.log(`📝 User Prompt: ${userPrompt}`);
    
    // Call OpenAI API
    const openaiRequest = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: optimizationLevel === 'maximum_quality' ? 0.7 : 0.5,
      max_tokens: optimizationLevel === 'maximum_quality' ? 4000 : 
                 optimizationLevel === 'balanced' ? 3000 : 2000
    };
    
    console.log(`🤖 OpenAI Request:`, JSON.stringify(openaiRequest, null, 2));
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(openaiRequest)
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${await openaiResponse.text()}`);
    }

    const openaiResult = await openaiResponse.json();
    const aiContent = openaiResult.choices[0].message.content;
    const tokensUsed = openaiResult.usage.total_tokens;
    const cost = tokensUsed * 0.00001; // Approximate cost for gpt-4o-mini
    
    console.log(`✨ OpenAI response received. Tokens: ${tokensUsed}, Cost: ${cost.toFixed(4)}`);
    console.log(`💬 OpenAI Raw Response:`, aiContent);
    
    // Parse AI response
    let aiCards;
    try {
      aiCards = JSON.parse(aiContent);
      if (!Array.isArray(aiCards)) {
        throw new Error('AI response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI response as JSON');
    }
    
    console.log(`📝 Generated ${aiCards.length} cards from AI`);
    console.log(`🐶 First card title check:`, aiCards[0]?.title);
    
    // Save cards to database
    const generatedCards = [];
    
    for (let i = 0; i < aiCards.length && i < maxCards; i++) {
      const aiCard = aiCards[i];
      const category = categories[i % categories.length] || 'market';
      
      const card = {
        user_id: userId,
        category: category,
        title: aiCard.title || `AI Generated ${category} Intelligence`,
        summary: aiCard.summary || aiCard.intelligence_content?.substring(0, 200) || 'AI generated insight',
        intelligence_content: aiCard.intelligence_content || aiCard.summary || 'AI generated content',
        key_findings: aiCard.key_findings || ['AI generated finding'],
        strategic_implications: aiCard.strategic_implications || 'Strategic implications from AI analysis',
        recommended_actions: aiCard.recommended_actions || 'Recommended actions from AI analysis',
        source_reference: `Automation Rule: ${ruleId}`,
        credibility_score: aiCard.credibility_score || (optimizationLevel === 'maximum_quality' ? 9 : 7),
        relevance_score: aiCard.relevance_score || 8,
        tags: aiCard.tags || ['automation', triggerType, category],
        status: 'active'
      };
      
      // Save to database
      const { data, error } = await supabase
        .from('intelligence_cards')
        .insert(card)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating intelligence card:', error);
        continue;
      }
      
      generatedCards.push(data);
      
      // Add to target groups if specified
      if (targetGroups?.length > 0 && data) {
        for (const groupId of targetGroups) {
          await supabase
            .from('intelligence_group_cards')
            .insert({
              group_id: groupId,
              intelligence_card_id: data.id,
              added_by: userId
            });
        }
      }
    }
    
    // Log usage
    await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        feature_used: 'automation',
        request_type: 'automation',
        model_used: 'gpt-4o-mini',
        tokens_used: tokensUsed,
        cost_incurred: cost,
        success: true,
        blueprint_id: null,
        strategy_id: null,
        generation_type: 'intelligence_automation'
      });
    
    console.log(`✅ Successfully created ${generatedCards.length} intelligence cards`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            cardsCreated: generatedCards.length,
            cards: generatedCards,
            tokensUsed: tokensUsed,
            cost: cost,
            systemPromptUsed: finalSystemPrompt
          })
        }
      ]
    };
  } catch (error: any) {
    console.error('🚨 Automation intelligence generation error:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            cardsCreated: 0
          })
        }
      ],
      isError: true
    };
  }
}
