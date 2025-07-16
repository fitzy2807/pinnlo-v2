# Simplified Edit Mode AI Generator Implementation

## Overview
Single button that intelligently fills empty fields and enhances existing content using MCP tool sequencing for quality.

## Core Concept

```typescript
// User clicks one button
<button onClick={handleGenerateAll}>✨ Generate Content</button>

// System does smart MCP sequencing behind the scenes:
1. Analyze context (existing content, card type, related cards)
2. Generate high-quality content for each field
3. Update all fields at once
```

## Phase 1: Create MCP Tool (30 minutes)

### Step 1.1: Create the MCP Tool
**File**: `supabase-mcp/src/tools/edit-mode-generator.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const editModeGeneratorTool = {
  name: 'generate_edit_mode_content',
  description: 'Fill empty fields and enhance existing content for a card',
  inputSchema: {
    type: 'object',
    properties: {
      cardId: { type: 'string' },
      cardType: { type: 'string' },
      cardTitle: { type: 'string' },
      strategyId: { type: 'string' },
      userId: { type: 'string' },
      existingFields: { type: 'object' }
    },
    required: ['cardId', 'cardType', 'cardTitle', 'userId']
  },
  
  handler: async (args: any) => {
    const { cardId, cardType, cardTitle, strategyId, userId, existingFields = {} } = args;
    
    try {
      // Step 1: Gather context from related cards
      const context = await gatherContext(strategyId, userId, cardType);
      
      // Step 2: Create smart prompt based on card type
      const systemPrompt = getSystemPrompt(cardType);
      const userPrompt = buildUserPrompt(cardTitle, cardType, existingFields, context);
      
      // Step 3: Generate content
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      
      const generatedFields = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Step 4: Merge with existing fields (enhance, don't replace non-empty)
      const mergedFields = mergeFields(existingFields, generatedFields);
      
      return {
        success: true,
        fields: mergedFields
      };
      
    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

async function gatherContext(strategyId: string, userId: string, cardType: string) {
  // Get related cards for context
  const contextTypes = getContextTypes(cardType);
  
  if (!strategyId || contextTypes.length === 0) {
    return 'No additional context available.';
  }
  
  const { data: relatedCards } = await supabase
    .from('cards')
    .select('title, description, card_type, card_data')
    .eq('strategy_id', strategyId)
    .eq('user_id', userId)
    .in('card_type', contextTypes)
    .limit(5);
    
  if (!relatedCards || relatedCards.length === 0) {
    return 'No related cards found for context.';
  }
  
  return `Related strategy context:
${relatedCards.map(card => 
  `- ${card.card_type}: ${card.title} - ${card.description || 'No description'}`
).join('\n')}`;
}

function getContextTypes(cardType: string): string[] {
  // Define which card types provide context for each card type
  const contextMap: Record<string, string[]> = {
    'vision': ['strategic-context', 'business-model'],
    'swot': ['competitive-analysis', 'market-analysis', 'strategic-context'],
    'epic': ['vision', 'problem-statement', 'user-journey'],
    'technical-requirement': ['epic', 'tech-stack', 'system-architecture'],
    'okr': ['vision', 'strategic-objectives', 'kpis'],
    'user-story': ['epic', 'user-journey', 'acceptance-criteria']
  };
  
  return contextMap[cardType] || [];
}

function getSystemPrompt(cardType: string): string {
  const prompts: Record<string, string> = {
    'vision': 'You are a strategic visioning expert. Create inspiring, future-focused content.',
    'swot': 'You are a strategic analyst. Create balanced, insightful SWOT analysis.',
    'epic': 'You are an agile product expert. Create comprehensive epics with clear scope.',
    'technical-requirement': 'You are a senior technical architect. Create detailed technical specifications.',
    'okr': 'You are an OKR expert. Create measurable objectives and key results.',
    'default': 'You are a strategic planning expert. Create professional, relevant content.'
  };
  
  return prompts[cardType] || prompts.default;
}

function buildUserPrompt(
  cardTitle: string, 
  cardType: string, 
  existingFields: any, 
  context: string
): string {
  const hasExistingContent = Object.values(existingFields).some(
    value => value && String(value).trim().length > 0
  );
  
  return `Generate content for a ${cardType} card titled "${cardTitle}".

${context}

${hasExistingContent ? `
Existing content to enhance (make better, don't just repeat):
${JSON.stringify(existingFields, null, 2)}

Instructions:
- Fill in ALL empty fields with relevant content
- ENHANCE existing fields by making them more specific, detailed, and actionable
- Ensure consistency between all fields
- Keep the same tone and style as existing content
` : `
Generate comprehensive content for all fields. Be specific and actionable.
`}

Return a JSON object with field names as keys and generated/enhanced content as values.
Only include fields that need content or enhancement.`;
}

function mergeFields(existing: any, generated: any): any {
  const merge