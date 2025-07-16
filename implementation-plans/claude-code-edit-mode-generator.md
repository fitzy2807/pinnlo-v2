# Claude Code Implementation Plan: Edit Mode AI Generator

## Project Overview
Implement an AI-powered content generation system for Pinnlo V2's edit mode that leverages the database-driven prompts and context mappings to generate high-quality, contextually relevant content for all blueprint types.

## Pre-Implementation Checklist
- [x] Database tables created (ai_system_prompts, ai_context_mappings, ai_context_strategies, ai_generation_history)
- [x] System prompts configured for 26 blueprint types
- [x] Context mappings established for core blueprints
- [x] MCP server running and tested
- [ ] Review existing code patterns in:
  - `/supabase-mcp/src/tools/` for MCP tool patterns
  - `/src/hooks/` for data fetching patterns
  - `/src/components/intelligence-cards/IntelligenceCardModal.tsx` for UI integration

## Implementation Phases

### Phase 1: MCP Tool Foundation (2-3 hours)
**Goal**: Create the core MCP tool that handles AI generation with database-driven configuration

#### Step 1.1: Create Edit Mode Generator Tool Structure
```bash
# Create the new tool file
touch supabase-mcp/src/tools/edit-mode-generator.ts
```

**File**: `supabase-mcp/src/tools/edit-mode-generator.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// Handler function following existing pattern
export async function handleGenerateEditModeContent(args: any) {
  const { cardId, blueprintType, cardTitle, strategyId, userId, existingFields = {} } = args;
  
  try {
    // Implementation will go here in steps
    return {
      success: true,
      fields: {},
      metadata: {
        tokensUsed: 0,
        contextCardsUsed: 0,
        generationTimeMs: 0
      }
    };
  } catch (error: any) {
    console.error('Edit mode generation error:', error);
    return {
      success: false,
      error: error.message || 'Generation failed'
    };
  }
}
```

#### Step 1.2: Implement Database Configuration Fetching
Add to the handler function:

```typescript
// Step 1: Fetch system prompt from database
const { data: promptConfig, error: promptError } = await supabase
  .from('ai_system_prompts')
  .select('system_prompt, temperature, max_tokens, model_preference')
  .eq('blueprint_type', blueprintType)
  .eq('is_active', true)
  .single();

if (promptError || !promptConfig) {
  throw new Error(`No active prompt found for blueprint type: ${blueprintType}`);
}

// Step 2: Fetch context configuration
const { data: contextConfig, error: contextError } = await supabase
  .rpc('get_ai_context_config', { p_blueprint_type: blueprintType });

if (contextError) {
  console.warn('Failed to fetch context config:', contextError);
  // Continue without context - not fatal
}
```

#### Step 1.3: Implement Context Gathering
Add context gathering logic:

```typescript
async function gatherContext(
  strategyId: string,
  userId: string,
  contextConfig: any[]
): Promise<{ summary: string; cards: any[] }> {
  const contextCards = [];
  const contextSummaries = [];

  for (const config of contextConfig) {
    const { context_blueprint, max_cards, inclusion_strategy, summarization_required, summarization_prompt } = config;
    
    // Skip if inclusion strategy is 'if_exists' and no strategyId
    if (inclusion_strategy === 'if_exists' && !strategyId) continue;
    
    // Fetch cards based on blueprint type
    let query = supabase
      .from('cards')
      .select('id, title, description, card_type, card_data')
      .eq('user_id', userId)
      .eq('card_type', context_blueprint);
    
    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }
    
    if (max_cards) {
      query = query.limit(max_cards);
    }
    
    const { data: cards, error } = await query;
    
    if (error || !cards || cards.length === 0) continue;
    
    contextCards.push(...cards);
    
    // Handle summarization if needed
    if (summarization_required && cards.length > 3) {
      const summary = await summarizeCards(cards, summarization_prompt || 'Summarize key points');
      contextSummaries.push(`${context_blueprint}: ${summary}`);
    } else {
      // Add individual cards to context
      cards.forEach(card => {
        contextSummaries.push(`${card.card_type}: ${card.title} - ${card.description || 'No description'}`);
      });
    }
  }
  
  return {
    summary: contextSummaries.join('\n\n'),
    cards: contextCards
  };
}
```

#### Step 1.4: Implement Summarization Function
Add the summarization logic:

```typescript
async function summarizeCards(cards: any[], summarizationPrompt: string): Promise<string> {
  const cardsContent = cards.map(card => 
    `Card: ${card.title}\nDescription: ${card.description || 'None'}\nData: ${JSON.stringify(card.card_data || {})}`
  ).join('\n\n---\n\n');
  
  try {
    const completion = await openai.chat.completions.create({
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
```

#### Step 1.5: Implement Main Generation Logic
Complete the handler:

```typescript
// Inside handleGenerateEditModeContent, after fetching configs:

const startTime = Date.now();

// Gather context if strategyId provided
let contextSummary = '';
let contextCards: any[] = [];

if (strategyId && contextConfig && contextConfig.length > 0) {
  const context = await gatherContext(strategyId, userId, contextConfig);
  contextSummary = context.summary;
  contextCards = context.cards;
}

// Build the generation prompt
const userPrompt = buildGenerationPrompt(
  blueprintType,
  cardTitle,
  existingFields,
  contextSummary
);

// Generate content
const completion = await openai.chat.completions.create({
  model: promptConfig.model_preference || 'gpt-4o-mini',
  messages: [
    { role: 'system', content: promptConfig.system_prompt },
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
await supabase
  .from('ai_system_prompts')
  .update({ 
    times_used: promptConfig.times_used + 1,
    last_used_at: new Date().toISOString()
  })
  .eq('blueprint_type', blueprintType);

return {
  success: true,
  fields: mergedFields,
  metadata: {
    tokensUsed: completion.usage?.total_tokens || 0,
    contextCardsUsed: contextCards.length,
    generationTimeMs: Date.now() - startTime
  }
};
```

#### Step 1.6: Add Helper Functions
Add these helper functions:

```typescript
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
    prompt += '\n\nInstructions:\n- Fill ALL empty fields\n- ENHANCE existing fields with more detail and specificity\n- Ensure all fields work together coherently';
  } else {
    prompt += '\n\nGenerate comprehensive content for all fields. Be specific, actionable, and relevant.';
  }
  
  prompt += '\n\nReturn ONLY a JSON object with field names as keys and content as values.';
  
  return prompt;
}

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
    await supabase.from('ai_generation_history').insert({
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
```

#### Phase 1 Validation
Test the MCP tool directly:
```bash
# In supabase-mcp directory
npm run dev

# In another terminal
curl -X POST http://localhost:3001/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "generate_edit_mode_content",
    "arguments": {
      "cardId": "test-123",
      "blueprintType": "vision",
      "cardTitle": "Test Vision",
      "strategyId": "strategy-123",
      "userId": "user-123",
      "existingFields": {}
    }
  }'
```

### Phase 2: MCP Server Integration (1 hour)
**Goal**: Register the new tool with the MCP server

#### Step 2.1: Update MCP Server Index
**File**: `supabase-mcp/src/index.ts`

Add imports at the top:
```typescript
import { 
  editModeGeneratorTools, 
  handleGenerateEditModeContent 
} from './tools/edit-mode-generator.js';
```

Add to the tools array in `getTools()`:
```typescript
...developmentBankTools,
...techStackTools,
...terminalTools,
...editModeGeneratorTools, // Add this line
```

Add to the tool handlers in `handleToolCall()`:
```typescript
case 'generate_edit_mode_content':
  return await handleGenerateEditModeContent(request.params.arguments);
```

#### Step 2.2: Test MCP Integration
```bash
# Restart MCP server
cd supabase-mcp
npm run dev

# Test via MCP protocol
node -e "
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
// Test code here
"
```

### Phase 3: Frontend API Route (1-2 hours)
**Goal**: Create Next.js API route for streaming responses

#### Step 3.1: Create API Route
**File**: `src/app/api/ai/edit-mode/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { cardId, blueprintType, cardTitle, strategyId, existingFields } = body;
    
    // Validate required fields
    if (!cardId || !blueprintType || !cardTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Call MCP server
    const mcpResponse = await fetch('http://localhost:3001/invoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'generate_edit_mode_content',
        arguments: {
          cardId,
          blueprintType,
          cardTitle,
          strategyId,
          userId: user.id,
          existingFields
        }
      })
    });
    
    if (!mcpResponse.ok) {
      throw new Error(`MCP error: ${mcpResponse.statusText}`);
    }
    
    const result = await mcpResponse.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Generation failed');
    }
    
    return NextResponse.json({
      success: true,
      fields: result.fields,
      metadata: result.metadata
    });
    
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Step 3.2: Add Streaming Support
Update the API route to support streaming:

```typescript
// Add to imports
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Replace the POST function with streaming version
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // Run generation in background
  (async () => {
    try {
      // ... auth and validation code ...
      
      // Send initial progress
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress', 
          message: 'Starting generation...' 
        })}\n\n`)
      );
      
      // Call MCP and stream updates
      const result = await callMCPWithProgress(
        { cardId, blueprintType, cardTitle, strategyId, userId: user.id, existingFields },
        async (progress) => {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'progress', 
              ...progress 
            })}\n\n`)
          );
        }
      );
      
      // Send final result
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete', 
          ...result 
        })}\n\n`)
      );
      
    } catch (error: any) {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          error: error.message 
        })}\n\n`)
      );
    } finally {
      await writer.close();
    }
  })();
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Phase 4: React Hook Integration (1-2 hours)
**Goal**: Create reusable React hook for AI generation

#### Step 4.1: Create the Hook
**File**: `src/hooks/useEditModeGenerator.ts`

```typescript
import { useState, useCallback, useRef } from 'react';

export interface GeneratorState {
  isGenerating: boolean;
  progress: string;
  error: string | null;
  fields: Record<string, any> | null;
}

export function useEditModeGenerator() {
  const [state, setState] = useState<GeneratorState>({
    isGenerating: false,
    progress: '',
    error: null,
    fields: null
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const generate = useCallback(async (params: {
    cardId: string;
    blueprintType: string;
    cardTitle: string;
    strategyId?: string;
    existingFields?: Record<string, any>;
  }) => {
    // Reset state
    setState({
      isGenerating: true,
      progress: 'Initializing...',
      error: null,
      fields: null
    });
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/ai/edit-mode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setState(prev => ({
                  ...prev,
                  progress: data.message || 'Processing...'
                }));
              } else if (data.type === 'complete') {
                setState({
                  isGenerating: false,
                  progress: 'Complete!',
                  error: null,
                  fields: data.fields
                });
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setState({
          isGenerating: false,
          progress: '',
          error: error.message || 'Generation failed',
          fields: null
        });
      }
    }
  }, []);
  
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 'Cancelled'
      }));
    }
  }, []);
  
  return {
    ...state,
    generate,
    cancel
  };
}
```

### Phase 5: UI Integration (2 hours)
**Goal**: Add AI generation button to the card modal

#### Step 5.1: Update IntelligenceCardModal
**File**: `src/components/intelligence-cards/IntelligenceCardModal.tsx`

Add imports:
```typescript
import { useEditModeGenerator } from '@/hooks/useEditModeGenerator';
```

Add to component:
```typescript
// After existing state declarations
const { 
  isGenerating, 
  progress, 
  error: generationError, 
  fields: generatedFields, 
  generate, 
  cancel 
} = useEditModeGenerator();

// Add effect to apply generated fields
useEffect(() => {
  if (generatedFields && !isGenerating) {
    setEditData(prev => ({
      ...prev,
      ...generatedFields
    }));
    toast.success('Content generated successfully!');
  }
}, [generatedFields, isGenerating]);

// Add generation handler
const handleAIGenerate = async () => {
  if (!card) return;
  
  try {
    await generate({
      cardId: card.id,
      blueprintType: card.cardType,
      cardTitle: editData.title || card.title || 'Untitled',
      strategyId: card.strategy_id,
      existingFields: editData
    });
  } catch (error) {
    console.error('Generation failed:', error);
    toast.error('Failed to generate content');
  }
};
```

Add to the edit mode buttons section:
```typescript
{isEditing && (
  <div className={styles.editActions}>
    <button
      onClick={handleAIGenerate}
      disabled={isSaving || isGenerating}
      className={styles.btnAI}
      title={isGenerating ? progress : "Generate content with AI"}
    >
      <Sparkles className="w-4 h-4" />
      {isGenerating ? 'Generating...' : 'AI Generate'}
    </button>
    
    {/* Existing save/cancel buttons */}
  </div>
)}

{/* Show progress */}
{isGenerating && (
  <div className={styles.generationProgress}>
    <div className={styles.progressText}>{progress}</div>
    <button onClick={cancel} className={styles.cancelGeneration}>
      Cancel
    </button>
  </div>
)}
```

#### Step 5.2: Add Styles
**File**: `src/components/intelligence-cards/IntelligenceCardModal.module.css`

Add:
```css
.btnAI {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btnAI:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  transform: translateY(-1px);
}

.btnAI:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.generationProgress {
  margin-top: 12px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progressText {
  font-size: 14px;
  color: #4b5563;
}

.cancelGeneration {
  padding: 4px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancelGeneration:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
```

### Phase 6: Testing & Refinement (2 hours)
**Goal**: Test across all blueprint types and refine

#### Step 6.1: Create Test Script
**File**: `scripts/test-edit-mode-generator.js`

```javascript
const testCases = [
  {
    blueprintType: 'vision',
    cardTitle: 'Test Vision 2025',
    existingFields: { timeHorizon: '5 years' }
  },
  {
    blueprintType: 'epics',
    cardTitle: 'Mobile App Redesign',
    existingFields: {}
  },
  {
    blueprintType: 'techRequirements',
    cardTitle: 'API Architecture',
    existingFields: { techStack: 'Node.js, PostgreSQL' }
  }
];

async function testGeneration() {
  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.blueprintType}...`);
    
    const response = await fetch('http://localhost:3000/api/ai/edit-mode/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN' // Add auth
      },
      body: JSON.stringify({
        cardId: 'test-' + Date.now(),
        ...testCase
      })
    });
    
    // Process streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      console.log('Received:', chunk);
    }
  }
}

testGeneration().catch(console.error);
```

#### Step 6.2: Performance Monitoring
Add to MCP tool:

```typescript
// Add performance tracking
console.log(`Generation metrics for ${blueprintType}:
- Context cards: ${contextCards.length}
- Context tokens: ~${Math.ceil(contextSummary.length / 4)}
- Generation time: ${Date.now() - startTime}ms
- Total tokens: ${completion.usage?.total_tokens || 0}
- Model: ${promptConfig.model_preference}`);
```

#### Step 6.3: Error Handling Improvements
Add comprehensive error handling:

```typescript
// Wrap each major step in try-catch
try {
  // Context gathering
} catch (error) {
  console.error('Context gathering failed:', error);
  // Continue without context
}

try {
  // Generation
} catch (error) {
  if (error.response?.status === 429) {
    throw new Error('Rate limit exceeded. Please try again in a few moments.');
  } else if (error.response?.status === 401) {
    throw new Error('OpenAI API key is invalid.');
  } else {
    throw new Error(`Generation failed: ${error.message}`);
  }
}
```

### Phase 7: Production Readiness (1 hour)
**Goal**: Add monitoring, caching, and optimization

#### Step 7.1: Add Context Caching
```typescript
// Simple in-memory cache for context
const contextCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedContext(cacheKey: string, fetchFn: () => Promise<any>) {
  const cached = contextCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFn();
  contextCache.set(cacheKey, { data, timestamp: Date.now() });
  
  // Cleanup old entries
  if (contextCache.size > 100) {
    const oldestKey = Array.from(contextCache.keys())[0];
    contextCache.delete(oldestKey);
  }
  
  return data;
}
```

#### Step 7.2: Add Request Queuing
```typescript
// Prevent parallel requests for same card
const activeRequests = new Map<string, Promise<any>>();

export async function handleGenerateEditModeContent(args: any) {
  const requestKey = `${args.userId}-${args.cardId}`;
  
  // Check if request already in progress
  if (activeRequests.has(requestKey)) {
    return activeRequests.get(requestKey);
  }
  
  // Create new request promise
  const requestPromise = performGeneration(args);
  activeRequests.set(requestKey, requestPromise);
  
  try {
    const result = await requestPromise;
    return result;
  } finally {
    activeRequests.delete(requestKey);
  }
}
```

#### Step 7.3: Add Telemetry
```typescript
// Track key metrics
interface GenerationMetrics {
  blueprintType: string;
  contextCardsCount: number;
  tokensUsed: number;
  generationTimeMs: number;
  cacheHit: boolean;
  success: boolean;
  errorType?: string;
}

async function trackMetrics(metrics: GenerationMetrics) {
  // Send to your analytics service
  console.log('Generation metrics:', metrics);
  
  // Could also store in database for analysis
  await supabase.from('ai_generation_metrics').insert(metrics);
}
```

## Success Criteria

### Phase 1 ✓
- [ ] MCP tool created and responds to test requests
- [ ] Database configuration properly fetched
- [ ] Context gathering works with summarization
- [ ] Generation produces valid JSON output

### Phase 2 ✓
- [ ] Tool registered in MCP server
- [ ] Server restarts without errors
- [ ] Tool appears in available tools list

### Phase 3 ✓
- [ ] API route created and responds to POST requests
- [ ] Authentication properly enforced
- [ ] Streaming responses work correctly
- [ ] Errors handled gracefully

### Phase 4 ✓
- [ ] Hook manages state correctly
- [ ] Progress updates received
- [ ] Cancellation works
- [ ] Generated fields returned

### Phase 5 ✓
- [ ] AI Generate button appears in edit mode
- [ ] Click triggers generation
- [ ] Progress shown to user
- [ ] Fields populate after generation

### Phase 6 ✓
- [ ] All blueprint types tested
- [ ] Performance acceptable (<30s average)
- [ ] Error messages user-friendly
- [ ] Context used effectively

### Phase 7 ✓
- [ ] Context caching reduces redundant fetches
- [ ] Parallel requests handled properly
- [ ] Metrics tracked for analysis
- [ ] System stable under load

## Code Reusability Summary

1. **Database Patterns**: Reused Supabase client patterns from existing tools
2. **MCP Structure**: Followed existing tool patterns from `ai-generation.ts`
3. **API Routes**: Followed existing Next.js API patterns
4. **React Hooks**: Followed existing hook patterns from `useIntelligenceCards.ts`
5. **UI Components**: Reused existing modal patterns and styles
6. **Error Handling**: Consistent with existing error patterns
7. **Streaming**: Reused SSE patterns from other features

## Deployment Checklist

- [ ] Environment variables set (OPENAI_API_KEY, Supabase keys)
- [ ] MCP server deployed and accessible
- [ ] Database migrations applied
- [ ] API routes tested in production
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled
- [ ] Rate limiting configured
- [ ] Cost alerts set up for OpenAI usage

## Post-Deployment Monitoring

1. **Track Success Rate**: Monitor `ai_generation_history` for failures
2. **Performance**: Average generation time by blueprint type
3. **Usage**: Which blueprints are generated most
4. **Costs**: OpenAI token usage and costs
5. **User Feedback**: Track ratings in generation history

This implementation plan provides a complete, production-ready system that leverages your existing code patterns and infrastructure while adding powerful AI generation capabilities to your edit mode.