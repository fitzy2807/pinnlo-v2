import fetch from 'node-fetch';

interface ElevenLabsConversationalTool {
  name: string;
  type: 'server' | 'client';
  webhook_url?: string;
  description?: string;
  parameters?: any;
}

interface ElevenLabsAgent {
  name: string;
  prompt: {
    prompt: string;
    tool_ids: string[];
    built_in_tools?: string[];
  };
  language?: string;
  first_message?: string;
  conversation_config?: {
    turn_detection?: {
      type: 'server_vad';
      threshold?: number;
      prefix_padding_ms?: number;
      silence_duration_ms?: number;
    };
    agent_output_audio_format?: 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'mp3_22050_32' | 'mp3_44100_64' | 'mp3_44100_128' | 'mp3_44100_192';
    client_input_audio_format?: 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'mp3_22050_32' | 'mp3_44100_64' | 'mp3_44100_128' | 'mp3_44100_192';
  };
}

interface ElevenLabsConversation {
  conversation_id: string;
  agent_id: string;
  requires_auth?: boolean;
  cookie?: string;
  callback_url?: string;
}

class ElevenLabsConversationalAI {
  private config: {
    apiKey: string;
    baseUrl: string;
  };

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://api.elevenlabs.io/v1'
    };
  }

  private async makeRequest(endpoint: string, options: any = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Xi-Api-Key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    return response;
  }

  // Tool Management (New Architecture)
  async createTool(tool: ElevenLabsConversationalTool): Promise<{ tool_id: string }> {
    const response = await this.makeRequest('/convai/tools', {
      method: 'POST',
      body: JSON.stringify(tool)
    });

    return await response.json() as { tool_id: string };
  }

  async getTools(): Promise<ElevenLabsConversationalTool[]> {
    const response = await this.makeRequest('/convai/tools');
    return await response.json() as ElevenLabsConversationalTool[];
  }

  async getTool(toolId: string): Promise<ElevenLabsConversationalTool> {
    const response = await this.makeRequest(`/convai/tools/${toolId}`);
    return await response.json() as ElevenLabsConversationalTool;
  }

  async updateTool(toolId: string, tool: Partial<ElevenLabsConversationalTool>): Promise<void> {
    await this.makeRequest(`/convai/tools/${toolId}`, {
      method: 'PUT',
      body: JSON.stringify(tool)
    });
  }

  async deleteTool(toolId: string): Promise<void> {
    await this.makeRequest(`/convai/tools/${toolId}`, {
      method: 'DELETE'
    });
  }

  // Agent Management (New Architecture)
  async createAgent(agent: ElevenLabsAgent): Promise<{ agent_id: string }> {
    const response = await this.makeRequest('/convai/agents', {
      method: 'POST',
      body: JSON.stringify(agent)
    });

    return await response.json() as { agent_id: string };
  }

  async getAgents(): Promise<ElevenLabsAgent[]> {
    const response = await this.makeRequest('/convai/agents');
    return await response.json() as ElevenLabsAgent[];
  }

  async getAgent(agentId: string): Promise<ElevenLabsAgent> {
    const response = await this.makeRequest(`/convai/agents/${agentId}`);
    return await response.json() as ElevenLabsAgent;
  }

  async updateAgent(agentId: string, agent: Partial<ElevenLabsAgent>): Promise<void> {
    await this.makeRequest(`/convai/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(agent)
    });
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.makeRequest(`/convai/agents/${agentId}`, {
      method: 'DELETE'
    });
  }

  // Conversation Management
  async createConversation(conversation: ElevenLabsConversation): Promise<{ conversation_id: string }> {
    const response = await this.makeRequest('/convai/conversations', {
      method: 'POST',
      body: JSON.stringify(conversation)
    });

    return await response.json() as { conversation_id: string };
  }

  async getConversations(): Promise<ElevenLabsConversation[]> {
    const response = await this.makeRequest('/convai/conversations');
    return await response.json() as ElevenLabsConversation[];
  }

  async getConversation(conversationId: string): Promise<ElevenLabsConversation> {
    const response = await this.makeRequest(`/convai/conversations/${conversationId}`);
    return await response.json() as ElevenLabsConversation;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.makeRequest(`/convai/conversations/${conversationId}`, {
      method: 'DELETE'
    });
  }

  // Helper method to create PINNLO-specific tools
  async createPinnloTools(mcpServerUrl: string = 'http://localhost:3001'): Promise<string[]> {
    const pinnloTools = [
      {
        name: 'process_voice_intelligence',
        type: 'server' as const,
        webhook_url: `${mcpServerUrl}/api/tools/process_intelligence_text`,
        description: 'Process voice input into intelligence cards for PINNLO strategy planning',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'The transcribed voice input' },
            context: { type: 'string', description: 'Additional context for processing' }
          },
          required: ['text']
        }
      },
      {
        name: 'generate_strategy_cards',
        type: 'server' as const,
        webhook_url: `${mcpServerUrl}/api/tools/generate_strategy_cards`,
        description: 'Generate strategy cards based on voice conversation',
        parameters: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Strategy generation prompt' },
            context: { type: 'string', description: 'Strategy context' }
          },
          required: ['prompt']
        }
      },
      {
        name: 'generate_technical_requirement',
        type: 'server' as const,
        webhook_url: `${mcpServerUrl}/api/tools/generate_technical_requirement`,
        description: 'Generate technical requirements from voice specifications',
        parameters: {
          type: 'object',
          properties: {
            features: { type: 'array', description: 'List of features to generate requirements for' },
            strategyContext: { type: 'object', description: 'Strategy context' }
          },
          required: ['features']
        }
      },
      {
        name: 'analyze_url',
        type: 'server' as const,
        webhook_url: `${mcpServerUrl}/api/tools/analyze_url`,
        description: 'Analyze URLs mentioned in voice conversations',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to analyze' },
            analysis_type: { type: 'string', description: 'Type of analysis to perform' }
          },
          required: ['url']
        }
      }
    ];

    const toolIds: string[] = [];
    
    for (const tool of pinnloTools) {
      const result = await this.createTool(tool);
      toolIds.push(result.tool_id);
    }

    return toolIds;
  }

  // Helper method to create a PINNLO-optimized agent
  async createPinnloAgent(toolIds: string[], voiceId?: string): Promise<string> {
    const agent: ElevenLabsAgent = {
      name: 'PINNLO Strategy Assistant',
      prompt: {
        prompt: `You are a strategic planning assistant for PINNLO, an AI-powered strategy platform. 

Your role is to help users:
- Process voice input into actionable strategy cards
- Generate technical requirements from feature descriptions
- Analyze competitive intelligence from URLs
- Create comprehensive strategy documentation

Always be concise, strategic, and focused on actionable outcomes. When users speak about features, requirements, or strategy, immediately leverage your tools to create structured outputs in PINNLO.

Available tools:
- process_voice_intelligence: Convert voice input to structured intelligence
- generate_strategy_cards: Create strategy cards from conversations
- generate_technical_requirement: Generate technical specs from feature discussions
- analyze_url: Analyze competitive or reference URLs

Keep responses under 100 words and always suggest concrete next steps.`,
        tool_ids: toolIds,
        built_in_tools: ['end_call', 'language_detection']
      },
      language: 'en',
      first_message: 'Hello! I\'m your PINNLO Strategy Assistant. I can help you turn voice conversations into structured strategy documents, technical requirements, and competitive intelligence. What would you like to work on today?',
      conversation_config: {
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        },
        agent_output_audio_format: 'mp3_44100_128',
        client_input_audio_format: 'mp3_44100_128'
      }
    };

    const result = await this.createAgent(agent);
    return result.agent_id;
  }
}

// Tool definitions for MCP
export const elevenLabsConversationalTools = [
  {
    name: 'elevenlabs_create_tool',
    description: 'Create a new ElevenLabs conversational AI tool',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tool name' },
        type: { type: 'string', enum: ['server', 'client'], description: 'Tool type' },
        webhook_url: { type: 'string', description: 'Webhook URL for server tools' },
        description: { type: 'string', description: 'Tool description' },
        parameters: { type: 'object', description: 'Tool parameters schema' }
      },
      required: ['name', 'type']
    }
  },
  {
    name: 'elevenlabs_get_tools',
    description: 'Get all ElevenLabs conversational AI tools',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'elevenlabs_create_agent',
    description: 'Create a new ElevenLabs conversational AI agent',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name' },
        prompt: { type: 'string', description: 'Agent prompt' },
        tool_ids: { type: 'array', items: { type: 'string' }, description: 'Tool IDs to use' },
        built_in_tools: { type: 'array', items: { type: 'string' }, description: 'Built-in tools' },
        language: { type: 'string', default: 'en', description: 'Agent language' },
        first_message: { type: 'string', description: 'First message from agent' }
      },
      required: ['name', 'prompt', 'tool_ids']
    }
  },
  {
    name: 'elevenlabs_get_agents',
    description: 'Get all ElevenLabs conversational AI agents',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'elevenlabs_create_pinnlo_integration',
    description: 'Create a complete PINNLO-ElevenLabs integration with tools and agent',
    inputSchema: {
      type: 'object',
      properties: {
        mcp_server_url: { 
          type: 'string', 
          default: 'http://localhost:3001', 
          description: 'MCP server URL' 
        },
        voice_id: { 
          type: 'string', 
          description: 'Optional voice ID for the agent' 
        }
      },
      required: []
    }
  }
];

// Tool handlers
export async function handleElevenLabsCreateTool(args: any) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }

  const client = new ElevenLabsConversationalAI(apiKey);
  const result = await client.createTool(args);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

export async function handleElevenLabsGetTools(args: any) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }

  const client = new ElevenLabsConversationalAI(apiKey);
  const tools = await client.getTools();
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(tools, null, 2)
    }]
  };
}

export async function handleElevenLabsCreateAgent(args: any) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }

  const client = new ElevenLabsConversationalAI(apiKey);
  const agent = {
    name: args.name,
    prompt: {
      prompt: args.prompt,
      tool_ids: args.tool_ids,
      built_in_tools: args.built_in_tools || ['end_call', 'language_detection']
    },
    language: args.language || 'en',
    first_message: args.first_message
  };
  
  const result = await client.createAgent(agent);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

export async function handleElevenLabsGetAgents(args: any) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }

  const client = new ElevenLabsConversationalAI(apiKey);
  const agents = await client.getAgents();
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(agents, null, 2)
    }]
  };
}

export async function handleElevenLabsCreatePinnloIntegration(args: any) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }

  const client = new ElevenLabsConversationalAI(apiKey);
  const mcpServerUrl = args.mcp_server_url || 'http://localhost:3001';
  
  // Create PINNLO-specific tools
  const toolIds = await client.createPinnloTools(mcpServerUrl);
  
  // Create PINNLO-optimized agent
  const agentId = await client.createPinnloAgent(toolIds, args.voice_id);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: true,
        message: 'PINNLO-ElevenLabs integration created successfully',
        tool_ids: toolIds,
        agent_id: agentId,
        mcp_server_url: mcpServerUrl,
        next_steps: [
          'Use the agent_id to create conversations',
          'Connect your frontend to the ElevenLabs WebSocket',
          'Test voice interactions with PINNLO tools'
        ]
      }, null, 2)
    }]
  };
}

export { ElevenLabsConversationalAI };