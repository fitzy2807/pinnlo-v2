export declare const developmentBankTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            companyProfile: {
                type: string;
                properties: {
                    size: {
                        type: string;
                        enum: string[];
                    };
                    budget: {
                        type: string;
                        properties: {
                            min: {
                                type: string;
                            };
                            max: {
                                type: string;
                            };
                            currency: {
                                type: string;
                            };
                        };
                    };
                    teamSize: {
                        type: string;
                    };
                    existingSkills: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                required: string[];
            };
            projectRequirements: {
                type: string;
                properties: {
                    projectType: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    features: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    constraints: {
                        type: string;
                        properties: {
                            hasRealtime: {
                                type: string;
                            };
                            hasAuth: {
                                type: string;
                            };
                            hasPayments: {
                                type: string;
                            };
                            scalability: {
                                type: string;
                            };
                            performance: {
                                type: string;
                            };
                            compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            strategyContext: {
                type: string;
                properties: {
                    vision: {
                        type: string;
                    };
                    targetMarket: {
                        type: string;
                    };
                    timeframe: {
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
                                cardType: {
                                    type: string;
                                };
                                techConsiderations: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
            features?: undefined;
            epics?: undefined;
            techStack?: undefined;
            options?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            features: {
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
                        userStories: {
                            type: string;
                        };
                        acceptanceCriteria: {
                            type: string;
                        };
                        techConsiderations: {
                            type: string;
                        };
                        dependencies: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        linkedPersona: {
                            type: string;
                        };
                        estimation?: undefined;
                    };
                };
            };
            epics: {
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
                        outcomes: {
                            type: string;
                        };
                        successCriteria: {
                            type: string;
                        };
                        milestones?: undefined;
                    };
                };
            };
            techStack: {
                type: string;
                properties: {
                    stackName: {
                        type: string;
                    };
                    layers: {
                        type: string;
                    };
                };
            };
            options: {
                type: string;
                properties: {
                    format: {
                        type: string;
                        enum: string[];
                    };
                    includeExamples: {
                        type: string;
                    };
                    includeDiagrams: {
                        type: string;
                    };
                    includeEdgeCases?: undefined;
                    includeTestData?: undefined;
                };
            };
            companyProfile?: undefined;
            projectRequirements?: undefined;
            strategyContext?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            features: {
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
                        acceptanceCriteria: {
                            type: string;
                        };
                        userStories: {
                            type: string;
                        };
                        linkedPersona: {
                            type: string;
                        };
                        description?: undefined;
                        techConsiderations?: undefined;
                        dependencies?: undefined;
                        estimation?: undefined;
                    };
                };
            };
            techStack: {
                type: string;
                properties: {
                    stackName: {
                        type: string;
                    };
                    layers: {
                        type: string;
                    };
                };
            };
            options: {
                type: string;
                properties: {
                    includeEdgeCases: {
                        type: string;
                    };
                    includeTestData: {
                        type: string;
                    };
                    format: {
                        type: string;
                        enum: string[];
                    };
                    includeExamples?: undefined;
                    includeDiagrams?: undefined;
                };
            };
            companyProfile?: undefined;
            projectRequirements?: undefined;
            strategyContext?: undefined;
            epics?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            features: {
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
                        dependencies: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        estimation: {
                            type: string;
                        };
                        userStories?: undefined;
                        acceptanceCriteria?: undefined;
                        techConsiderations?: undefined;
                        linkedPersona?: undefined;
                    };
                };
            };
            epics: {
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
                        milestones: {
                            type: string;
                        };
                        description?: undefined;
                        outcomes?: undefined;
                        successCriteria?: undefined;
                    };
                };
            };
            techStack: {
                type: string;
                properties: {
                    stackName: {
                        type: string;
                    };
                    layers: {
                        type: string;
                    };
                };
            };
            companyProfile?: undefined;
            projectRequirements?: undefined;
            strategyContext?: undefined;
            options?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleGenerateTechStackRecommendations(args: any): Promise<{
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
export declare function handleGenerateTechnicalSpecification(args: any): Promise<{
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
export declare function handleGenerateTestScenarios(args: any): Promise<{
    success: boolean;
    tool: string;
    prompt: {
        messages: {
            role: string;
            content: string;
        }[];
        model: string;
        temperature: number;
    };
    error?: undefined;
} | {
    success: boolean;
    error: any;
    tool?: undefined;
    prompt?: undefined;
}>;
export declare function handleGenerateTaskList(args: any): Promise<{
    success: boolean;
    tool: string;
    prompt: {
        messages: {
            role: string;
            content: string;
        }[];
        model: string;
        temperature: number;
    };
    error?: undefined;
} | {
    success: boolean;
    error: any;
    tool?: undefined;
    prompt?: undefined;
}>;
//# sourceMappingURL=development-bank-tools.d.ts.map