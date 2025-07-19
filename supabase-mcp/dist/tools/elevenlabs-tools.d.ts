export declare const elevenLabsTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            voice_id?: undefined;
            text?: undefined;
            model_id?: undefined;
            voice_settings?: undefined;
            output_format?: undefined;
            audio_url?: undefined;
            language?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            voice_id: {
                type: string;
                description: string;
            };
            text?: undefined;
            model_id?: undefined;
            voice_settings?: undefined;
            output_format?: undefined;
            audio_url?: undefined;
            language?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            text: {
                type: string;
                description: string;
            };
            voice_id: {
                type: string;
                description: string;
            };
            model_id: {
                type: string;
                description: string;
                default: string;
            };
            voice_settings: {
                type: string;
                description: string;
                properties: {
                    stability: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    similarity_boost: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    style: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    use_speaker_boost: {
                        type: string;
                        default: boolean;
                    };
                };
            };
            output_format: {
                type: string;
                description: string;
                enum: string[];
                default: string;
            };
            audio_url?: undefined;
            language?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            audio_url: {
                type: string;
                description: string;
            };
            model_id: {
                type: string;
                description: string;
                default: string;
            };
            language: {
                type: string;
                description: string;
            };
            voice_id?: undefined;
            text?: undefined;
            voice_settings?: undefined;
            output_format?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleGetElevenLabsVoices(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleGetElevenLabsVoice(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleElevenLabsTextToSpeech(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleElevenLabsSpeechToText(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleGetElevenLabsModels(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleGetElevenLabsUser(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleGetElevenLabsSubscription(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=elevenlabs-tools.d.ts.map