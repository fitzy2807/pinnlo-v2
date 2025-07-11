export declare const intelligenceTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            url: {
                type: string;
            };
            context: {
                type: string;
            };
            text?: undefined;
            type?: undefined;
            userId?: undefined;
            ruleId?: undefined;
            categories?: undefined;
            maxCards?: undefined;
            targetGroups?: undefined;
            optimizationLevel?: undefined;
            triggerType?: undefined;
            systemPrompt?: undefined;
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
            };
            context: {
                type: string;
            };
            type: {
                type: string;
            };
            userId: {
                type: string;
            };
            url?: undefined;
            ruleId?: undefined;
            categories?: undefined;
            maxCards?: undefined;
            targetGroups?: undefined;
            optimizationLevel?: undefined;
            triggerType?: undefined;
            systemPrompt?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            userId: {
                type: string;
            };
            ruleId: {
                type: string;
            };
            categories: {
                type: string;
                items: {
                    type: string;
                };
            };
            maxCards: {
                type: string;
            };
            targetGroups: {
                type: string;
                items: {
                    type: string;
                };
            };
            optimizationLevel: {
                type: string;
                enum: string[];
            };
            triggerType: {
                type: string;
                enum: string[];
            };
            systemPrompt: {
                type: string;
                description: string;
            };
            url?: undefined;
            context?: undefined;
            text?: undefined;
            type?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleAnalyzeUrl(args: any, supabase: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare function handleProcessIntelligenceText(args: any, supabase: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare function handleGenerateAutomationIntelligence(args: any, supabase: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
//# sourceMappingURL=ai-generation.d.ts.map