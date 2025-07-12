// Tool type will be inferred from the object structure
export const strategyCreatorTools = [
    {
        name: 'generate_universal_executive_summary',
        description: 'Generate executive summary using universal prompt that detects blueprint type',
        inputSchema: {
            type: 'object',
            properties: {
                cards: {
                    type: 'array',
                    description: 'Array of cards to analyze',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            card_type: { type: 'string' },
                            card_data: { type: 'object' }
                        }
                    }
                },
                blueprint_type: {
                    type: 'string',
                    description: 'Blueprint type hint (optional)'
                }
            },
            required: ['cards']
        }
    },
    {
        name: 'generate_context_summary',
        description: 'Generate comprehensive context summary from blueprint and intelligence cards',
        inputSchema: {
            type: 'object',
            properties: {
                blueprintCards: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            cardType: { type: 'string' },
                            blueprintFields: { type: 'object' }
                        }
                    }
                },
                intelligenceCards: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            category: { type: 'string' },
                            keyFindings: { type: 'array', items: { type: 'string' } },
                            relevanceScore: { type: 'number' }
                        }
                    }
                },
                intelligenceGroups: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            cardCount: { type: 'number' }
                        }
                    }
                },
                strategyName: { type: 'string' }
            },
            required: ['blueprintCards', 'intelligenceCards']
        }
    },
    {
        name: 'generate_strategy_cards',
        description: 'Generate strategy cards based on comprehensive context',
        inputSchema: {
            type: 'object',
            properties: {
                contextSummary: { type: 'string' },
                targetBlueprint: { type: 'string' },
                generationOptions: {
                    type: 'object',
                    properties: {
                        count: { type: 'number' },
                        style: { type: 'string' } // 'comprehensive', 'focused', 'innovative'
                    }
                },
                existingCards: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string' },
                            cardType: { type: 'string' }
                        }
                    }
                }
            },
            required: ['contextSummary', 'targetBlueprint']
        }
    }
];
export async function handleGenerateUniversalExecutiveSummary(args) {
    try {
        const { cards, blueprint_type } = args;
        const systemPrompt = `You are an expert strategic analyst. Analyze the provided cards to automatically detect the blueprint type and generate a focused 3-5 bullet point executive summary.

**Detection Process:**
First, identify the blueprint type from the card content, titles, and field patterns. Blueprint types include: Strategic Context, Vision Statement, Value Proposition, Strategic Bet, Personas, Customer Journey, SWOT Analysis, Competitive Analysis, Market Insight, Experiment, OKRs, Problem Statement, Workstream, Epic, Feature, Business Model, Go-to-Market, GTM Play, Risk Assessment, Roadmap, User Journey, Experience Section, Service Blueprint, Organizational Capability, Tech Stack, Technical Requirement, Cost Driver, Revenue Driver, KPIs, and Financial Projections.

**Summary Framework by Type:**

**Strategy & Vision**: Focus on strategic landscape, competitive positioning, stakeholder considerations, vision scope/timeline, value creation, and differentiation.

**Research & Analysis**: Emphasize user insights, market forces, competitive dynamics, SWOT implications, personas' goals/pain points, journey stages, and improvement opportunities.

**Planning & Execution**: Highlight objectives, success criteria, timelines, ownership, dependencies, feature outcomes, business model mechanics, and go-to-market approach.

**Organizational & Technical**: Cover capability gaps, technical architecture, system requirements, tool justifications, implementation constraints, and strategic alignment.

**Measurement & Financial**: Detail metrics definitions, targets, revenue/cost drivers, scaling potential, financial projections, and performance visibility.

**Output Requirements:**
- Generate exactly 3-5 bullet points
- Each bullet should be specific, actionable, and grounded in card data
- Avoid generic statements; extract real insights
- Maintain strategic perspective while being tactically relevant
- Use clear, executive-level language
- Ensure bullets reflect meaningful insights that guide decision-making

**Format:**
Start with the detected blueprint type, then provide the summary bullets. Each bullet should capture strategic implications, not just descriptions. Focus on what stakeholders need to know to make informed decisions and understand strategic direction.`;
        const userPrompt = `Analyze these ${cards.length} cards${blueprint_type ? ` from the ${blueprint_type} blueprint` : ''}:

${cards.map((card, i) => `
Card ${i + 1}: ${card.title || 'Untitled'}
Description: ${card.description || 'No description'}
Type: ${card.card_type || 'Unknown'}
${card.card_data ? `Data: ${JSON.stringify(card.card_data, null, 2)}` : ''}
`).join('')}

Generate a JSON response with:
{
  "detected_blueprint": "Blueprint Type Name",
  "themes": ["theme 1", "theme 2", "theme 3"],
  "implications": ["implication 1", "implication 2"], 
  "nextSteps": ["step 1", "step 2"],
  "summary": "Overall strategic narrative"
}`;
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
                        metadata: {
                            blueprint_type: blueprint_type || 'auto-detect',
                            card_count: cards.length
                        }
                    })
                }
            ]
        };
    }
    catch (error) {
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
export async function handleGenerateContextSummary(args) {
    try {
        const { blueprintCards, intelligenceCards, strategyName } = args;
        const systemPrompt = `You are a strategic planning expert. Analyze the provided blueprint cards and intelligence cards to create a comprehensive context summary for AI-powered strategy generation.

Your summary should:
1. Synthesize key insights from both blueprint and intelligence cards
2. Identify strategic patterns and opportunities
3. Highlight critical constraints and challenges
4. Provide actionable context for generating new strategy cards

Format the summary with clear sections and bullet points for readability.`;
        // Group blueprint cards by type
        const blueprintsByType = blueprintCards.reduce((acc, card) => {
            if (!acc[card.cardType])
                acc[card.cardType] = [];
            acc[card.cardType].push(card);
            return acc;
        }, {});
        // Group intelligence cards by category
        const intelligenceByCategory = intelligenceCards.reduce((acc, card) => {
            if (!acc[card.category])
                acc[card.category] = [];
            acc[card.category].push(card);
            return acc;
        }, {});
        const userPrompt = `Generate a comprehensive context summary for the strategy: "${strategyName || 'Unnamed Strategy'}"

## Blueprint Cards Analysis (${blueprintCards.length} cards)
${Object.entries(blueprintsByType).map(([type, cards]) => `
### ${type} (${cards.length} cards)
${cards.map((card) => `- **${card.title}**: ${card.description}`).join('\n')}
`).join('\n')}

## Intelligence Cards Analysis (${intelligenceCards.length} cards)
${Object.entries(intelligenceByCategory).map(([category, cards]) => `
### ${category} (${cards.length} cards)
${cards.map((card) => `- **${card.title}** (Relevance: ${card.relevanceScore}/10)
  Key Findings: ${card.keyFindings?.slice(0, 3).join('; ')}`).join('\n')}
`).join('\n')}

Create a strategic context summary that:
1. Identifies the core strategic themes
2. Highlights key opportunities and challenges
3. Notes important constraints and dependencies
4. Suggests focus areas for new card generation
5. Provides a cohesive narrative connecting all insights`;
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
    }
    catch (error) {
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
export async function handleGenerateStrategyCards(args) {
    try {
        const { contextSummary, targetBlueprint, generationOptions = {}, existingCards = [] } = args;
        const { count = 3, style = 'comprehensive' } = generationOptions;
        // Get blueprint configuration
        const blueprintConfigs = {
            'vision': {
                fields: ['visionStatement', 'timeHorizon', 'successMetrics'],
                focus: 'long-term aspirational goals and measurable outcomes'
            },
            'strategic-context': {
                fields: ['marketEnvironment', 'competitiveLandscape', 'internalCapabilities'],
                focus: 'current situation analysis and strategic positioning'
            },
            'value-proposition': {
                fields: ['targetCustomer', 'painPoints', 'uniqueValue', 'differentiation'],
                focus: 'customer needs and unique value delivery'
            },
            'personas': {
                fields: ['demographics', 'behaviors', 'needs', 'painPoints', 'goals'],
                focus: 'detailed user profiles and behavioral patterns'
            },
            'okrs': {
                fields: ['objective', 'keyResults', 'timeframe', 'owner'],
                focus: 'measurable objectives and key results'
            },
            'business-model': {
                fields: ['revenueStreams', 'costStructure', 'keyActivities', 'keyResources'],
                focus: 'how the business creates and captures value'
            },
            'go-to-market': {
                fields: ['channels', 'messaging', 'pricing', 'launchPlan'],
                focus: 'market entry and growth strategies'
            }
        };
        const blueprintConfig = blueprintConfigs[targetBlueprint] || {
            fields: [],
            focus: 'strategic planning and execution'
        };
        const styleGuides = {
            'comprehensive': 'Provide detailed, thorough analysis with multiple perspectives',
            'focused': 'Be concise and action-oriented, focusing on key insights',
            'innovative': 'Think creatively and suggest unconventional approaches'
        };
        const systemPrompt = `You are a strategic planning expert specializing in ${targetBlueprint} blueprint cards. 
Generate high-quality strategy cards that are:
1. Directly relevant to the context summary
2. Actionable and specific
3. Aligned with the ${style} generation style: ${styleGuides[style]}
4. Complementary to existing cards without duplication

Each card should have comprehensive blueprint-specific fields that provide real value.`;
        const userPrompt = `Based on this strategic context, generate ${count} ${targetBlueprint} cards.

## Context Summary:
${contextSummary}

## Existing ${targetBlueprint} Cards (avoid duplication):
${existingCards.filter((c) => c.cardType === targetBlueprint).map((c) => `- ${c.title}`).join('\n') || 'None'}

## Blueprint Focus:
Generate cards focusing on: ${blueprintConfig.focus}

## Required Output Format:
Return a JSON array with ${count} card objects, each containing:
{
  "title": "Clear, actionable title",
  "description": "2-3 sentence description of the card's purpose and value",
  "priority": "high|medium|low",
  "confidence": {
    "level": "high|medium|low",
    "rationale": "Brief explanation of confidence level"
  },
  "keyPoints": ["3-5 key insights or action items"],
  "blueprintFields": {
    ${blueprintConfig.fields.map((field) => `"${field}": "Detailed content for this field"`).join(',\n    ')}
  },
  "tags": ["relevant", "tags"],
  "relationships": ["Related card titles or concepts"],
  "implementation": {
    "timeline": "Suggested timeline",
    "dependencies": ["Key dependencies"],
    "successCriteria": ["Measurable success criteria"]
  }
}

Ensure each card is unique, valuable, and actionable within the strategic context.`;
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
    }
    catch (error) {
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
//# sourceMappingURL=strategy-creator-tools.js.map