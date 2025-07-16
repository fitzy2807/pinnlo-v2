import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Lazy initialization of clients
let openai: OpenAI | null = null;
let supabase: any = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// Simple in-memory cache for context
const contextCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request queuing to prevent parallel requests for same card
const activeRequests = new Map<string, Promise<any>>();

// Tool definition following existing pattern from ai-generation.ts
export const editModeGeneratorTools = [
  {
    name: 'generate_edit_mode_content',
    description: 'Generate content for all fields in a card using AI with context awareness',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: { type: 'string', description: 'ID of the card being edited' },
        blueprintType: { type: 'string', description: 'Blueprint type from registry' },
        cardTitle: { type: 'string', description: 'Title of the card' },
        strategyId: { type: 'string', description: 'Strategy ID for context' },
        userId: { type: 'string', description: 'User ID' },
        existingFields: { 
          type: 'object', 
          description: 'Existing field values to enhance',
          additionalProperties: true 
        }
      },
      required: ['cardId', 'blueprintType', 'cardTitle', 'userId']
    }
  }
];

// Function to get blueprint field definitions
async function getBlueprintFields(blueprintType: string): Promise<string> {
  try {
    // Map blueprint types to their actual config file names
    const blueprintFileMap: Record<string, string> = {
      'features': 'feature',
      'epics': 'epic',
      'personas': 'persona',
      'valuePropositions': 'valueProposition',
      'workstreams': 'workstream',
      'userJourneys': 'userJourney',
      'experienceSections': 'experienceSection',
      'serviceBlueprints': 'serviceBlueprint',
      'organisationalCapabilities': 'organisationalCapability',
      'gtmPlays': 'gtmPlay',
      'techRequirements': 'technicalRequirement',
      'strategicContext': 'strategicContext',
      'customerExperience': 'customerJourney',
      'swot-analysis': 'swot',
      'competitive-analysis': 'competitiveAnalysis',
      'business-model': 'businessModel',
      'go-to-market': 'goToMarket',
      'risk-assessment': 'riskAssessment',
      'roadmap': 'roadmap',
      'kpis': 'kpi',
      'financial-projections': 'financialProjections',
      'cost-driver': 'costDriver',
      'revenue-driver': 'revenueDriver'
    };
    
    // Get the actual config file name
    const configFileName = blueprintFileMap[blueprintType] || blueprintType;
    const blueprintPath = path.join(process.cwd(), '..', 'src', 'components', 'blueprints', 'configs', `${configFileName}Config.ts`);
    
    console.log('Looking for blueprint config at:', blueprintPath);
    console.log('Blueprint file exists:', fs.existsSync(blueprintPath));
    
    if (fs.existsSync(blueprintPath)) {
      const fileContent = fs.readFileSync(blueprintPath, 'utf8');
      
      // Extract field definitions from the file - use greedy match to capture all fields
      const fieldsMatch = fileContent.match(/fields:\s*\[([\s\S]*)\],?\s*defaultValues/);
      console.log('Fields match found:', !!fieldsMatch);
      if (fieldsMatch) {
        // Parse the fields and format them for the prompt
        const fieldsText = fieldsMatch[1];
        console.log('Fields text length:', fieldsText.length);
        
        // Use a more robust approach to parse the field definitions
        // Find all field boundaries by looking for 'id:' patterns
        const fieldSeparatorRegex = /\s*\{\s*id:\s*['"`]([^'"`]+)['"`]/g;
        const fieldBoundaries = [];
        let match;
        
        while ((match = fieldSeparatorRegex.exec(fieldsText)) !== null) {
          fieldBoundaries.push({
            id: match[1],
            startIndex: match.index,
            matchLength: match[0].length
          });
        }
        
        console.log('Found field boundaries:', fieldBoundaries.length);
        
        const fieldDescriptions = [];
        
        for (let i = 0; i < fieldBoundaries.length; i++) {
          const currentField = fieldBoundaries[i];
          const nextField = fieldBoundaries[i + 1];
          
          const fieldStartIndex = currentField.startIndex;
          const fieldEndIndex = nextField ? nextField.startIndex : fieldsText.length;
          const fieldText = fieldsText.substring(fieldStartIndex, fieldEndIndex);
          
          // Extract field properties
          const nameMatch = fieldText.match(/name:\s*['"`]([^'"`]+)['"`]/);
          const typeMatch = fieldText.match(/type:\s*['"`]([^'"`]+)['"`]/);
          const requiredMatch = fieldText.match(/required:\s*(true|false)/);
          const descriptionMatch = fieldText.match(/description:\s*['"`]([^'"`]+)['"`]/);
          const placeholderMatch = fieldText.match(/placeholder:\s*['"`]([^'"`]+)['"`]/);
          
          if (nameMatch && typeMatch) {
            const fieldType = typeMatch[1];
            const isRequired = requiredMatch ? requiredMatch[1] === 'true' : false;
            const description = descriptionMatch ? descriptionMatch[1] : '';
            const placeholder = placeholderMatch ? placeholderMatch[1] : '';
            
            // Map field types to expected JSON formats
            let jsonType = 'string';
            let example = '""';
            
            switch (fieldType) {
              case 'array':
                jsonType = 'array of strings';
                example = '["item1", "item2"]';
                break;
              case 'enum':
                jsonType = 'string (enum)';
                example = '"option1"';
                break;
              case 'textarea':
                jsonType = 'string (multiline)';
                example = '"Multi-line text content"';
                break;
              case 'number':
                jsonType = 'number';
                example = '0';
                break;
              case 'boolean':
                jsonType = 'boolean';
                example = 'true';
                break;
              default:
                jsonType = 'string';
                example = '""';
            }
            
            const fieldDesc = `- ${currentField.id}: ${nameMatch[1]} (${jsonType}) ${isRequired ? '[REQUIRED]' : '[OPTIONAL]'} - ${description || placeholder || 'No description'} - Example: ${example}`;
            fieldDescriptions.push(fieldDesc);
          }
        }
        
        console.log('Parsed field descriptions:', fieldDescriptions.length);
        
        if (fieldDescriptions.length > 0) {
          return fieldDescriptions.join('\n');
        }
      }
    }
    
    // Fallback: Return basic field structure
    return `- title: Title (string) [REQUIRED] - Card title
- description: Description (string) [REQUIRED] - Card description
- tags: Tags (array of strings) [OPTIONAL] - Relevant tags
- strategicAlignment: Strategic Alignment (string) [OPTIONAL] - How this aligns with strategy`;
    
  } catch (error) {
    console.error('Error reading blueprint fields:', error);
    return `- title: Title (string) [REQUIRED] - Card title
- description: Description (string) [REQUIRED] - Card description
- tags: Tags (array of strings) [OPTIONAL] - Relevant tags`;
  }
}

// Strategy detection function - Agent 0 in the sequence
async function detectCurrentStrategy(userId: string, cardId: string, blueprintType: string): Promise<string | null> {
  try {
    console.log('=== DETECTING STRATEGY CONTEXT ===');
    console.log('Detecting strategy for user:', userId, 'card:', cardId, 'blueprint:', blueprintType);
    
    // Method 1: Check user's most recent strategy activity
    const { data: recentCards, error: recentError } = await getSupabaseClient()
      .from('cards')
      .select('strategy_id')
      .eq('created_by', userId)
      .not('strategy_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (!recentError && recentCards && recentCards.length > 0) {
      const strategyId = recentCards[0].strategy_id;
      console.log('✅ Found strategy from recent card activity:', strategyId);
      return strategyId;
    }
    
    // Method 2: Check user's most recently accessed strategy
    const { data: recentStrategies, error: strategyError } = await getSupabaseClient()
      .from('strategies')
      .select('id')
      .eq('userId', userId)
      .order('updatedAt', { ascending: false })
      .limit(1);
    
    if (!strategyError && recentStrategies && recentStrategies.length > 0) {
      const strategyId = recentStrategies[0].id;
      console.log('✅ Found strategy from recent strategy access:', strategyId);
      return strategyId;
    }
    
    // Method 3: Check for strategies created in the last 24 hours (active session)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: activeStrategies, error: activeError } = await getSupabaseClient()
      .from('strategies')
      .select('id')
      .eq('userId', userId)
      .gte('updatedAt', oneDayAgo)
      .order('updatedAt', { ascending: false })
      .limit(1);
    
    if (!activeError && activeStrategies && activeStrategies.length > 0) {
      const strategyId = activeStrategies[0].id;
      console.log('✅ Found strategy from recent activity (24h):', strategyId);
      return strategyId;
    }
    
    console.log('❌ No strategy context detected - will continue without context');
    return null;
    
  } catch (error) {
    console.error('Error detecting strategy context:', error);
    return null;
  }
}

// Blueprint type mapping function (matches the registry mappings)
function mapBlueprintType(blueprintType: string): string {
  const mappings: Record<string, string> = {
    'strategic-context': 'strategicContext',
    'value-proposition': 'valuePropositions',
    'customer-journey': 'customerExperience',
    'personas': 'personas',
    'okrs': 'okrs',
    'kpis': 'kpis',
    'workstream': 'workstreams',
    'epic': 'epics',
    'feature': 'features',
    'user-journey': 'userJourneys',
    'experience-section': 'experienceSections',
    'service-blueprint': 'serviceBlueprints',
    'organisational-capability': 'organisationalCapabilities',
    'gtm-play': 'gtmPlays',
    'tech-requirements': 'techRequirements',
    'prd': 'features',
    'technical-requirement': 'techRequirements',
    'technical-requirement-structured': 'techRequirements',
    'task-list': 'features'
  };
  
  return mappings[blueprintType] || blueprintType;
}

// Handler function following existing pattern
export async function handleGenerateEditModeContent(args: any) {
  const { cardId, blueprintType, cardTitle, strategyId, userId, existingFields = {} } = args;
  
  console.log('=== handleGenerateEditModeContent START ===');
  console.log('Arguments:', { cardId, blueprintType, cardTitle, strategyId, userId });
  
  // Map blueprint type to match database naming
  const mappedBlueprintType = mapBlueprintType(blueprintType);
  console.log('Blueprint type mapping:', { original: blueprintType, mapped: mappedBlueprintType });
  
  // Check if request already in progress
  const requestKey = `${userId}-${cardId}`;
  if (activeRequests.has(requestKey)) {
    console.log('Request already in progress, returning existing promise');
    return activeRequests.get(requestKey);
  }
  
  // Create new request promise with mapped blueprint type
  const requestPromise = performGeneration({ ...args, blueprintType: mappedBlueprintType });
  activeRequests.set(requestKey, requestPromise);
  
  try {
    const result = await requestPromise;
    return result;
  } finally {
    activeRequests.delete(requestKey);
  }
}

// Separate function to handle the actual generation
async function performGeneration(args: any) {
  const { cardId, blueprintType, cardTitle, strategyId, userId, existingFields = {} } = args;
  
  try {
    const startTime = Date.now();

    // Step 0: Detect strategy context if not provided (Agent 0)
    const detectedStrategyId = strategyId || await detectCurrentStrategy(userId, cardId, blueprintType);
    console.log('=== STRATEGY CONTEXT DETECTION ===');
    console.log('Strategy context for generation:', { 
      provided: strategyId, 
      detected: detectedStrategyId,
      final: detectedStrategyId,
      userId: userId,
      cardId: cardId,
      blueprintType: blueprintType
    });
    console.log('=== END STRATEGY CONTEXT DETECTION ===');

    // Step 1: Fetch system prompt from database
    const { data: promptConfig, error: promptError } = await getSupabaseClient()
      .from('ai_system_prompts')
      .select('system_prompt, temperature, max_tokens, model_preference, times_used')
      .eq('blueprint_type', blueprintType)
      .eq('is_active', true)
      .single();

    if (promptError || !promptConfig) {
      throw new Error(`No active prompt found for blueprint type: ${blueprintType}`);
    }

    console.log('Found system prompt config:', {
      blueprintType,
      model: promptConfig.model_preference,
      temperature: promptConfig.temperature,
      maxTokens: promptConfig.max_tokens
    });

    // Step 1.5: Get dynamic field definitions from blueprint registry
    const fieldDefinitions = await getBlueprintFields(blueprintType);
    console.log('Dynamic field definitions loaded for:', blueprintType);
    console.log('Field definitions:', fieldDefinitions);

    // Step 2: Fetch context configuration from system prompts
    const { data: contextConfig, error: contextError } = await getSupabaseClient()
      .rpc('get_ai_context_config_from_prompts', { p_blueprint_type: blueprintType });

    if (contextError) {
      console.warn('Failed to fetch context config from prompts:', contextError);
      // Continue without context - not fatal
    }

    console.log('=== CONTEXT CONFIGURATION ===');
    console.log('Context config found:', contextConfig?.length || 0, 'mappings for', blueprintType);
    if (contextConfig && contextConfig.length > 0) {
      console.log('Context blueprints:', contextConfig.map((c: any) => ({
        blueprint: c.context_blueprint,
        maxCards: c.max_cards,
        strategy: c.inclusion_strategy,
        weight: c.weight,
        description: c.description
      })));
    }
    console.log('=== END CONTEXT CONFIGURATION ===');

    // Gather context if strategyId available (provided or detected)
    let contextSummary = '';
    let contextCards: any[] = [];

    if (!detectedStrategyId) {
      console.log('❌ No strategy context available - skipping context gathering');
    } else if (!contextConfig || contextConfig.length === 0) {
      console.log('❌ No context config found - skipping context gathering');
    } else {
      console.log('✅ Strategy ID and context config found - gathering context...');
    }

    if (detectedStrategyId && contextConfig && contextConfig.length > 0) {
      const context = await getCachedContext(
        `${userId}-${detectedStrategyId}-${blueprintType}`,
        () => gatherContext(detectedStrategyId, userId, contextConfig)
      );
      contextSummary = context.summary;
      contextCards = context.cards;
    }

    console.log('=== CONTEXT GATHERING RESULTS ===');
    console.log('Context gathered:', {
      strategyId: detectedStrategyId,
      contextLength: contextSummary.length,
      contextCardsCount: contextCards.length,
      contextConfigMappings: contextConfig?.length || 0
    });
    
    if (contextSummary.length > 0) {
      console.log('=== CONTEXT SUMMARY ===');
      console.log(contextSummary);
      console.log('=== END CONTEXT SUMMARY ===');
    }
    
    if (contextCards.length > 0) {
      console.log('=== CONTEXT CARDS ===');
      contextCards.forEach((card, index) => {
        console.log(`Card ${index + 1}: ${card.card_type} - ${card.title}`);
      });
      console.log('=== END CONTEXT CARDS ===');
    }

    // Build the generation prompt
    const userPrompt = buildGenerationPrompt(
      blueprintType,
      cardTitle,
      existingFields,
      contextSummary
    );

    // Inject field definitions into system prompt
    const enhancedSystemPrompt = `${promptConfig.system_prompt}

FIELD REQUIREMENTS:
Generate a JSON response with these specific fields:

${fieldDefinitions}

Also include these common card fields:
- description: Clear description of this card (string)
- strategicAlignment: How this aligns with strategic objectives (string)
- tags: Array of relevant tags (array of strings)

Ensure all required fields are populated and follow the exact field names and types specified above.`;

    console.log('=== ENHANCED SYSTEM PROMPT ===');
    console.log(enhancedSystemPrompt);
    console.log('=== END ENHANCED SYSTEM PROMPT ===');

    // Generate content
    const completion = await getOpenAIClient().chat.completions.create({
      model: promptConfig.model_preference || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: promptConfig.temperature || 0.7,
      max_tokens: promptConfig.max_tokens || 4000,
      response_format: { type: 'json_object' }
    });

    const generatedFields = JSON.parse(completion.choices[0].message.content || '{}');

    // Merge with existing fields (enhance, don't replace non-empty)
    const mergedFields = mergeFields(existingFields, generatedFields);

    // Track generation in history
    await trackGeneration(
      userId,
      cardId,
      blueprintType,
      contextCards,
      promptConfig.system_prompt,
      mergedFields,
      completion.usage?.total_tokens || 0,
      Date.now() - startTime,
      promptConfig.model_preference || 'gpt-4o-mini'
    );

    // Update prompt usage stats
    await getSupabaseClient()
      .from('ai_system_prompts')
      .update({ 
        times_used: (promptConfig.times_used || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('blueprint_type', blueprintType);

    console.log('Generation completed successfully:', {
      tokensUsed: completion.usage?.total_tokens || 0,
      generationTimeMs: Date.now() - startTime,
      fieldsGenerated: Object.keys(mergedFields).length
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            fields: mergedFields,
            metadata: {
              tokensUsed: completion.usage?.total_tokens || 0,
              contextCardsUsed: contextCards.length,
              generationTimeMs: Date.now() - startTime
            }
          })
        }
      ]
    };
  } catch (error: any) {
    console.error('Edit mode generation error:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Generation failed'
          })
        }
      ],
      isError: true
    };
  }
}

// Context gathering function
async function gatherContext(
  strategyId: string,
  userId: string,
  contextConfig: any[]
): Promise<{ summary: string; cards: any[] }> {
  const contextCards = [];
  const contextSummaries = [];
  
  console.log('=== GATHERING CONTEXT ===');
  console.log('Context config:', contextConfig);

  for (const config of contextConfig) {
    const { context_blueprint, max_cards, inclusion_strategy, summarization_required, summarization_prompt } = config;
    
    console.log(`🔍 Processing context config: ${context_blueprint}, max_cards: ${max_cards}, strategy: ${inclusion_strategy}`);
    
    // Skip if inclusion strategy is 'if_exists' and no strategyId
    if (inclusion_strategy === 'if_exists' && !strategyId) {
      console.log(`⏭️  Skipping ${context_blueprint} - inclusion strategy requires strategyId`);
      continue;
    }
    
    // Fetch cards based on blueprint type
    let query = getSupabaseClient()
      .from('cards')
      .select('id, title, description, card_type, card_data, strategy_id')
      .eq('user_id', userId)
      .eq('card_type', context_blueprint);
    
    console.log(`🔍 Query details: user_id=${userId}, card_type=${context_blueprint}, strategy_id=${strategyId || 'any'}`);
    
    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }
    
    if (max_cards) {
      query = query.limit(max_cards);
    }
    
    const { data: cards, error } = await query;
    
    if (error) {
      console.log(`❌ Error fetching ${context_blueprint} cards:`, error);
      continue;
    }
    
    if (!cards || cards.length === 0) {
      console.log(`❌ No ${context_blueprint} cards found for user ${userId} ${strategyId ? `in strategy ${strategyId}` : '(global)'}`);
      continue;
    }
    
    console.log(`✅ Found ${cards.length} ${context_blueprint} cards:`, cards.map((c: any) => ({
      title: c.title,
      id: c.id,
      strategy_id: c.strategy_id,
      hasDescription: !!c.description
    })));
    contextCards.push(...cards);
    
    // Handle summarization if needed
    if (summarization_required && cards.length > 3) {
      const summary = await summarizeCards(cards, summarization_prompt || 'Summarize key points');
      contextSummaries.push(`${context_blueprint}: ${summary}`);
    } else {
      // Add individual cards to context
      cards.forEach((card: any) => {
        contextSummaries.push(`${card.card_type}: ${card.title} - ${card.description || 'No description'}`);
      });
    }
  }
  
  console.log('=== CONTEXT GATHERING COMPLETE ===');
  console.log(`📋 Total context cards gathered: ${contextCards.length}`);
  console.log(`📝 Context summary length: ${contextSummaries.join('\n\n').length} characters`);
  console.log(`🎯 Context cards by type:`, contextCards.reduce((acc: any, card: any) => {
    acc[card.card_type] = (acc[card.card_type] || 0) + 1;
    return acc;
  }, {}));
  console.log('=== END CONTEXT GATHERING ===');
  
  return {
    summary: contextSummaries.join('\n\n'),
    cards: contextCards
  };
}

// Summarization function
async function summarizeCards(cards: any[], summarizationPrompt: string): Promise<string> {
  const cardsContent = cards.map(card => 
    `Card: ${card.title}\nDescription: ${card.description || 'None'}\nData: ${JSON.stringify(card.card_data || {})}`
  ).join('\n\n---\n\n');
  
  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-3.5-turbo', // Use cheaper model for summarization
      messages: [
        {
          role: 'system',
          content: 'You are a strategic analyst. Summarize the following cards according to the given instructions.'
        },
        {
          role: 'user',
          content: `${summarizationPrompt}\n\nCards to summarize:\n${cardsContent}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    return completion.choices[0].message.content || 'Unable to summarize';
  } catch (error) {
    console.error('Summarization failed:', error);
    return 'Summary unavailable';
  }
}

// Build generation prompt
function buildGenerationPrompt(
  blueprintType: string,
  cardTitle: string,
  existingFields: any,
  contextSummary: string
): string {
  const hasExistingContent = Object.keys(existingFields).some(
    key => existingFields[key] && String(existingFields[key]).trim().length > 0
  );
  
  let prompt = `Generate content for a ${blueprintType} card titled "${cardTitle}".`;
  
  if (contextSummary) {
    prompt += `\n\nRelevant Context:\n${contextSummary}`;
  }
  
  if (hasExistingContent) {
    prompt += `\n\nExisting content to enhance (improve and expand, don't just repeat):\n${JSON.stringify(existingFields, null, 2)}`;
    prompt += '\n\nInstructions:\n- Fill ALL empty fields with appropriate content\n- ENHANCE existing fields with more detail and specificity\n- Ensure all fields work together coherently';
  } else {
    prompt += '\n\nGenerate comprehensive content for all fields. Be specific, actionable, and relevant to the card title.';
  }
  
  prompt += '\n\nIMPORTANT: Follow the system prompt exactly and generate the specific fields requested. Return ONLY a JSON object with the exact field names specified in the system prompt as keys and appropriate content as values.';
  
  return prompt;
}

// Merge fields function
function mergeFields(existing: any, generated: any): any {
  const merged = { ...existing };
  
  for (const [key, value] of Object.entries(generated)) {
    if (!existing[key] || String(existing[key]).trim().length === 0) {
      // Field was empty, use generated
      merged[key] = value;
    } else if (String(value).length > String(existing[key]).length * 1.5) {
      // Generated is significantly longer (enhanced), use it
      merged[key] = value;
    }
    // Otherwise keep existing
  }
  
  return merged;
}

// Track generation in history
async function trackGeneration(
  userId: string,
  cardId: string,
  blueprintType: string,
  contextCards: any[],
  promptUsed: string,
  fieldsGenerated: any,
  tokensUsed: number,
  generationTimeMs: number,
  modelUsed: string
) {
  try {
    await getSupabaseClient().from('ai_generation_history').insert({
      user_id: userId,
      card_id: cardId,
      blueprint_type: blueprintType,
      context_used: contextCards.map(c => ({
        id: c.id,
        blueprint_type: c.card_type,
        title: c.title
      })),
      prompt_used: promptUsed,
      fields_generated: fieldsGenerated,
      total_tokens_used: tokensUsed,
      generation_time_ms: generationTimeMs,
      model_used: modelUsed,
      success: true
    });
  } catch (error) {
    console.error('Failed to track generation:', error);
    // Non-fatal, continue
  }
}

// Context caching function
async function getCachedContext(cacheKey: string, fetchFn: () => Promise<any>) {
  const cached = contextCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached context for key:', cacheKey);
    return cached.data;
  }
  
  console.log('Fetching fresh context for key:', cacheKey);
  const data = await fetchFn();
  contextCache.set(cacheKey, { data, timestamp: Date.now() });
  
  // Cleanup old entries
  if (contextCache.size > 100) {
    const oldestKey = Array.from(contextCache.keys())[0];
    contextCache.delete(oldestKey);
  }
  
  return data;
}