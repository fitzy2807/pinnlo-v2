import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const strategyCreatorTools = [
  {
    name: 'generate_context_summary',
    description: 'Generate context summary for strategy creation',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'object',
          properties: {
            businessContext: { type: 'string' },
            goals: { type: 'array', items: { type: 'string' } },
            challenges: { type: 'array', items: { type: 'string' } },
            constraints: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['context']
    }
  },
  {
    name: 'generate_strategy_cards',
    description: 'Generate strategy cards based on context',
    inputSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        cardTypes: { type: 'array', items: { type: 'string' } },
        count: { type: 'number' }
      },
      required: ['summary', 'cardTypes']
    }
  }
];

export async function handleGenerateContextSummary(args) {
  try {
    const { context } = args;
    
    const systemPrompt = `You are a strategic planning expert. Create a concise summary of the business context.`;
    
    const userPrompt = `Summarize this business context:
    
Business Context: ${context.businessContext}
Goals: ${context.goals?.join(', ')}
Challenges: ${context.challenges?.join(', ')}
Constraints: ${context.constraints?.join(', ')}

Provide a clear, actionable summary in 2-3 paragraphs.`;

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

export async function handleGenerateStrategyCards(args) {
  try {
    const { summary, cardTypes, count = 5 } = args;
    
    const systemPrompt = `You are a strategic planning expert. Generate strategy cards based on the provided context.`;
    
    const userPrompt = `Based on this context summary, generate ${count} strategy cards of types: ${cardTypes.join(', ')}.

Context: ${summary}

Return as JSON array with objects containing: title, description, cardType, priority, keyPoints.`;

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