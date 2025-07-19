/**
 * Simplified GitHub Analysis Tools for MCP Server
 * Provides basic GitHub repository analysis capabilities
 */
export declare const githubAnalysisTools: {
    analyze_github_repository: {
        description: string;
        inputSchema: {
            type: string;
            properties: {
                repository_url: {
                    type: string;
                    description: string;
                };
                github_token: {
                    type: string;
                    description: string;
                };
                analysis_depth: {
                    type: string;
                    enum: string[];
                    default: string;
                    description: string;
                };
                focus_areas: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                user_id: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        handler: ({ repository_url, github_token, analysis_depth, focus_areas, user_id }: {
            repository_url: any;
            github_token: any;
            analysis_depth?: string | undefined;
            focus_areas?: never[] | undefined;
            user_id: any;
        }) => Promise<{
            content: {
                type: string;
                text: string;
            }[];
        }>;
    };
};
export declare const handleAnalyzeGitHubRepository: ({ repository_url, github_token, analysis_depth, focus_areas, user_id }: {
    repository_url: any;
    github_token: any;
    analysis_depth?: string | undefined;
    focus_areas?: never[] | undefined;
    user_id: any;
}) => Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=github-analysis-tools-simple.d.ts.map