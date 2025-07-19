export declare const editModeGeneratorTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            cardId: {
                type: string;
                description: string;
            };
            blueprintType: {
                type: string;
                description: string;
            };
            cardTitle: {
                type: string;
                description: string;
            };
            strategyId: {
                type: string;
                description: string;
            };
            userId: {
                type: string;
                description: string;
            };
            existingFields: {
                type: string;
                description: string;
                additionalProperties: boolean;
            };
            transcript?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            cardId: {
                type: string;
                description: string;
            };
            blueprintType: {
                type: string;
                description: string;
            };
            cardTitle: {
                type: string;
                description: string;
            };
            transcript: {
                type: string;
                description: string;
            };
            userId: {
                type: string;
                description: string;
            };
            existingFields: {
                type: string;
                description: string;
                additionalProperties: boolean;
            };
            strategyId?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleGenerateEditModeContent(args: any): Promise<any>;
export declare function handleProcessVoiceEditContent(args: any): Promise<any>;
//# sourceMappingURL=edit-mode-generator.d.ts.map