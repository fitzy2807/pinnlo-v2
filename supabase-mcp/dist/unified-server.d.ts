#!/usr/bin/env node
/**
 * Unified MCP Server for PINNLO V2
 * Supports both STDIO (MCP protocol) and HTTP (REST API) transports
 * Maintains 100% backward compatibility with existing servers
 */
interface SupabaseConfig {
    url: string;
    serviceKey: string;
    anonKey?: string;
}
interface UnifiedServerConfig {
    port: number;
    enableHttp: boolean;
    enableStdio: boolean;
    supabaseConfig?: SupabaseConfig;
}
/**
 * Unified MCP Server that supports both STDIO and HTTP transports
 * Maintains backward compatibility with existing server implementations
 */
declare class UnifiedMcpServer {
    private mcpServer;
    private httpApp;
    private supabase;
    private config;
    private supabaseConfig;
    constructor(config?: Partial<UnifiedServerConfig>);
    private initializeSupabase;
    private setupHttpMiddleware;
    private setupMcpTools;
    private setupHttpRoutes;
    private handleMcpTool;
    startStdio(): Promise<void>;
    startHttp(): Promise<void>;
    start(): Promise<void>;
}
export { UnifiedMcpServer };
//# sourceMappingURL=unified-server.d.ts.map