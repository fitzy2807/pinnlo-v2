#!/usr/bin/env node

/**
 * Supabase MCP Server
 * Provides direct Supabase database management capabilities via MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

// Simplified server without external tool imports for now
interface SupabaseConfig {
  url: string;
  serviceKey: string;
  anonKey?: string;
}

class SupabaseMCPServer {
  private server: Server;
  private supabase: any;
  private config: SupabaseConfig | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'supabase-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
            name: 'generate_executive_summary',
            description: 'Generate executive summary from cards',
            inputSchema: {
              type: 'object',
              properties: {
                cards: {
                  type: 'array',
                  description: 'Array of cards to summarize',
                },
                blueprint_type: {
                  type: 'string',
                  description: 'Type of blueprint',
                },
              },
              required: ['cards', 'blueprint_type'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'supabase_connect':
          return this.handleConnect(args as SupabaseConfig);
        case 'generate_executive_summary':
          return this.handleGenerateExecutiveSummary(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handleConnect(config: SupabaseConfig) {
    try {
      this.config = config;
      this.supabase = createClient(config.url, config.serviceKey);
      
      // Test connection
      const { data, error } = await this.supabase.from('users').select('count').limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is fine
        throw new Error(error.message);
      }

      return {
        content: [
          {
            type: 'text',
            text: '✅ Connected to Supabase successfully!',
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to connect to Supabase: ${error}`);
    }
  }

  private async handleGenerateExecutiveSummary(args: any) {
    // Simple mock implementation for now
    const { cards, blueprint_type } = args;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            themes: [
              `Key theme 1 from ${cards.length} ${blueprint_type} cards`,
              `Key theme 2 from analysis`,
              `Key theme 3 from insights`
            ],
            implications: [
              `Strategic implication 1`,
              `Strategic implication 2`,
              `Strategic implication 3`
            ],
            summary: `Executive summary for ${blueprint_type} based on ${cards.length} cards`
          }, null, 2),
        },
      ],
    };
  }

  async run() {
    console.log('🚀 Starting Supabase MCP Server...');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('✅ MCP Server running and ready for connections');
  }
}

// Run the server
const server = new SupabaseMCPServer();
server.run().catch(console.error);
