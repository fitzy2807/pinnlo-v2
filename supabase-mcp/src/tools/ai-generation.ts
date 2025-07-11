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
        type: { type: 'string' },
        userId: { type: 'string' }
      },
      required: ['text', 'userId']
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
    const { text, context, type, targetCategory, targetGroups, userId } = args;
    
    if (!text || !text.trim()) {
      throw new Error('Text content is required for processing');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log(`🔍 Processing intelligence text for user ${userId}`);
    console.log(`📝 Text length: ${text.length} characters`);
    console.log(`🎯 Context: ${context || 'None provided'}`);
    console.log(`📋 Type: ${type || 'General text'}`);
    
    console.log(`🎯 Target Category from user: ${args.targetCategory || 'NONE PROVIDED'}`);
    console.log(`🗂️ Target Groups from user: ${args.targetGroups ? JSON.stringify(args.targetGroups) : 'NONE PROVIDED'}`);
    
    // EMERGENCY FIX: If targetCategory is undefined but we know user is selecting from dropdown,
    // default to 'stakeholder' category to prevent database errors
    const userSelectedCategory = args.targetCategory || 'stakeholder';  // Default to stakeholder
    console.log(`🚑 EMERGENCY: Using category = ${userSelectedCategory}`);
    
    // Check if this is likely an interview transcript
    const isInterview = type === 'interview' || 
                       text.toLowerCase().includes('interviewer') ||
                       text.toLowerCase().includes('interviewee') ||
                       /\b(q:|a:|question:|answer:)/i.test(text) ||
                       text.length > 2000; // Long content likely to be transcript
    
    const minimumCards = isInterview ? 10 : 3; // Minimum 10 for interviews, 3 for other content
    
    console.log(`🎬 Content identified as ${isInterview ? 'interview transcript' : 'general text'}, targeting ${minimumCards} minimum cards`);
    
    let systemPrompt, userPrompt;
    
    if (isInterview) {
      // Enhanced system prompt for interview transcripts
      systemPrompt = `You are a strategic analyst AI working inside a business planning platform. Your role is to extract valuable, context-rich insights from interview transcript chunks.

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
- If you find fewer obvious insights, include extrapolated or adjacent insights that are implied but not stated directly
- Combine weaker signals into synthesized, useful insights if needed`;
      
      userPrompt = `Analyze this interview transcript and extract **at least 10 distinct strategic insights**:

--- INTERVIEW TRANSCRIPT ---
${text}
--- END TRANSCRIPT ---

${context ? `\nAdditional Context: ${context}` : ''}

${args.targetCategory ? `\n⚠️ IMPORTANT: All cards will be categorized as "${args.targetCategory}" - do NOT include a category field in your response.` : ''}

For each insight, create a JSON object with these exact fields:
- insight: (clear, actionable summary - 1-2 sentences)
- theme: (strategic category like Safety, Workforce, Automation, Operations, etc.)
- quoted_evidence: (actual quote or paraphrase from stakeholder)
- opportunity: (what could be explored, automated, or solved)
- stakeholder_motivation: (why this matters to them - explicit or inferred)
- title: (specific, actionable title for the intelligence card)
- summary: (concise overview - max 200 chars)
- intelligence_content: (detailed analysis incorporating the insight - max 1000 chars)
- key_findings: (array of 3-5 specific bullet points)
- strategic_implications: (brief strategic impact description)
- recommended_actions: (specific actionable recommendations)
- credibility_score: (integer 1-10 based on source quality)
- relevance_score: (integer 1-10 based on strategic importance)
- tags: (array of relevant keywords for categorization)
${!args.targetCategory ? '- category: (one of: market, competitor, trends, technology, stakeholder, consumer, risk, opportunities)' : ''}

Return ONLY a JSON array of at least 10 intelligence cards. No additional text or formatting.`;
    } else {
      // Standard system prompt for general text
      systemPrompt = `You are an expert intelligence analyst. Your task is to process raw text content and extract structured, actionable intelligence insights.

Analyze the provided text and create intelligence cards that capture:
- Key strategic insights and implications
- Market trends and opportunities
- Competitive intelligence
- Technological developments
- Risk factors and mitigation strategies
- Actionable recommendations

Focus on quality over quantity. Extract only the most valuable and actionable intelligence.`;
      
      userPrompt = `Process the following ${type || 'text'} content and extract 3-5 high-quality intelligence cards:

--- TEXT CONTENT ---
${text}
--- END CONTENT ---

${context ? `\nAdditional Context: ${context}` : ''}

${args.targetCategory ? `\n⚠️ IMPORTANT: All cards will be categorized as "${args.targetCategory}" - do NOT include a category field in your response.` : ''}

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
${!args.targetCategory ? '- category: (one of: market, competitor, trends, technology, stakeholder, consumer, risk, opportunities)' : ''}

Return ONLY a JSON array of intelligence cards. No additional text or formatting.`;
    }

    console.log(`🤖 Calling OpenAI for text processing...`);
    
    // Call OpenAI API
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
        max_tokens: 3000
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${await openaiResponse.text()}`);
    }

    const openaiResult = await openaiResponse.json();
    const aiContent = openaiResult.choices[0].message.content;
    const tokensUsed = openaiResult.usage.total_tokens;
    const cost = tokensUsed * 0.00001; // Approximate cost for gpt-4o-mini
    
    console.log(`✨ OpenAI response received. Tokens: ${tokensUsed}, Cost: ${cost.toFixed(4)}`);
    
    // Parse AI response (handle markdown code blocks)
    let aiCards;
    try {
      // Remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      
      console.log('🧹 MCP Raw AI content preview:', aiContent.substring(0, 300) + '...');
      
      // Enhanced markdown cleanup
      if (cleanContent.includes('```')) {
        console.log('🔍 MCP Detected markdown formatting, cleaning...');
        
        // Method 1: Extract between first [ and last ]
        const firstBrace = cleanContent.indexOf('[');
        const lastBrace = cleanContent.lastIndexOf(']');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
          console.log('🎯 MCP Extracted JSON boundaries');
        } else {
          // Method 2: Progressive cleanup
          cleanContent = cleanContent
            .replace(/^```(?:json)?\s*\n?/gmi, '')
            .replace(/\n?```\s*$/gmi, '')
            .replace(/```\s*$/gmi, '')
            .replace(/^\s*```\s*/gmi, '')
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          
          // Method 3: Find array start/end more aggressively
          const arrayMatch = cleanContent.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            cleanContent = arrayMatch[0];
            console.log('🎯 MCP Found JSON array via regex');
          }
        }
      }
      
      // Remove any remaining non-JSON content
      cleanContent = cleanContent
        .replace(/^[^\[]*/, '') // Remove anything before first [
        .replace(/[^\]]*$/, '') // Remove anything after last ]
        .trim();
      
      console.log('🧹 MCP Final cleaned content preview:', cleanContent.substring(0, 200) + '...');
      
      aiCards = JSON.parse(cleanContent);
      if (!Array.isArray(aiCards)) {
        throw new Error('AI response is not an array');
      }
      
      console.log('✅ MCP Successfully parsed', aiCards.length, 'cards from AI response');
    } catch (parseError) {
      console.error('❌ MCP Failed to parse AI response.');
      console.error('❌ MCP Raw content (first 800 chars):', aiContent.substring(0, 800));
      console.error('❌ MCP Parse error:', parseError.message);
      
      // Emergency fallback: try to create at least one card from the response
      console.log('🚨 MCP Attempting emergency card creation...');
      aiCards = [{
        title: 'Processing Error - Manual Review Required',
        summary: 'AI response could not be parsed automatically',
        intelligence_content: aiContent.substring(0, 800),
        key_findings: ['AI response parsing failed', 'Manual review needed'],
        strategic_implications: 'Review AI response format and parsing logic',
        recommended_actions: 'Check AI response formatting and update parsing rules',
        credibility_score: 3,
        relevance_score: 3,
        tags: ['parsing-error', 'ai-response'],
        category: 'technology'
      }];
    }
    
    console.log(`📝 Generated ${aiCards.length} intelligence cards from text`);
    
    // Check if we meet minimum card requirements
    if (aiCards.length < minimumCards) {
      console.log(`⚠️ Only ${aiCards.length} cards generated, minimum required: ${minimumCards}`);
      
      if (isInterview) {
        // For interviews, try again with more aggressive extraction
        console.log(`🔄 Retrying with enhanced extraction for interview transcript...`);
        
        const enhancedPrompt = `The previous analysis only generated ${aiCards.length} insights, but this interview transcript should yield at least 10 insights. Please re-analyze more thoroughly:

--- INTERVIEW TRANSCRIPT ---
${text}
--- END TRANSCRIPT ---

Extract insights from:
- Direct statements and opinions
- Implied concerns or motivations
- Process inefficiencies mentioned
- Technology gaps or opportunities
- Workflow challenges
- Resource constraints
- Quality or safety concerns
- Future needs or aspirations
- Competitive pressures
- Regulatory or compliance issues

Even seemingly minor comments can reveal strategic insights. For each insight, create a complete JSON object as specified above.

Return EXACTLY 10 or more intelligence cards as a JSON array.`;
        
        const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: enhancedPrompt }
            ],
            temperature: 0.8, // Higher creativity for more insights
            max_tokens: 4000
          })
        });
        
        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          const retryContent = retryResult.choices[0].message.content;
          const additionalTokens = retryResult.usage.total_tokens;
          
          try {
            const retryCards = JSON.parse(retryContent);
            if (Array.isArray(retryCards) && retryCards.length >= minimumCards) {
              console.log(`✅ Retry successful: ${retryCards.length} cards generated`);
              aiCards = retryCards;
              tokensUsed += additionalTokens;
              cost = tokensUsed * 0.00001;
            }
          } catch (retryParseError) {
            console.log(`⚠️ Retry parse failed, continuing with original ${aiCards.length} cards`);
          }
        }
      }
    }
    
    // Save cards to database
    const generatedCards = [];
    
    // Category mapping for database constraints
    const categoryMapping: { [key: string]: string } = {
      'workforce': 'stakeholder',
      'customer': 'consumer',
      'customers': 'consumer',
      'risks': 'risk',           // ← This should catch it
      'safety': 'risk',
      'automation': 'technology',
      'operations': 'market',
      'operational': 'market',
      'integration': 'technology',
      'tech': 'technology',
      // Add more edge cases
      'regulatory': 'risk',
      'compliance': 'risk',
      'process': 'market',
      'processes': 'market'
    };
    
    // Valid database categories
    const validCategories = ['market', 'competitor', 'trends', 'technology', 'stakeholder', 'consumer', 'risk', 'opportunities'];
    
    for (const aiCard of aiCards) {
      // FORCE user category - use emergency fallback if needed
      const finalCategory = userSelectedCategory;  // ALWAYS use user choice or fallback
      console.log(`🚫 FORCING category: ${finalCategory} (user: ${args.targetCategory}, fallback: stakeholder)`);
      
      const card = {
        user_id: userId,
        category: finalCategory,  // This will NEVER fail database constraints
        title: aiCard.title || aiCard.insight || 'Processed Intelligence',
        summary: aiCard.summary || aiCard.intelligence_content?.substring(0, 200) || 'Intelligence extracted from text',
        intelligence_content: aiCard.intelligence_content || aiCard.insight || 'Intelligence content from processed text',
        key_findings: aiCard.key_findings || [aiCard.quoted_evidence || 'Key finding from processed text'],
        strategic_implications: aiCard.strategic_implications || 'Strategic implications from text analysis',
        recommended_actions: aiCard.recommended_actions || aiCard.opportunity || 'Recommended actions from text analysis',
        source_reference: `${isInterview ? 'Interview Transcript' : 'Text Processing'} - ${type || 'General'}${context ? ` (${context})` : ''}`,
        credibility_score: aiCard.credibility_score || (isInterview ? 8 : 7),
        relevance_score: aiCard.relevance_score || 8,
        tags: aiCard.tags || (isInterview ? 
          ['interview', 'transcript', aiCard.theme?.toLowerCase() || 'strategic', type || 'general'] : 
          ['text-processing', type || 'general']),
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
      if (targetGroups && Array.isArray(targetGroups) && targetGroups.length > 0 && data) {
        console.log(`🗂️ Adding card ${data.id} to ${targetGroups.length} groups`);
        for (const groupId of targetGroups) {
          try {
            await supabase
              .from('intelligence_group_cards')
              .insert({
                group_id: groupId,
                intelligence_card_id: data.id,
                added_by: userId
              });
            console.log(`✅ Added card to group ${groupId}`);
          } catch (groupError) {
            console.error(`❌ Failed to add card to group ${groupId}:`, groupError);
          }
        }
      }
    }
    
    // Log usage
    await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        feature_used: 'intelligence_text_processing',
        request_type: 'text_processing',
        model_used: 'gpt-4o-mini',
        tokens_used: tokensUsed,
        cost_incurred: cost,
        success: true,
        blueprint_id: null,
        strategy_id: null,
        generation_type: 'intelligence_text_processing'
      });
    
    console.log(`✅ Successfully created ${generatedCards.length} intelligence cards from text`);
    
    // Log specific metrics for interviews
    if (isInterview) {
      console.log(`🎬 Interview processing complete:`);
      console.log(`📊 Target: ${minimumCards} cards, Generated: ${generatedCards.length}`);
      console.log(`💰 Cost: ${cost.toFixed(4)} (${tokensUsed} tokens)`);
      console.log(`📏 Transcript length: ${text.length} characters`);
    }
    
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
            textLength: text.length,
            processingType: type || 'general',
            isInterview: isInterview,
            minimumCardsMet: generatedCards.length >= minimumCards,
            targetCards: minimumCards
          })
        }
      ]
    };
  } catch (error: any) {
    console.error('🚨 Text processing error:', error);
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
