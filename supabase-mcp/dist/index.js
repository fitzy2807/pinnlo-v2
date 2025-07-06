#!/usr/bin/env node
/**
 * Supabase MCP Server
 * Provides direct Supabase database management capabilities via MCP
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
class SupabaseMCPServer {
    server;
    supabase;
    config = null;
    constructor() {
        this.server = new Server({
            name: 'supabase-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.getAvailableTools(),
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'supabase_connect':
                        return await this.connect(args);
                    case 'supabase_execute_sql':
                        return await this.executeSql(args);
                    case 'supabase_get_tables':
                        return await this.getTables();
                    case 'supabase_get_table_schema':
                        return await this.getTableSchema(args);
                    case 'supabase_enable_rls':
                        return await this.enableRLS(args);
                    case 'supabase_create_policy':
                        return await this.createPolicy(args);
                    case 'supabase_insert_data':
                        return await this.insertData(args);
                    case 'supabase_update_data':
                        return await this.updateData(args);
                    case 'supabase_query_data':
                        return await this.queryData(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing ${name}: ${errorMessage}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    getAvailableTools() {
        return [
            {
                name: 'supabase_connect',
                description: 'Connect to a Supabase project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'Supabase project URL',
                        },
                        serviceKey: {
                            type: 'string',
                            description: 'Supabase service role key (for admin operations)',
                        },
                        anonKey: {
                            type: 'string',
                            description: 'Supabase anon key (optional)',
                        },
                    },
                    required: ['url', 'serviceKey'],
                },
            },
            {
                name: 'supabase_execute_sql',
                description: 'Execute raw SQL against the Supabase database',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sql: {
                            type: 'string',
                            description: 'SQL query to execute',
                        },
                    },
                    required: ['sql'],
                },
            },
            {
                name: 'supabase_get_tables',
                description: 'List all tables in the database',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'supabase_get_table_schema',
                description: 'Get schema information for a specific table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Name of the table',
                        },
                    },
                    required: ['tableName'],
                },
            },
            {
                name: 'supabase_enable_rls',
                description: 'Enable Row Level Security on a table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Name of the table',
                        },
                    },
                    required: ['tableName'],
                },
            },
            {
                name: 'supabase_create_policy',
                description: 'Create an RLS policy on a table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Name of the table',
                        },
                        policyName: {
                            type: 'string',
                            description: 'Name of the policy',
                        },
                        operation: {
                            type: 'string',
                            enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL'],
                            description: 'SQL operation to apply policy to',
                        },
                        expression: {
                            type: 'string',
                            description: 'Policy expression (e.g., "auth.uid() = user_id")',
                        },
                    },
                    required: ['tableName', 'policyName', 'operation', 'expression'],
                },
            },
            {
                name: 'supabase_insert_data',
                description: 'Insert data into a table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Name of the table',
                        },
                        data: {
                            type: 'object',
                            description: 'Data to insert',
                        },
                    },
                    required: ['tableName', 'data'],
                },
            },
            {
                name: 'supabase_update_data',
                description: 'Update data in a table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Name of the table',
                        },
                        data: {
                            type: 'object',
                            description: 'Data to update',
                        },
                        where: {
                            type: 'object',
                            description: 'Where conditions',
                        },
                    },
                    required: ['tableName', 'data', 'where'],
                },
            },
            {
                name: 'supabase_query_data',
                description: 'Query data from a table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Name of the table',
                        },
                        select: {
                            type: 'string',
                            description: 'Columns to select (default: *)',
                        },
                        where: {
                            type: 'object',
                            description: 'Where conditions (optional)',
                        },
                        limit: {
                            type: 'number',
                            description: 'Limit number of results (optional)',
                        },
                    },
                    required: ['tableName'],
                },
            },
        ];
    }
    async connect(args) {
        try {
            this.config = args;
            this.supabase = createClient(args.url, args.serviceKey);
            // Test connection
            const { data, error } = await this.supabase.from('_test_connection').select('*').limit(1);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Successfully connected to Supabase project: ${args.url}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to connect to Supabase: ${error}`);
        }
    }
    async executeSql(args) {
        if (!this.supabase) {
            throw new Error('Not connected to Supabase. Use supabase_connect first.');
        }
        try {
            const { data, error } = await this.supabase.rpc('execute_sql', { sql_query: args.sql });
            if (error) {
                throw new Error(error.message);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ SQL executed successfully:\n\n${JSON.stringify(data, null, 2)}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`SQL execution failed: ${error}`);
        }
    }
    async getTables() {
        if (!this.supabase) {
            throw new Error('Not connected to Supabase. Use supabase_connect first.');
        }
        try {
            const { data, error } = await this.supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
            if (error) {
                throw new Error(error.message);
            }
            const tableNames = data.map((row) => row.table_name);
            return {
                content: [
                    {
                        type: 'text',
                        text: `📋 Tables in database:\n${tableNames.join('\n')}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to get tables: ${error}`);
        }
    }
    async getTableSchema(args) {
        if (!this.supabase) {
            throw new Error('Not connected to Supabase. Use supabase_connect first.');
        }
        try {
            const { data, error } = await this.supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable, column_default')
                .eq('table_name', args.tableName)
                .eq('table_schema', 'public');
            if (error) {
                throw new Error(error.message);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `📊 Schema for table "${args.tableName}":\n\n${JSON.stringify(data, null, 2)}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to get table schema: ${error}`);
        }
    }
    async enableRLS(args) {
        return await this.executeSql({
            sql: `ALTER TABLE ${args.tableName} ENABLE ROW LEVEL SECURITY;`
        });
    }
    async createPolicy(args) {
        const sql = `
      CREATE POLICY "${args.policyName}" ON ${args.tableName}
      FOR ${args.operation} USING (${args.expression});
    `;
        return await this.executeSql({ sql });
    }
    async insertData(args) {
        if (!this.supabase) {
            throw new Error('Not connected to Supabase. Use supabase_connect first.');
        }
        try {
            const { data, error } = await this.supabase
                .from(args.tableName)
                .insert(args.data)
                .select();
            if (error) {
                throw new Error(error.message);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Data inserted successfully:\n\n${JSON.stringify(data, null, 2)}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to insert data: ${error}`);
        }
    }
    async updateData(args) {
        if (!this.supabase) {
            throw new Error('Not connected to Supabase. Use supabase_connect first.');
        }
        try {
            let query = this.supabase.from(args.tableName).update(args.data);
            // Apply where conditions
            Object.entries(args.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
            const { data, error } = await query.select();
            if (error) {
                throw new Error(error.message);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Data updated successfully:\n\n${JSON.stringify(data, null, 2)}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to update data: ${error}`);
        }
    }
    async queryData(args) {
        if (!this.supabase) {
            throw new Error('Not connected to Supabase. Use supabase_connect first.');
        }
        try {
            let query = this.supabase.from(args.tableName).select(args.select || '*');
            // Apply where conditions
            if (args.where) {
                Object.entries(args.where).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }
            // Apply limit
            if (args.limit) {
                query = query.limit(args.limit);
            }
            const { data, error } = await query;
            if (error) {
                throw new Error(error.message);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `📊 Query results:\n\n${JSON.stringify(data, null, 2)}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to query data: ${error}`);
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
// Run the server
const server = new SupabaseMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map