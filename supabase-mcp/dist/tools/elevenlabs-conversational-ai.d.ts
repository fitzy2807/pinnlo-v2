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
declare class ElevenLabsConversationalAI {
    private config;
    constructor(apiKey: string);
    private makeRequest;
    createTool(tool: ElevenLabsConversationalTool): Promise<{
        tool_id: string;
    }>;
    getTools(): Promise<ElevenLabsConversationalTool[]>;
    getTool(toolId: string): Promise<ElevenLabsConversationalTool>;
    updateTool(toolId: string, tool: Partial<ElevenLabsConversationalTool>): Promise<void>;
    deleteTool(toolId: string): Promise<void>;
    createAgent(agent: ElevenLabsAgent): Promise<{
        agent_id: string;
    }>;
    getAgents(): Promise<ElevenLabsAgent[]>;
    getAgent(agentId: string): Promise<ElevenLabsAgent>;
    updateAgent(agentId: string, agent: Partial<ElevenLabsAgent>): Promise<void>;
    deleteAgent(agentId: string): Promise<void>;
    createConversation(conversation: ElevenLabsConversation): Promise<{
        conversation_id: string;
    }>;
    getConversations(): Promise<ElevenLabsConversation[]>;
    getConversation(conversationId: string): Promise<ElevenLabsConversation>;
    deleteConversation(conversationId: string): Promise<void>;
    createPinnloTools(mcpServerUrl?: string): Promise<string[]>;
    createPinnloAgent(toolIds: string[], voiceId?: string): Promise<string>;
}
export declare const elevenLabsConversationalTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            webhook_url: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            parameters: {
                type: string;
                description: string;
            };
            prompt?: undefined;
            tool_ids?: undefined;
            built_in_tools?: undefined;
            language?: undefined;
            first_message?: undefined;
            mcp_server_url?: undefined;
            voice_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name?: undefined;
            type?: undefined;
            webhook_url?: undefined;
            description?: undefined;
            parameters?: undefined;
            prompt?: undefined;
            tool_ids?: undefined;
            built_in_tools?: undefined;
            language?: undefined;
            first_message?: undefined;
            mcp_server_url?: undefined;
            voice_id?: undefined;
        };
        required: any[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            tool_ids: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            built_in_tools: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            language: {
                type: string;
                default: string;
                description: string;
            };
            first_message: {
                type: string;
                description: string;
            };
            type?: undefined;
            webhook_url?: undefined;
            description?: undefined;
            parameters?: undefined;
            mcp_server_url?: undefined;
            voice_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            mcp_server_url: {
                type: string;
                default: string;
                description: string;
            };
            voice_id: {
                type: string;
                description: string;
            };
            name?: undefined;
            type?: undefined;
            webhook_url?: undefined;
            description?: undefined;
            parameters?: undefined;
            prompt?: undefined;
            tool_ids?: undefined;
            built_in_tools?: undefined;
            language?: undefined;
            first_message?: undefined;
        };
        required: any[];
    };
})[];
export declare function handleElevenLabsCreateTool(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleElevenLabsGetTools(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleElevenLabsCreateAgent(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleElevenLabsGetAgents(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleElevenLabsCreatePinnloIntegration(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export { ElevenLabsConversationalAI };
//# sourceMappingURL=elevenlabs-conversational-ai.d.ts.map