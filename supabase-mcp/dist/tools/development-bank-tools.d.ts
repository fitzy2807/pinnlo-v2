export declare const developmentBankTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            strategyContext: {
                type: string;
                properties: {
                    title: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    cards: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                title: {
                                    type: string;
                                };
                                description: {
                                    type: string;
                                };
                                card_type: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
            features: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                        };
                        name: {
                            type: string;
                        };
                        description: {
                            type: string;
                        };
                    };
                };
            };
            options: {
                type: string;
                properties: {
                    model: {
                        type: string;
                        enum: string[];
                    };
                    includeArchitecture: {
                        type: string;
                    };
                    includeDataModels: {
                        type: string;
                    };
                    includeAPIs: {
                        type: string;
                    };
                    includeSecurityRequirements: {
                        type: string;
                    };
                    format: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            trdId?: undefined;
            trdTitle?: undefined;
            trdContent?: undefined;
            strategyId?: undefined;
            userId?: undefined;
        };
        required: string[];
    };
} | {
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
                properties: {
                    featureRequirements: {
                        type: string;
                    };
                    technicalArchitecture: {
                        type: string;
                    };
                    securityRequirements: {
                        type: string;
                    };
                    performanceRequirements: {
                        type: string;
                    };
                };
            };
            strategyId: {
                type: string;
            };
            userId: {
                type: string;
            };
            strategyContext?: undefined;
            features?: undefined;
            options?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleGenerateTechnicalRequirement(args: any): Promise<{
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
export declare function handleCommitTrdToTaskList(args: any): Promise<{
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
//# sourceMappingURL=development-bank-tools.d.ts.map