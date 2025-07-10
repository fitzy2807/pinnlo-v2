import { Tool } from '@modelcontextprotocol/sdk/types.js';

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