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

/**
 * Extract text content from HTML with improved parsing
 */
function extractTextFromHtml(html: string): { text: string; title: string; description: string } {
  // Remove script and style tags completely
  let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleanHtml = cleanHtml.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  
  // Extract title
  const titleMatch = cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Extract meta description
  const descMatch = cleanHtml.match(/<meta[^>]*name=['"]description['"][^>]*content=['"]([^'"]*)['"]/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Extract main content - prioritize semantic HTML elements
  const contentSelectors = [
    'article', 'main', '.content', '.post', '.article', 
    '.entry-content', '.post-content', '.article-content'
  ];
  
  let mainContent = '';
  for (const selector of contentSelectors) {
    const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i');
    const match = cleanHtml.match(regex);
    if (match && match[1].length > mainContent.length) {
      mainContent = match[1];
    }
  }
  
  // If no semantic content found, use body content
  if (!mainContent) {
    const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    mainContent = bodyMatch ? bodyMatch[1] : cleanHtml;
  }
  
  // Remove remaining HTML tags and clean up
  let text = mainContent
    .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return { text, title, description };
}

/**
 * Validate and normalize URL
 */
function validateAndNormalizeUrl(url: string): string {
  try {
    // Add protocol if missing
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Security checks
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed');
    }
    
    // Block local/private IPs
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
      throw new Error('Access to local/private networks is not allowed');
    }
    
    return urlObj.toString();
  } catch (error: any) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
}

export async function handleAnalyzeUrl(args: any, supabase: any) {
  try {
    const { url, context, targetCategory, targetGroups, userId } = args;
    
    if (!url || !url.trim()) {
      throw new Error('URL is required for analysis');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log(`🔍 Analyzing URL for user ${userId}: ${url}`);
    console.log(`🎯 Context: ${context || 'None provided'}`);
    console.log(`📋 Target Category: ${targetCategory || 'Not specified'}`);
    
    // Validate and normalize URL
    const normalizedUrl = validateAndNormalizeUrl(url);
    console.log(`✅ Normalized URL: ${normalizedUrl}`);
    
    // Fetch URL content with timeout and size limits
    console.log(`🌐 Fetching URL content...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'PINNLO Intelligence Analyzer/2.0 (+https://pinnlo.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    // Check content size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Content too large (max 5MB)');
    }
    
    // Get content type
    const contentType = response.headers.get('content-type') || '';
    console.log(`📄 Content type: ${contentType}`);
    
    let rawContent = await response.text();
    
    // Limit content size after download
    if (rawContent.length > 1024 * 1024) { // 1MB text limit
      rawContent = rawContent.substring(0, 1024 * 1024);
      console.log(`⚠️ Content truncated to 1MB`);
    }
    
    // Extract content based on type
    let extractedText = '';
    let title = '';
    let description = '';
    
    if (contentType.includes('text/html')) {
      const extracted = extractTextFromHtml(rawContent);
      extractedText = extracted.text;
      title = extracted.title;
      description = extracted.description;
    } else if (contentType.includes('application/json')) {
      try {
        const jsonData = JSON.parse(rawContent);
        extractedText = JSON.stringify(jsonData, null, 2);
        title = 'JSON Data';
        description = 'Structured JSON data from API or file';
      } catch (e) {
        extractedText = rawContent;
        title = 'JSON-like Content';
      }
    } else {
      extractedText = rawContent;
      title = 'Text Content';
      description = 'Plain text content';
    }
    
    // Limit extracted text length
    if (extractedText.length > 50000) {
      extractedText = extractedText.substring(0, 50000);
      console.log(`⚠️ Extracted text truncated to 50KB`);
    }
    
    console.log(`📝 Content extracted - Title: "${title}", Text length: ${extractedText.length} chars`);
    
    if (extractedText.length < 100) {
      throw new Error('Insufficient content extracted from URL (minimum 100 characters required)');
    }
    
    // Build AI prompts for analysis
    const systemPrompt = `You are an expert intelligence analyst specializing in extracting strategic insights from web content. Your task is to analyze the provided content and create structured intelligence cards.

Analyze the content thoroughly and extract 2-4 high-quality intelligence insights that would be valuable for strategic decision-making.

Focus on:
- Key trends and market insights
- Competitive intelligence
- Technology developments and implications
- Strategic opportunities and threats
- Actionable recommendations
- Future implications and predictions

Create intelligence cards that are specific, actionable, and strategically relevant.`;

    const userPrompt = `Analyze the following web content and extract strategic intelligence insights:

URL: ${normalizedUrl}
${title ? `Title: ${title}` : ''}
${description ? `Description: ${description}` : ''}
${context ? `\nAnalysis Context: ${context}` : ''}
${targetCategory ? `\n⚠️ IMPORTANT: All cards will be categorized as "${targetCategory}" - do NOT include a category field in your response.` : ''}

--- WEB CONTENT ---
${extractedText}
--- END CONTENT ---

For each intelligence insight, create a JSON object with these exact fields:
- title: (specific, actionable title - max 100 chars)
- summary: (concise overview - max 200 chars)
- intelligence_content: (detailed analysis - max 1000 chars)
- key_findings: (array of 3-5 specific bullet points)
- strategic_implications: (brief strategic impact description)
- recommended_actions: (specific actionable recommendations)
- credibility_score: (integer 1-10 based on source quality)
- relevance_score: (integer 1-10 based on strategic importance)
- tags: (array of relevant keywords for categorization)
${!targetCategory ? '- category: (one of: market, competitor, trends, technology, stakeholder, consumer, risk, opportunities)' : ''}

Return ONLY a JSON object with a "cards" array containing 2-4 intelligence cards. Format: {"cards": [...]}`;

    console.log(`🤖 Calling OpenAI for URL content analysis...`);
    
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
        max_tokens: 6000,
        response_format: { type: "json_object" }
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
    
    // Parse AI response using existing parsing function
    let aiCards;
    try {
      aiCards = parseAIResponse(aiContent);
    } catch (parseError: any) {
      console.error('❌ Failed to parse AI response:', parseError.message);
      console.error('❌ Raw content (first 500 chars):', aiContent.substring(0, 500));
      
      // Emergency fallback: create a single card
      aiCards = [{
        title: title || 'URL Analysis Result',
        summary: description || 'Intelligence extracted from URL analysis',
        intelligence_content: extractedText.substring(0, 800),
        key_findings: ['Content extracted from URL', 'Requires manual review'],
        strategic_implications: 'Manual review recommended for strategic insights',
        recommended_actions: 'Review extracted content and refine analysis',
        credibility_score: 6,
        relevance_score: 6,
        tags: ['url-analysis', 'web-content'],
        category: targetCategory || 'market'
      }];
    }
    
    console.log(`📝 Generated ${aiCards.length} intelligence cards from URL`);
    
    // Save cards to database
    const generatedCards = [];
    const validCategories = ['market', 'competitor', 'trends', 'technology', 'stakeholder', 'consumer', 'risk', 'opportunities'];
    
    for (const aiCard of aiCards) {
      // Use target category or validate AI-suggested category
      let finalCategory = targetCategory;
      if (!finalCategory) {
        finalCategory = validCategories.includes(aiCard.category) ? aiCard.category : 'market';
      }
      
      const card = {
        user_id: userId,
        category: finalCategory,
        title: aiCard.title || 'URL Analysis Result',
        summary: aiCard.summary || aiCard.intelligence_content?.substring(0, 200) || 'Intelligence extracted from URL',
        intelligence_content: aiCard.intelligence_content || extractedText.substring(0, 800),
        key_findings: aiCard.key_findings || ['Extracted from URL analysis'],
        strategic_implications: aiCard.strategic_implications || 'Strategic implications from URL content',
        recommended_actions: aiCard.recommended_actions || 'Further analysis recommended',
        source_reference: `URL Analysis: ${normalizedUrl}${context ? ` (${context})` : ''}`,
        credibility_score: aiCard.credibility_score || 7,
        relevance_score: aiCard.relevance_score || 7,
        tags: aiCard.tags || ['url-analysis', 'web-intelligence'],
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
        feature_used: 'url_analysis',
        request_type: 'url_analysis',
        model_used: 'gpt-4o-mini',
        tokens_used: tokensUsed,
        cost_incurred: cost,
        success: true,
        blueprint_id: null,
        strategy_id: null,
        generation_type: 'url_intelligence_analysis'
      });
    
    console.log(`✅ Successfully created ${generatedCards.length} intelligence cards from URL`);
    
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
            url: normalizedUrl,
            title: title,
            description: description,
            contentLength: extractedText.length
          })
        }
      ]
    };
  } catch (error: any) {
    console.error('🚨 URL analysis error:', error);
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

/**
 * Chunk large text content for processing
 */
function chunkText(text: string, maxChunkSize: number = 15000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  console.log(`🔄 Chunking text: ${text.length} characters into chunks of ~${maxChunkSize} characters`);
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by sentences first to avoid breaking mid-sentence
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the chunk size, start a new chunk
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If we still have chunks that are too large, split them by words
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkSize) {
      finalChunks.push(chunk);
    } else {
      console.log(`⚠️ Chunk still too large (${chunk.length} chars), splitting by words`);
      const words = chunk.split(/\s+/);
      let wordChunk = '';
      
      for (const word of words) {
        if (wordChunk.length + word.length > maxChunkSize && wordChunk.length > 0) {
          finalChunks.push(wordChunk.trim());
          wordChunk = word;
        } else {
          wordChunk += (wordChunk ? ' ' : '') + word;
        }
      }
      
      if (wordChunk.trim()) {
        finalChunks.push(wordChunk.trim());
      }
    }
  }
  
  console.log(`✅ Text chunked into ${finalChunks.length} chunks`);
  return finalChunks;
}

/**
 * Process text chunks and combine results
 */
async function processTextChunks(
  chunks: string[], 
  systemPrompt: string, 
  baseUserPrompt: string, 
  isInterview: boolean,
  context?: string,
  targetCategory?: string
): Promise<{cards: any[], totalTokens: number}> {
  console.log(`🔄 Processing ${chunks.length} text chunks`);
  
  const allCards: any[] = [];
  let totalTokens = 0;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`📝 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    
    // Create chunk-specific prompt
    const chunkPrompt = isInterview ? 
      `Analyze this interview transcript chunk and extract 3-5 distinct strategic insights:

--- INTERVIEW TRANSCRIPT CHUNK ${i + 1}/${chunks.length} ---
${chunk}
--- END CHUNK ---

${context ? `\nAdditional Context: ${context}` : ''}
${targetCategory ? `\n⚠️ IMPORTANT: All cards will be categorized as "${targetCategory}" - do NOT include a category field in your response.` : ''}

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
${!targetCategory ? '- category: (one of: market, competitor, trends, technology, stakeholder, consumer, risk, opportunities)' : ''}

This is chunk ${i + 1} of ${chunks.length}. Return ONLY a JSON object with a "cards" array containing 3-5 intelligence cards. Format: {"cards": [...]}` :
      `Process this text content chunk and extract 2-3 high-quality intelligence cards:

--- TEXT CONTENT CHUNK ${i + 1}/${chunks.length} ---
${chunk}
--- END CHUNK ---

${context ? `\nAdditional Context: ${context}` : ''}
${targetCategory ? `\n⚠️ IMPORTANT: All cards will be categorized as "${targetCategory}" - do NOT include a category field in your response.` : ''}

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
${!targetCategory ? '- category: (one of: market, competitor, trends, technology, stakeholder, consumer, risk, opportunities)' : ''}

This is chunk ${i + 1} of ${chunks.length}. Return ONLY a JSON object with a "cards" array containing 2-3 intelligence cards. Format: {"cards": [...]}`;
    
    try {
      // Call OpenAI for this chunk
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: chunkPrompt }
          ],
          temperature: 0.6,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        console.error(`❌ OpenAI API error for chunk ${i + 1}: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      const content = result.choices[0].message.content;
      totalTokens += result.usage.total_tokens;
      
      // Parse the chunk response
      const chunkCards = parseAIResponse(content);
      allCards.push(...chunkCards);
      
      console.log(`✅ Chunk ${i + 1} processed: ${chunkCards.length} cards extracted`);
      
    } catch (error) {
      console.error(`❌ Error processing chunk ${i + 1}:`, error);
      continue;
    }
  }
  
  console.log(`✅ All chunks processed: ${allCards.length} total cards, ${totalTokens} tokens used`);
  return { cards: allCards, totalTokens };
}

/**
 * Enhanced JSON parsing function with comprehensive error handling and format detection
 */
function parseAIResponse(content: string): any[] {
  console.log('🔧 Starting enhanced JSON parsing...');
  console.log('📝 Content preview:', content.substring(0, 300) + '...');
  console.log('📏 Content length:', content.length);
  
  // Step 1: Detect and handle double-escaped JSON
  let cleanContent = content.trim();
  
  // Check for double-escaped JSON (common issue)
  if (cleanContent.includes('\\"') || cleanContent.includes('\\n')) {
    console.log('🔄 Detected double-escaped JSON, unescaping...');
    try {
      // Attempt to unescape the content
      cleanContent = cleanContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      console.log('✅ Unescaped double-escaped JSON');
    } catch (unescapeError) {
      console.log('⚠️ Failed to unescape, continuing with original content');
    }
  }
  
  // Step 2: Remove markdown code blocks
  if (cleanContent.includes('```')) {
    console.log('🧹 Removing markdown code blocks...');
    
    // Method 1: Extract between first { or [ and last } or ]
    const firstBraceIndex = Math.min(
      cleanContent.indexOf('{') === -1 ? Infinity : cleanContent.indexOf('{'),
      cleanContent.indexOf('[') === -1 ? Infinity : cleanContent.indexOf('[')
    );
    const lastBraceIndex = Math.max(
      cleanContent.lastIndexOf('}'),
      cleanContent.lastIndexOf(']')
    );
    
    if (firstBraceIndex !== Infinity && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
      cleanContent = cleanContent.substring(firstBraceIndex, lastBraceIndex + 1);
      console.log('✅ Extracted content between braces/brackets');
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
      
      console.log('✅ Progressive markdown cleanup applied');
    }
  }
  
  // Step 3: Remove non-JSON content from start and end
  cleanContent = cleanContent
    .replace(/^[^\[{]*/, '') // Remove anything before first [ or {
    .replace(/[^\]}]*$/, '') // Remove anything after last ] or }
    .trim();
  
  // Step 4: Auto-detect format and handle truncation
  let formatDetected = 'unknown';
  const startsWithArray = cleanContent.startsWith('[');
  const startsWithObject = cleanContent.startsWith('{');
  
  if (startsWithArray) {
    formatDetected = 'array';
    console.log('🔍 Detected array format');
  } else if (startsWithObject) {
    formatDetected = 'object';
    console.log('🔍 Detected object format');
  }
  
  // Check for truncation
  const expectedClose = startsWithArray ? ']' : '}';
  const hasProperClose = cleanContent.endsWith(expectedClose);
  
  if (!hasProperClose) {
    console.log('⚠️ Response appears to be truncated - missing closing bracket/brace');
    
    // Try to add missing closing bracket/brace
    if (startsWithArray) {
      cleanContent = cleanContent.trim().replace(/,\s*$/, '') + ']';
      console.log('🔧 Added missing closing bracket for array');
    } else if (startsWithObject) {
      cleanContent = cleanContent.trim().replace(/,\s*$/, '') + '}';
      console.log('🔧 Added missing closing brace for object');
    }
  }
  
  // Step 5: Fix common JSON issues
  cleanContent = cleanContent
    .replace(/,\s*}/g, '}') // Remove trailing commas in objects
    .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
    .replace(/}\s*,\s*$/g, '}') // Remove trailing comma after last object
    .replace(/]\s*,\s*$/g, ']') // Remove trailing comma after last array
    .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas before closing brackets
    .replace(/([{,]\s*)"([^"]*)":\s*"([^"]*)"([^",}\]]*)/g, '$1"$2": "$3"') // Fix unescaped quotes in strings
    .replace(/\\n/g, '\\\\n') // Fix newline escaping
    .replace(/\\t/g, '\\\\t') // Fix tab escaping
    .replace(/\\r/g, '\\\\r'); // Fix carriage return escaping
  
  console.log('🧹 Final cleaned content preview:', cleanContent.substring(0, 300) + '...');
  
  // Step 6: Multiple parsing strategies
  let parsedResult;
  let parseStrategy = 'unknown';
  
  try {
    // Strategy 1: Direct parsing
    parsedResult = JSON.parse(cleanContent);
    parseStrategy = 'direct';
    console.log('✅ Direct JSON parsing successful');
  } catch (directError) {
    console.log('⚠️ Direct parsing failed:', (directError as Error).message);
    console.log('⚠️ Trying repair strategies...');
    
    try {
      // Strategy 2: Fix unescaped quotes in string values
      let repairedContent = cleanContent.replace(/"([^"]*)":\s*"([^"]*?)"/g, (match, key, value) => {
        const escapedValue = value.replace(/"/g, '\\"');
        return `"${key}": "${escapedValue}"`;
      });
      
      parsedResult = JSON.parse(repairedContent);
      parseStrategy = 'quote_repair';
      console.log('✅ Quote repair parsing successful');
    } catch (quoteError) {
      console.log('⚠️ Quote repair failed:', (quoteError as Error).message);
      
      try {
        // Strategy 3: Extract valid JSON objects from malformed content
        const objectMatches = cleanContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
        if (objectMatches && objectMatches.length > 0) {
          const validObjects = [];
          console.log(`🔍 Found ${objectMatches.length} potential JSON objects`);
          
          for (const match of objectMatches) {
            try {
              const obj = JSON.parse(match);
              validObjects.push(obj);
            } catch (objError) {
              console.log('⚠️ Skipping malformed object:', match.substring(0, 100) + '...');
            }
          }
          
          if (validObjects.length > 0) {
            parsedResult = { cards: validObjects };
            parseStrategy = 'object_extraction';
            console.log(`✅ Extracted ${validObjects.length} valid objects from malformed content`);
          } else {
            throw new Error('No valid objects found in content');
          }
        } else {
          throw new Error('No JSON objects found in content');
        }
      } catch (extractError) {
        console.error('❌ All parsing strategies failed');
        console.error('❌ Original error:', (directError as Error).message);
        console.error('❌ Quote repair error:', (quoteError as Error).message);
        console.error('❌ Extract error:', (extractError as Error).message);
        console.error('❌ Content causing issues:', cleanContent.substring(0, 500) + '...');
        throw new Error(`JSON parsing failed after all strategies: ${(directError as Error).message}`);
      }
    }
  }
  
  // Step 7: Extract cards array from response with flexible format handling
  let cards;
  if (Array.isArray(parsedResult)) {
    cards = parsedResult;
    console.log(`✅ Found array format response with ${cards.length} cards (${parseStrategy})`);
  } else if (parsedResult && parsedResult.cards && Array.isArray(parsedResult.cards)) {
    cards = parsedResult.cards;
    console.log(`✅ Found object format response with ${cards.length} cards (${parseStrategy})`);
  } else if (parsedResult && typeof parsedResult === 'object') {
    // Check if it's a single card object and wrap it in an array
    if (parsedResult.title || parsedResult.insight) {
      cards = [parsedResult];
      console.log(`✅ Found single card object, wrapped in array (${parseStrategy})`);
    } else {
      console.error('❌ Parsed result structure:', JSON.stringify(parsedResult, null, 2));
      throw new Error('Response is not in expected format (array, object with cards array, or single card object)');
    }
  } else {
    console.error('❌ Parsed result:', parsedResult);
    throw new Error('Response is not in expected format (array or object with cards array)');
  }
  
  // Step 8: Validate card structure
  const validCards = cards.filter((card: any) => {
    if (!card || typeof card !== 'object') return false;
    // Check if it has essential fields (title or insight)
    return card.title || card.insight || card.summary;
  });
  
  if (validCards.length !== cards.length) {
    console.log(`⚠️ Filtered out ${cards.length - validCards.length} invalid cards`);
  }
  
  console.log(`✅ Successfully parsed ${validCards.length} valid cards using ${parseStrategy} strategy`);
  return validCards;
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

Return ONLY a JSON object with a "cards" array containing at least 10 intelligence cards. Format: {"cards": [...]}`;
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

Return ONLY a JSON object with a "cards" array containing the intelligence cards. Format: {"cards": [...]}`;
    }

    console.log(`🤖 Calling OpenAI for text processing...`);
    
    // Check if text is too large and needs chunking
    let aiCards;
    let tokensUsed = 0;
    let cost = 0;
    
    if (text.length > 15000) {
      console.log(`📏 Text is large (${text.length} chars), using chunking approach`);
      
      // Chunk the text
      const chunks = chunkText(text, 15000);
      
      // Process chunks
      const chunkResults = await processTextChunks(
        chunks, 
        systemPrompt, 
        userPrompt, 
        isInterview, 
        context, 
        userSelectedCategory
      );
      
      aiCards = chunkResults.cards;
      tokensUsed = chunkResults.totalTokens;
      cost = tokensUsed * 0.00001;
      
      console.log(`✅ Chunked processing complete: ${aiCards.length} cards from ${chunks.length} chunks`);
      
    } else {
      console.log(`📏 Text size OK (${text.length} chars), using single request`);
      
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
          max_tokens: 8000, // Increased from 3000 to handle larger responses
          response_format: { type: "json_object" } // Ensure JSON format
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status} ${await openaiResponse.text()}`);
      }

      const openaiResult = await openaiResponse.json();
      const aiContent = openaiResult.choices[0].message.content;
      tokensUsed = openaiResult.usage.total_tokens;
      cost = tokensUsed * 0.00001; // Approximate cost for gpt-4o-mini
      
      console.log(`✨ OpenAI response received. Tokens: ${tokensUsed}, Cost: ${cost.toFixed(4)}`);
      
      // Parse AI response using comprehensive parsing function
      try {
        aiCards = parseAIResponse(aiContent);
      } catch (parseError: any) {
        console.error('❌ MCP Failed to parse AI response with comprehensive parser.');
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

Return EXACTLY 10 or more intelligence cards as a JSON object with a "cards" array. Format: {"cards": [...]}`;
        
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
            max_tokens: 8000, // Increased to match initial request
            response_format: { type: "json_object" } // Ensure JSON format
          })
        });
        
        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          const retryContent = retryResult.choices[0].message.content;
          const additionalTokens = retryResult.usage.total_tokens;
          
          try {
            const retryCards = parseAIResponse(retryContent);
            
            if (retryCards.length >= minimumCards) {
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

Return ONLY a JSON object with a "cards" array containing ${maxCards} cards. Format: {"cards": [...]}`;

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
      max_tokens: optimizationLevel === 'maximum_quality' ? 8000 : 
                 optimizationLevel === 'balanced' ? 6000 : 4000,
      response_format: { type: "json_object" } // Ensure JSON format
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
    
    // Parse AI response using comprehensive parsing function
    let aiCards;
    try {
      aiCards = parseAIResponse(aiContent);
    } catch (parseError: any) {
      console.error('Failed to parse AI response:', aiContent);
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
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
