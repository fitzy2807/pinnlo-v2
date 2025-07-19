/**
 * Three-Agent GitHub Analysis System
 * Agent 1: Repository Explorer - Comprehensive file scanning and data collection
 * Agent 2: Technology Analyzer - Structured categorization and processing
 * Agent 3: Gap Analysis Engine - Strategic recommendations and gap identification
 */
interface RepositoryData {
    name: string;
    full_name: string;
    description: string;
    language: string;
    size: number;
    updated_at: string;
    default_branch: string;
}
interface FileContent {
    path: string;
    content: string;
    size: number;
    type: string;
}
interface ExplorerResult {
    repository_info: RepositoryData;
    files: FileContent[];
    directory_structure: string[];
    total_files_scanned: number;
    analysis_timestamp: string;
}
/**
 * AGENT 1: Repository Explorer
 * Scans repository comprehensively and collects raw file data
 */
export declare class RepositoryExplorer {
    private github;
    private owner;
    private repo;
    constructor(githubToken: string, owner: string, repo: string);
    /**
     * Main exploration method - scans entire repository
     */
    explore(): Promise<ExplorerResult>;
    /**
     * Get repository basic information
     */
    private getRepositoryInfo;
    /**
     * Get all files in the repository using recursive tree API
     */
    private getAllFiles;
    /**
     * Prioritize files for analysis based on importance
     */
    private prioritizeFiles;
    /**
     * Fetch contents of prioritized files
     */
    private fetchFileContents;
    /**
     * Build directory structure for overview
     */
    private buildDirectoryStructure;
    /**
     * Get file type based on extension
     */
    private getFileType;
    /**
     * Get default branch name
     */
    private getDefaultBranch;
}
export declare const repositoryExplorerTool: {
    name: string;
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
            user_id: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: ({ repository_url, github_token, user_id }: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
/**
 * AGENT 2: Technology Analyzer
 * Processes raw repository data and categorizes technologies
 */
export declare class TechnologyAnalyzer {
    private explorerData;
    constructor(explorerData: ExplorerResult);
    /**
     * Main analysis method - processes explorer data into structured tech stack
     */
    analyze(): Promise<StructuredTechStack>;
    /**
     * Extract dependencies from package.json and other dependency files
     */
    private extractDependencies;
    /**
     * Analyze configuration files to detect tools and frameworks
     */
    private analyzeConfigurations;
    /**
     * Detect frameworks and tools from dependencies and configurations
     */
    private detectFrameworks;
    /**
     * Categorize technologies into structured format
     */
    private categorizeTechnologies;
    /**
     * Analyze infrastructure setup
     */
    private analyzeInfrastructure;
    /**
     * Analyze database setup
     */
    private analyzeDatabase;
    /**
     * Detect AI/ML integrations from code analysis
     */
    private detectAIIntegrations;
    private parseRequirementsTxt;
    private parseGemfile;
    private parseComposerJson;
    private parseGoMod;
    private parseCargoToml;
    /**
     * Detect programming languages from file extensions
     */
    private detectLanguages;
    /**
     * Detect package managers from lock files
     */
    private detectPackageManagers;
    /**
     * Detect development tools from dependencies
     */
    private detectDevelopmentTools;
}
interface TechnologiesByCategory {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
    platforms: string[];
    ai: string[];
    development: string[];
    integrations: string[];
}
interface InfrastructureInfo {
    deployment: string[];
    containerization: string[];
    ci_cd: string[];
    monitoring: string[];
}
interface DatabaseInfo {
    primary: string[];
    orm: string[];
    migrations: string[];
}
interface AIIntegrations {
    apis: string[];
    frameworks: string[];
    models: string[];
    integrations: string[];
}
interface StructuredTechStack {
    repository_info: RepositoryData;
    technologies: TechnologiesByCategory;
    frameworks: string[];
    languages: string[];
    package_managers: string[];
    development_tools: string[];
    dependencies: Record<string, string>;
    configurations: Record<string, any>;
    infrastructure: InfrastructureInfo;
    database: DatabaseInfo;
    ai_integrations: AIIntegrations;
    analysis_metadata: {
        files_analyzed: number;
        total_files_scanned: number;
        dependencies_count: number;
        analysis_timestamp: string;
        method: string;
    };
}
export declare const technologyAnalyzerTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            exploration_data: {
                type: string;
                description: string;
            };
            user_id: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: ({ exploration_data, user_id }: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
/**
 * AGENT 3: Gap Analysis Engine
 * Analyzes structured tech stack and provides strategic recommendations
 */
export declare class GapAnalysisEngine {
    private techStack;
    constructor(techStack: StructuredTechStack);
    /**
     * Main gap analysis method - identifies missing components and provides recommendations
     */
    analyze(): Promise<EnhancedTechStack>;
    /**
     * Analyze frontend technology gaps
     */
    private analyzeFrontendGaps;
    /**
     * Analyze backend technology gaps
     */
    private analyzeBackendGaps;
    /**
     * Analyze database technology gaps
     */
    private analyzeDatabaseGaps;
    /**
     * Analyze infrastructure technology gaps
     */
    private analyzeInfrastructureGaps;
    /**
     * Analyze platform integration gaps
     */
    private analyzePlatformGaps;
    /**
     * Analyze AI technology gaps
     */
    private analyzeAIGaps;
    /**
     * Analyze development tools gaps
     */
    private analyzeDevelopmentGaps;
    /**
     * Analyze integration gaps
     */
    private analyzeIntegrationGaps;
    /**
     * Generate key technology decisions analysis
     */
    private generateKeyDecisions;
    /**
     * Generate migration recommendations
     */
    private generateMigrationNotes;
    /**
     * Generate strategic recommendations
     */
    private generateStrategicRecommendations;
    /**
     * Enhance technologies with gap analysis
     */
    private enhanceTechnologies;
    /**
     * Enhance category technologies with gap recommendations
     */
    private enhanceCategoryTechnologies;
    private generateFrontendRecommendations;
    private generateBackendRecommendations;
    private generateDatabaseRecommendations;
    private generateInfrastructureRecommendations;
    private generatePlatformRecommendations;
    private generateAIRecommendations;
    private generateDevelopmentRecommendations;
    private generateIntegrationRecommendations;
}
interface GapAnalysis {
    current_technologies: string[];
    identified_gaps: string[];
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
}
interface StrategicRecommendation {
    category: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    timeline: 'immediate' | 'short-term' | 'long-term';
    impact: 'low' | 'medium' | 'high';
}
interface EnhancedTechnologies {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
    platforms: string[];
    ai: string[];
    development: string[];
    integrations: string[];
}
interface EnhancedTechStack extends StructuredTechStack {
    technologies: EnhancedTechnologies;
    gap_analysis: Record<string, GapAnalysis>;
    key_decisions: string[];
    migration_notes: string[];
    recommendations: StrategicRecommendation[];
}
export declare const gapAnalysisEngineTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            structured_tech_stack: {
                type: string;
                description: string;
            };
            user_id: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: ({ structured_tech_stack, user_id }: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
/**
 * ORCHESTRATOR: Coordinates all three agents
 * Manages the complete workflow from repository exploration to gap analysis
 */
export declare class GitHubAnalysisOrchestrator {
    private githubToken;
    private repositoryUrl;
    private userId;
    private analysisDepth;
    private focusAreas;
    constructor(githubToken: string, repositoryUrl: string, userId: string, analysisDepth?: string, focusAreas?: string[]);
    /**
     * Orchestrates the complete three-agent analysis workflow
     */
    orchestrate(): Promise<any>;
    /**
     * Extract GAP recommendations formatted for tech stack fields
     */
    private extractGapRecommendations;
}
export declare const githubAnalysisOrchestratorTool: {
    name: string;
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
                default: any[];
                description: string;
            };
            user_id: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: ({ repository_url, github_token, analysis_depth, focus_areas, user_id }: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
export declare const handleComprehensiveGitHubAnalysis: ({ repository_url, github_token, analysis_depth, focus_areas, user_id }: any) => Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=github-analysis-agents.d.ts.map