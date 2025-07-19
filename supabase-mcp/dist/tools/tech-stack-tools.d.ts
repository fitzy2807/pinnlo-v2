/**
 * Tech Stack Tools for MCP Server
 * Generates comprehensive technical documentation for technologies
 */
export declare const techStackTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            technology_name: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                description: string;
                enum: string[];
            };
            existing_stack: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        technology_name: {
                            type: string;
                        };
                        category: {
                            type: string;
                        };
                    };
                };
            };
            company_context: {
                type: string;
                description: string;
                properties: {
                    industry: {
                        type: string;
                    };
                    team_size: {
                        type: string;
                    };
                    tech_maturity: {
                        type: string;
                    };
                };
            };
            components?: undefined;
            project_type?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            components: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        technology_name: {
                            type: string;
                        };
                        category: {
                            type: string;
                        };
                        implementation_status: {
                            type: string;
                        };
                    };
                };
            };
            project_type: {
                type: string;
                description: string;
            };
            technology_name?: undefined;
            category?: undefined;
            existing_stack?: undefined;
            company_context?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleGenerateTechStackComponent(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function handleAnalyzeTechStack(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=tech-stack-tools.d.ts.map