export declare const strategyCreatorTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            blueprintCards: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                        };
                        title: {
                            type: string;
                        };
                        description: {
                            type: string;
                        };
                        cardType: {
                            type: string;
                        };
                        blueprintFields: {
                            type: string;
                        };
                    };
                };
            };
            intelligenceCards: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                        };
                        title: {
                            type: string;
                        };
                        category: {
                            type: string;
                        };
                        keyFindings: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        relevanceScore: {
                            type: string;
                        };
                    };
                };
            };
            intelligenceGroups: {
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
                        cardCount: {
                            type: string;
                        };
                    };
                };
            };
            strategyName: {
                type: string;
            };
            contextSummary?: undefined;
            targetBlueprint?: undefined;
            generationOptions?: undefined;
            existingCards?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            contextSummary: {
                type: string;
            };
            targetBlueprint: {
                type: string;
            };
            generationOptions: {
                type: string;
                properties: {
                    count: {
                        type: string;
                    };
                    style: {
                        type: string;
                    };
                };
            };
            existingCards: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        title: {
                            type: string;
                        };
                        cardType: {
                            type: string;
                        };
                    };
                };
            };
            blueprintCards?: undefined;
            intelligenceCards?: undefined;
            intelligenceGroups?: undefined;
            strategyName?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleGenerateContextSummary(args: any): Promise<{
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
export declare function handleGenerateStrategyCards(args: any): Promise<{
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
//# sourceMappingURL=strategy-creator-tools.d.ts.map