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
        }
      },
      required: ['userId', 'ruleId']
    }
  }
];

export async function handleAnalyzeUrl(args, supabase) {
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
  } catch (error) {
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

export async function handleProcessIntelligenceText(args, supabase) {
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
  } catch (error) {
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

export async function handleGenerateAutomationIntelligence(args, supabase) {
  try {
    const { 
      userId, 
      ruleId, 
      categories = [], 
      maxCards = 5, 
      targetGroups = [],
      optimizationLevel = 'balanced',
      triggerType = 'scheduled'
    } = args;
    
    console.log(`🤖 Generating automation intelligence for user ${userId}, rule ${ruleId}`);
    
    // Build context based on optimization level
    let context = categories?.length > 0 
      ? `Focus on ${categories.join(', ')} intelligence. ` 
      : '';
    
    switch (optimizationLevel) {
      case 'maximum_quality':
        context += 'Provide comprehensive, detailed analysis with high-quality insights.';
        break;
      case 'balanced':
        context += 'Provide good quality insights with balanced detail.';
        break;
      case 'maximum_savings':
        context += 'Provide concise, focused insights optimized for efficiency.';
        break;
    }
    
    // Generate intelligence cards (mock implementation)
    const generatedCards = [];
    const tokensUsed = 500 * maxCards; // Mock token usage
    const cost = tokensUsed * 0.00001; // Mock cost calculation
    
    for (let i = 0; i < maxCards; i++) {
      const category = categories[i % categories.length] || 'market';
      const card = {
        id: `auto-${Date.now()}-${i}`,
        user_id: userId,
        title: `Automated ${category} Intelligence - ${new Date().toLocaleDateString()}`,
        description: `Generated insight for ${category} category`,
        category: category,
        source_type: 'automation',
        source_name: `Automation Rule ${ruleId}`,
        source_reference: `Rule: ${ruleId}`,
        credibility_score: optimizationLevel === 'maximum_quality' ? 9 : 7,
        relevance_score: 8,
        key_insights: [
          `Key insight 1 for ${category}`,
          `Key insight 2 based on ${optimizationLevel} optimization`,
          `Key insight 3 from automated analysis`
        ],
        tags: ['automation', triggerType, category],
        status: 'active',
        created_at: new Date().toISOString()
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
              card_id: data.id,
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
        metadata: {
          rule_id: ruleId,
          trigger_type: triggerType,
          cards_created: generatedCards.length
        }
      });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            cardsCreated: generatedCards.length,
            cards: generatedCards,
            tokensUsed: tokensUsed,
            cost: cost
          })
        }
      ]
    };
  } catch (error) {
    console.error('Automation intelligence generation error:', error);
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