import fetch from 'node-fetch';
class ElevenLabsConversationalAI {
    config;
    constructor(apiKey) {
        this.config = {
            apiKey,
            baseUrl: 'https://api.elevenlabs.io/v1'
        };
    }
    async makeRequest(endpoint, options = {}) {
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
    async createTool(tool) {
        const response = await this.makeRequest('/convai/tools', {
            method: 'POST',
            body: JSON.stringify(tool)
        });
        return await response.json();
    }
    async getTools() {
        const response = await this.makeRequest('/convai/tools');
        return await response.json();
    }
    async getTool(toolId) {
        const response = await this.makeRequest(`/convai/tools/${toolId}`);
        return await response.json();
    }
    async updateTool(toolId, tool) {
        await this.makeRequest(`/convai/tools/${toolId}`, {
            method: 'PUT',
            body: JSON.stringify(tool)
        });
    }
    async deleteTool(toolId) {
        await this.makeRequest(`/convai/tools/${toolId}`, {
            method: 'DELETE'
        });
    }
    // Agent Management (New Architecture)
    async createAgent(agent) {
        const response = await this.makeRequest('/convai/agents', {
            method: 'POST',
            body: JSON.stringify(agent)
        });
        return await response.json();
    }
    async getAgents() {
        const response = await this.makeRequest('/convai/agents');
        return await response.json();
    }
    async getAgent(agentId) {
        const response = await this.makeRequest(`/convai/agents/${agentId}`);
        return await response.json();
    }
    async updateAgent(agentId, agent) {
        await this.makeRequest(`/convai/agents/${agentId}`, {
            method: 'PUT',
            body: JSON.stringify(agent)
        });
    }
    async deleteAgent(agentId) {
        await this.makeRequest(`/convai/agents/${agentId}`, {
            method: 'DELETE'
        });
    }
    // Conversation Management
    async createConversation(conversation) {
        const response = await this.makeRequest('/convai/conversations', {
            method: 'POST',
            body: JSON.stringify(conversation)
        });
        return await response.json();
    }
    async getConversations() {
        const response = await this.makeRequest('/convai/conversations');
        return await response.json();
    }
    async getConversation(conversationId) {
        const response = await this.makeRequest(`/convai/conversations/${conversationId}`);
        return await response.json();
    }
    async deleteConversation(conversationId) {
        await this.makeRequest(`/convai/conversations/${conversationId}`, {
            method: 'DELETE'
        });
    }
    // Helper method to create PINNLO-specific tools
    async createPinnloTools(mcpServerUrl = 'http://localhost:3001') {
        const pinnloTools = [
            {
                name: 'process_voice_intelligence',
                type: 'server',
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
                type: 'server',
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
                type: 'server',
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
                type: 'server',
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
        const toolIds = [];
        for (const tool of pinnloTools) {
            const result = await this.createTool(tool);
            toolIds.push(result.tool_id);
        }
        return toolIds;
    }
    // Helper method to create a PINNLO-optimized agent
    async createPinnloAgent(toolIds, voiceId) {
        const agent = {
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
export async function handleElevenLabsCreateTool(args) {
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
export async function handleElevenLabsGetTools(args) {
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
export async function handleElevenLabsCreateAgent(args) {
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
export async function handleElevenLabsGetAgents(args) {
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
export async function handleElevenLabsCreatePinnloIntegration(args) {
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
//# sourceMappingURL=elevenlabs-conversational-ai.js.map