export declare const batchedDevelopmentBankTools: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            trdId: {
                type: string;
            };
            trdTitle: {
                type: string;
            };
            trdContent: {
                type: string;
            };
            strategyId: {
                type: string;
            };
            userId: {
                type: string;
            };
        };
        required: string[];
    };
}[];
export declare function handleCommitTrdToTaskListBatched(args: any): Promise<{
    success: boolean;
    orchestrationPlan: {
        metadata: {
            system: string;
            user: string;
        };
        batches: {
            batch1: {
                system: string;
                user: string;
            };
            batch2: {
                system: string;
                user: string;
            };
            batch3: {
                system: string;
                user: string;
            };
        };
        config: {
            model: string;
            temperature: number;
            max_tokens: number;
        };
    };
    metadata: {
        trdId: any;
        trdTitle: any;
        strategyId: any;
        userId: any;
        batchingStrategy: string;
        estimatedTokens: string;
        timestamp: string;
    };
    error?: undefined;
} | {
    success: boolean;
    error: any;
    orchestrationPlan?: undefined;
    metadata?: undefined;
}>;
//# sourceMappingURL=development-bank-tools-batched.d.ts.map