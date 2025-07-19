import fetch from 'node-fetch';
class ElevenLabsClient {
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
    async getVoices() {
        const response = await this.makeRequest('/voices');
        const data = await response.json();
        return data.voices || [];
    }
    async getVoice(voiceId) {
        const response = await this.makeRequest(`/voices/${voiceId}`);
        return await response.json();
    }
    async textToSpeech(request) {
        const response = await this.makeRequest(`/text-to-speech/${request.voice_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
            },
            body: JSON.stringify({
                text: request.text,
                model_id: request.model_id || 'eleven_monolingual_v1',
                voice_settings: request.voice_settings || {
                    stability: 0.5,
                    similarity_boost: 0.5,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });
        return Buffer.from(await response.arrayBuffer());
    }
    async speechToText(request) {
        const response = await this.makeRequest('/speech-to-text', {
            method: 'POST',
            body: JSON.stringify({
                audio_url: request.audio_url,
                model_id: request.model_id || 'eleven_multilingual_v2',
                language: request.language
            })
        });
        return await response.json();
    }
    async getModels() {
        const response = await this.makeRequest('/models');
        return await response.json();
    }
    async getUser() {
        const response = await this.makeRequest('/user');
        return await response.json();
    }
    async getSubscription() {
        const response = await this.makeRequest('/user/subscription');
        return await response.json();
    }
}
// Tool definitions for MCP
export const elevenLabsTools = [
    {
        name: 'get_elevenlabs_voices',
        description: 'Get available voices from ElevenLabs',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'get_elevenlabs_voice',
        description: 'Get details for a specific ElevenLabs voice',
        inputSchema: {
            type: 'object',
            properties: {
                voice_id: {
                    type: 'string',
                    description: 'The voice ID to get details for'
                }
            },
            required: ['voice_id']
        }
    },
    {
        name: 'elevenlabs_text_to_speech',
        description: 'Convert text to speech using ElevenLabs',
        inputSchema: {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    description: 'The text to convert to speech'
                },
                voice_id: {
                    type: 'string',
                    description: 'The voice ID to use for synthesis'
                },
                model_id: {
                    type: 'string',
                    description: 'The model to use (default: eleven_monolingual_v1)',
                    default: 'eleven_monolingual_v1'
                },
                voice_settings: {
                    type: 'object',
                    description: 'Voice settings for synthesis',
                    properties: {
                        stability: { type: 'number', minimum: 0, maximum: 1, default: 0.5 },
                        similarity_boost: { type: 'number', minimum: 0, maximum: 1, default: 0.5 },
                        style: { type: 'number', minimum: 0, maximum: 1, default: 0.0 },
                        use_speaker_boost: { type: 'boolean', default: true }
                    }
                },
                output_format: {
                    type: 'string',
                    description: 'Output audio format',
                    enum: ['mp3_22050_32', 'mp3_44100_32', 'mp3_44100_64', 'mp3_44100_96', 'mp3_44100_128', 'mp3_44100_192', 'pcm_16000', 'pcm_22050', 'pcm_24000', 'pcm_44100', 'ulaw_8000'],
                    default: 'mp3_44100_128'
                }
            },
            required: ['text', 'voice_id']
        }
    },
    {
        name: 'elevenlabs_speech_to_text',
        description: 'Convert speech to text using ElevenLabs',
        inputSchema: {
            type: 'object',
            properties: {
                audio_url: {
                    type: 'string',
                    description: 'URL to the audio file to transcribe'
                },
                model_id: {
                    type: 'string',
                    description: 'The model to use (default: eleven_multilingual_v2)',
                    default: 'eleven_multilingual_v2'
                },
                language: {
                    type: 'string',
                    description: 'Language code for transcription (optional)'
                }
            },
            required: ['audio_url']
        }
    },
    {
        name: 'get_elevenlabs_models',
        description: 'Get available ElevenLabs models',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'get_elevenlabs_user',
        description: 'Get ElevenLabs user information',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'get_elevenlabs_subscription',
        description: 'Get ElevenLabs subscription information',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    }
];
// Tool handlers
export async function handleGetElevenLabsVoices(args) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    const client = new ElevenLabsClient(apiKey);
    const voices = await client.getVoices();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(voices, null, 2)
            }]
    };
}
export async function handleGetElevenLabsVoice(args) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    const client = new ElevenLabsClient(apiKey);
    const voice = await client.getVoice(args.voice_id);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(voice, null, 2)
            }]
    };
}
export async function handleElevenLabsTextToSpeech(args) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    const client = new ElevenLabsClient(apiKey);
    const audioBuffer = await client.textToSpeech(args);
    // Convert buffer to base64 for transmission
    const base64Audio = audioBuffer.toString('base64');
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    message: 'Audio generated successfully',
                    audio_base64: base64Audio,
                    format: args.output_format || 'mp3_44100_128',
                    size_bytes: audioBuffer.length
                }, null, 2)
            }]
    };
}
export async function handleElevenLabsSpeechToText(args) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    const client = new ElevenLabsClient(apiKey);
    const result = await client.speechToText(args);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2)
            }]
    };
}
export async function handleGetElevenLabsModels(args) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    const client = new ElevenLabsClient(apiKey);
    const models = await client.getModels();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(models, null, 2)
            }]
    };
}
export async function handleGetElevenLabsUser(args) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    const client = new ElevenLabsClient(apiKey);
    const user = await client.getUser();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(user, null, 2)
            }]
    };
}
export async function handleGetElevenLabsSubscription(args) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    const client = new ElevenLabsClient(apiKey);
    const subscription = await client.getSubscription();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(subscription, null, 2)
            }]
    };
}
//# sourceMappingURL=elevenlabs-tools.js.map