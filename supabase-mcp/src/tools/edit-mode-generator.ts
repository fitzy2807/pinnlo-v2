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
  },
  {
    name: 'process_voice_edit_content',
    description: 'Process voice transcript to update page fields intelligently based on spoken content',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: { type: 'string', description: 'ID of the card being edited' },
        blueprintType: { type: 'string', description: 'Blueprint type from registry' },
        cardTitle: { type: 'string', description: 'Title of the card' },
        transcript: { type: 'string', description: 'Voice transcript content' },
        userId: { type: 'string', description: 'User ID' },
        existingFields: { 
          type: 'object', 
          description: 'Current field values in the card',
          additionalProperties: true 
        }
      },
      required: ['cardId', 'blueprintType', 'cardTitle', 'transcript', 'userId']
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
      'serviceBlueprints': 'serviceBlueprint',
      'organisationalCapabilities': 'organisationalCapability',
      'gtmPlays': 'gtmPlay',
      'techRequirements': 'technicalRequirement',
      'strategicContext': 'strategicContext',
      'customerExperience': 'customerJourney',
      'okrs': 'okr',
      'swot-analysis': 'swot',
      'competitive-analysis': 'competitiveAnalysis',
      'business-model': 'businessModel',
      'go-to-market': 'goToMarket',
      'risk-assessment': 'riskAssessment',
      'roadmap': 'roadmap',
      'kpis': 'kpi',
      'financial-projections': 'financialProjections',
      'cost-driver': 'costDriver',
      'revenue-driver': 'revenueDriver',
      'problem-statement': 'problemStatement'
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

// Reverse mapping function - converts camelCase to kebab-case for database queries
function camelCaseToKebabCase(camelCaseType: string): string {
  const reverseMappings: Record<string, string> = {
    'strategicContext': 'strategic-context',
    'valuePropositions': 'value-propositions',
    'customerExperience': 'customer-journey',
    'personas': 'personas',
    'okrs': 'okrs',
    'kpis': 'kpis',
    'workstreams': 'workstream',
    'epics': 'epic',
    'features': 'feature',
    'serviceBlueprints': 'service-blueprint',
    'organisationalCapabilities': 'organisational-capability',
    'gtmPlays': 'gtm-play',
    'techRequirements': 'tech-requirements'
  };
  
  return reverseMappings[camelCaseType] || camelCaseType;
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
    
    // Convert camelCase context_blueprint to kebab-case for database query
    const dbBlueprintType = camelCaseToKebabCase(context_blueprint);
    console.log(`🔄 Blueprint mapping: ${context_blueprint} → ${dbBlueprintType}`);
    
    // Fetch cards based on blueprint type
    let query = getSupabaseClient()
      .from('cards')
      .select('id, title, description, card_type, card_data, strategy_id')
      .eq('created_by', userId)
      .eq('card_type', dbBlueprintType);
    
    console.log(`🔍 Query details: created_by=${userId}, card_type=${dbBlueprintType}, strategy_id=${strategyId || 'any'}`);
    
    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }
    
    if (max_cards) {
      query = query.limit(max_cards);
    }
    
    const { data: cards, error } = await query;
    
    if (error) {
      console.log(`❌ Error fetching ${context_blueprint} (${dbBlueprintType}) cards:`, error);
      continue;
    }
    
    if (!cards || cards.length === 0) {
      console.log(`❌ No ${context_blueprint} (${dbBlueprintType}) cards found for user ${userId} ${strategyId ? `in strategy ${strategyId}` : '(global)'}`);
      continue;
    }
    
    console.log(`✅ Found ${cards.length} ${context_blueprint} (${dbBlueprintType}) cards:`, cards.map((c: any) => ({
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

// Voice Context Processing Agent - replaces card gathering with voice analysis
async function processVoiceContext(
  transcript: string, 
  blueprintType: string, 
  existingFields: any, 
  strategyId: string | null
): Promise<{ summary: string; themes: string[]; fieldMappings: any }> {
  try {
    console.log('=== PROCESSING VOICE CONTEXT ===');
    
    // Analyze transcript for strategic themes and field relevance
    const themeAnalysis = await analyzeVoiceThemes(transcript, blueprintType);
    const fieldMappings = await mapVoiceToFields(transcript, blueprintType, existingFields);
    const strategicSummary = await generateVoiceContextSummary(transcript, themeAnalysis, strategyId);
    
    console.log('Voice context processing complete:', {
      themes: themeAnalysis.length,
      fieldMappings: Object.keys(fieldMappings).length,
      summaryLength: strategicSummary.length
    });
    
    return {
      summary: strategicSummary,
      themes: themeAnalysis,
      fieldMappings: fieldMappings
    };
  } catch (error) {
    console.error('Voice context processing failed:', error);
    // Return minimal context to continue processing
    return {
      summary: `Voice transcript context: ${transcript.substring(0, 200)}...`,
      themes: ['voice input'],
      fieldMappings: {}
    };
  }
}

// Analyze voice transcript for strategic themes
async function analyzeVoiceThemes(transcript: string, blueprintType: string): Promise<string[]> {
  const themes = [];
  
  // Extract key business themes from voice input
  const businessKeywords = ['strategy', 'goal', 'objective', 'user', 'customer', 'problem', 'solution', 'value', 'benefit', 'challenge', 'opportunity', 'risk'];
  const transcriptLower = transcript.toLowerCase();
  
  for (const keyword of businessKeywords) {
    if (transcriptLower.includes(keyword)) {
      themes.push(keyword);
    }
  }
  
  // Add blueprint-specific themes
  if (transcriptLower.includes('feature') || blueprintType === 'features') {
    themes.push('feature development');
  }
  if (transcriptLower.includes('persona') || blueprintType === 'personas') {
    themes.push('user personas');
  }
  
  return themes.length > 0 ? themes : ['general strategy'];
}

// Map voice content to specific fields
async function mapVoiceToFields(transcript: string, blueprintType: string, existingFields: any): Promise<any> {
  const mappings: any = {};
  const transcriptLower = transcript.toLowerCase();
  
  // Common field mappings based on voice content
  if (transcriptLower.includes('description') || transcriptLower.includes('about')) {
    mappings.description = 'voice content contains descriptive information';
  }
  if (transcriptLower.includes('priority') || transcriptLower.includes('important')) {
    mappings.priority = 'voice content mentions priority';
  }
  if (transcriptLower.includes('user') || transcriptLower.includes('customer')) {
    mappings.linkedPersona = 'voice content references users/customers';
  }
  if (transcriptLower.includes('problem') || transcriptLower.includes('solves')) {
    mappings.problemItSolves = 'voice content describes problems or solutions';
  }
  
  return mappings;
}

// Generate strategic context summary from voice input
async function generateVoiceContextSummary(transcript: string, themes: string[], strategyId: string | null): Promise<string> {
  let summary = `Voice Input Context:\n\n`;
  summary += `Strategic Themes Identified: ${themes.join(', ')}\n\n`;
  summary += `Voice Content: ${transcript}\n\n`;
  
  if (strategyId) {
    summary += `Strategic Context: Connected to strategy ${strategyId}\n\n`;
  }
  
  summary += `Voice Input Instructions: Use this voice content as the primary strategic context for field enhancement. Transform conversational input into professional, strategic field content.`;
  
  return summary;
}

// Handler function for voice edit processing
export async function handleProcessVoiceEditContent(args: any) {
  const { cardId, blueprintType, cardTitle, transcript, userId, existingFields = {} } = args;
  
  console.log('=== handleProcessVoiceEditContent START ===');
  console.log('Arguments:', { cardId, blueprintType, cardTitle, transcript: transcript.substring(0, 100) + '...', userId });
  
  // Map blueprint type to match database naming
  const mappedBlueprintType = mapBlueprintType(blueprintType);
  console.log('Blueprint type mapping:', { original: blueprintType, mapped: mappedBlueprintType });
  
  // Check if request already in progress
  const requestKey = `${userId}-${cardId}-voice`;
  if (activeRequests.has(requestKey)) {
    console.log('Voice edit request already in progress, returning existing promise');
    return activeRequests.get(requestKey);
  }
  
  // Create new request promise with mapped blueprint type
  const requestPromise = performVoiceEditGeneration({ ...args, blueprintType: mappedBlueprintType });
  activeRequests.set(requestKey, requestPromise);
  
  try {
    const result = await requestPromise;
    return result;
  } finally {
    activeRequests.delete(requestKey);
  }
}

// Voice edit generation function
async function performVoiceEditGeneration(args: any) {
  const { cardId, blueprintType, cardTitle, transcript, userId, existingFields = {} } = args;
  
  try {
    const startTime = Date.now();
    console.log('=== VOICE EDIT GENERATION START ===');

    // Step 0: Detect strategy context if not provided (Agent 0) - same as regular edit mode
    const detectedStrategyId = await detectCurrentStrategy(userId, cardId, blueprintType);
    console.log('=== VOICE EDIT STRATEGY CONTEXT DETECTION ===');
    console.log('Strategy context for voice edit:', { 
      detected: detectedStrategyId,
      userId: userId,
      cardId: cardId,
      blueprintType: blueprintType
    });
    console.log('=== END VOICE EDIT STRATEGY CONTEXT DETECTION ===');
    
    // Step 1: Fetch system prompt from database (Agent 1) - same as regular edit mode
    const { data: promptConfig, error: promptError } = await getSupabaseClient()
      .from('ai_system_prompts')
      .select('system_prompt, temperature, max_tokens, model_preference, times_used')
      .eq('blueprint_type', blueprintType)
      .eq('is_active', true)
      .single();

    if (promptError || !promptConfig) {
      throw new Error(`No active prompt found for blueprint type: ${blueprintType}`);
    }

    console.log('Found system prompt config for voice edit:', {
      blueprintType,
      model: promptConfig.model_preference,
      temperature: promptConfig.temperature,
      maxTokens: promptConfig.max_tokens
    });

    // Step 1.5: Get dynamic field definitions from blueprint registry
    const fieldDefinitions = await getBlueprintFields(blueprintType);
    console.log('Dynamic field definitions loaded for:', blueprintType);

    // Step 2: Voice Context Processing (Agent 2) - replace card gathering with voice analysis
    const voiceContext = await processVoiceContext(transcript, blueprintType, existingFields, detectedStrategyId);
    console.log('=== VOICE CONTEXT PROCESSING ===');
    console.log('Voice context generated:', {
      transcriptLength: transcript.length,
      contextSummaryLength: voiceContext.summary.length,
      strategicThemes: voiceContext.themes.length,
      fieldMappings: Object.keys(voiceContext.fieldMappings).length
    });
    console.log('=== END VOICE CONTEXT PROCESSING ===');
    
    // Build enhanced voice edit system prompt using database prompt + voice-specific enhancements
    const voiceEditSystemPrompt = `${promptConfig.system_prompt}

## VOICE EDIT ENHANCEMENT MANDATE

You are now processing voice transcript input instead of standard text generation. Your role is to be AGGRESSIVE and PROACTIVE in interpreting voice input to make meaningful updates to fields, even when the connection isn't perfectly direct.

## Voice Edit Core Responsibilities

1. **Aggressive Interpretation**: Extract maximum value from voice transcripts, making intelligent inferences and connections
2. **Proactive Field Updates**: Look for ANY way the transcript content can enhance, expand, or improve existing fields
3. **Strategic Enhancement**: Use voice transcript as primary context source instead of related cards
4. **Comprehensive Coverage**: Ensure all blueprint fields are considered and enhanced based on voice input

## MANDATORY Voice-First Field Update Approach

### Voice Context Processing
- **Primary Context Source**: Voice transcript replaces related cards as the strategic context
- **ALWAYS make changes**: The user spoke for a reason - find ways to incorporate their voice input
- **Strategic Interpretation**: Turn casual voice input into professional, strategic field content
- **Comprehensive Enhancement**: Use voice input as a catalyst to improve ALL relevant fields

### Field Enhancement Strategy
- **Immediate Updates**: If transcript mentions anything remotely related to a field, update that field significantly
- **Contextual Population**: Use voice context to populate empty fields with strategic inferences
- **Content Expansion**: Make existing content more detailed and specific using voice insights
- **Professional Polish**: Convert conversational voice input into polished, business-ready content

### Quality Standards for Voice Edit
- **Substantial Changes**: Every voice edit must result in noticeable, meaningful improvements
- **Strategic Depth**: Transform voice input into strategically valuable content
- **Multiple Field Updates**: Single voice input should enhance several relevant fields
- **Voice-Informed Accuracy**: Only include information explicitly mentioned or clearly implied in transcript

FIELD REQUIREMENTS:
Generate a JSON response with these specific fields for the ${blueprintType} blueprint:

${fieldDefinitions}

Also include these common card fields:
- description: Clear description of this card (string)
- strategicAlignment: How this aligns with strategic objectives (string)
- tags: Array of relevant tags (array of strings)

**CRITICAL MANDATE**: You MUST make meaningful changes based on the voice transcript. Even if the transcript seems only tangentially related to a field, use it as inspiration to enhance that field with better, more detailed content. The user expects to see substantial improvements after voice input. DO NOT return unchanged content - that is a failure. Always enhance, expand, and improve based on voice context.`;

    // Build the user prompt with voice context and existing content
    const userPrompt = `VOICE EDIT MANDATE: The user recorded voice input expecting significant improvements to their page. You MUST make substantial, meaningful changes based on the voice context analysis below.

VOICE CONTEXT ANALYSIS:
${voiceContext.summary}

STRATEGIC THEMES IDENTIFIED:
${voiceContext.themes.join(', ')}

FIELD MAPPING INSIGHTS:
${JSON.stringify(voiceContext.fieldMappings, null, 2)}

VOICE TRANSCRIPT:
"${transcript}"

EXISTING FIELD CONTENT:
${JSON.stringify(existingFields, null, 2)}

MANDATORY INSTRUCTIONS:
1. **USE VOICE CONTEXT** as the primary strategic input for field enhancement
2. **AGGRESSIVELY interpret** the voice themes and transcript to enhance ALL relevant fields
3. **SUBSTANTIALLY improve** existing content using voice insights and strategic themes
4. **POPULATE empty fields** using voice context, themes, and strategic inference
5. **ENHANCE multiple fields** - voice themes should improve several related fields
6. **STRATEGIC TRANSFORMATION** - convert voice input into professional, strategic content
7. **FIELD MAPPING AWARENESS** - pay special attention to fields identified in mapping insights

CRITICAL SUCCESS CRITERIA:
- Voice themes must be reflected across multiple enhanced fields
- Content must be significantly more detailed and strategic than before  
- Empty fields should be populated with voice-inspired strategic content
- Existing content should be substantially expanded using voice context
- The strategic themes should be woven throughout the enhanced fields

Generate the SUBSTANTIALLY IMPROVED field content as a JSON object using voice context as primary strategic input.`;

    console.log('=== VOICE EDIT PROMPT ===');
    console.log('System prompt length:', voiceEditSystemPrompt.length);
    console.log('User prompt length:', userPrompt.length);
    console.log('Transcript preview:', transcript.substring(0, 200) + '...');

    // Generate content using OpenAI with database configuration
    const completion = await getOpenAIClient().chat.completions.create({
      model: promptConfig.model_preference || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: voiceEditSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: promptConfig.temperature || 0.7,
      max_tokens: promptConfig.max_tokens || 4000,
      response_format: { type: 'json_object' }
    });

    const updatedFields = JSON.parse(completion.choices[0].message.content || '{}');
    console.log('Voice edit generation completed:', {
      tokensUsed: completion.usage?.total_tokens || 0,
      fieldsUpdated: Object.keys(updatedFields).length,
      generationTimeMs: Date.now() - startTime,
      model: promptConfig.model_preference || 'gpt-4o-mini'
    });

    // Track generation in history with voice context metadata
    await trackVoiceGeneration(
      userId,
      cardId,
      blueprintType,
      transcript,
      voiceEditSystemPrompt,
      updatedFields,
      completion.usage?.total_tokens || 0,
      Date.now() - startTime,
      promptConfig.model_preference || 'gpt-4o-mini',
      voiceContext
    );

    // Update prompt usage stats (same as regular edit mode)
    await getSupabaseClient()
      .from('ai_system_prompts')
      .update({ 
        times_used: (promptConfig.times_used || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('blueprint_type', blueprintType);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            fields: updatedFields,
            metadata: {
              tokensUsed: completion.usage?.total_tokens || 0,
              transcriptLength: transcript.length,
              generationTimeMs: Date.now() - startTime
            }
          })
        }
      ]
    };
  } catch (error: any) {
    console.error('Voice edit generation error:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Voice edit processing failed'
          })
        }
      ],
      isError: true
    };
  }
}

// Track voice generation in history
async function trackVoiceGeneration(
  userId: string,
  cardId: string,
  blueprintType: string,
  transcript: string,
  promptUsed: string,
  fieldsGenerated: any,
  tokensUsed: number,
  generationTimeMs: number,
  modelUsed: string,
  voiceContext?: any
) {
  try {
    await getSupabaseClient().from('ai_generation_history').insert({
      user_id: userId,
      card_id: cardId,
      blueprint_type: blueprintType,
      context_used: [{ 
        type: 'voice_transcript', 
        length: transcript.length,
        preview: transcript.substring(0, 100) + '...',
        voice_context: voiceContext ? {
          themes: voiceContext.themes,
          fieldMappings: voiceContext.fieldMappings,
          summaryLength: voiceContext.summary.length
        } : null
      }],
      prompt_used: promptUsed,
      fields_generated: fieldsGenerated,
      total_tokens_used: tokensUsed,
      generation_time_ms: generationTimeMs,
      model_used: modelUsed,
      success: true
    });
  } catch (error) {
    console.error('Failed to track voice generation:', error);
    // Non-fatal, continue
  }
}