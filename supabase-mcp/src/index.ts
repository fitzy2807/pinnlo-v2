#!/usr/bin/env node

/**
 * Supabase MCP Server
 * Provides comprehensive AI generation capabilities via MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { strategyCreatorTools, handleGenerateContextSummary, handleGenerateStrategyCards, handleGenerateUniversalExecutiveSummary } from './tools/strategy-creator-tools.js';
import { intelligenceTools, handleAnalyzeUrl, handleProcessIntelligenceText, handleGenerateAutomationIntelligence } from './tools/ai-generation.js';
import { 
  developmentBankTools, 
  handleGenerateTechnicalRequirement,
  handleCommitTrdToTaskList
} from './tools/development-bank-tools.js';
import { batchedDevelopmentBankTools, handleCommitTrdToTaskListBatched } from './tools/development-bank-tools-batched.js';
import { techStackTools } from './tools/tech-stack-tools.js';
import { 
  terminalTools, 
  handleExecuteCommand, 
  handleReadFileContent, 
  handleListDirectoryContents, 
  handleGetProjectStatus, 
  handleGetSystemInfo, 
  handleMonitorFileChanges 
} from './tools/terminal-tools.js';

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
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.initializeSupabase();
  }

  private initializeSupabase() {
    // Initialize with environment variables if available
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.config = { url: supabaseUrl, serviceKey: supabaseServiceKey };
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      // Debug: Supabase initialized with environment variables
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [
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
        // Add all strategy creator tools
        ...strategyCreatorTools,
        // Add all intelligence tools
        ...intelligenceTools,
        // Add all development bank tools
        ...developmentBankTools,
        // Add all batched development bank tools
        ...batchedDevelopmentBankTools,
        // Add all tech stack tools
        ...techStackTools,
        // Add all terminal tools
        ...terminalTools
      ];

      return { tools: allTools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'supabase_connect':
            return this.handleConnect(args as unknown as SupabaseConfig);
          case 'generate_executive_summary':
            return this.handleGenerateExecutiveSummary(args);
          
          // Strategy Creator Tools
          case 'generate_context_summary':
            return await handleGenerateContextSummary(args);
          case 'generate_strategy_cards':
            return await handleGenerateStrategyCards(args);
          case 'generate_universal_executive_summary':
            return await handleGenerateUniversalExecutiveSummary(args);
          
          // Development Bank Tools
          case 'generate_technical_requirement':
            return await handleGenerateTechnicalRequirement(args);
          case 'commit_trd_to_task_list':
            return await handleCommitTrdToTaskList(args);
          case 'commit_trd_to_task_list_batched':
            return await handleCommitTrdToTaskListBatched(args);
          
          // Intelligence Tools
          case 'analyze_url':
            return await handleAnalyzeUrl(args, this.supabase);
          case 'process_intelligence_text':
            return await handleProcessIntelligenceText(args, this.supabase);
          case 'generate_automation_intelligence':
            return await handleGenerateAutomationIntelligence(args, this.supabase);
          
          // Terminal Tools
          case 'execute_command':
            return await handleExecuteCommand(args);
          case 'read_file_content':
            return await handleReadFileContent(args);
          case 'list_directory_contents':
            return await handleListDirectoryContents(args);
          case 'get_project_status':
            return await handleGetProjectStatus(args);
          case 'get_system_info':
            return await handleGetSystemInfo(args);
          case 'monitor_file_changes':
            return await handleMonitorFileChanges(args);
          
          // Tech Stack Tools
          case 'generate_tech_stack_component':
            return await techStackTools.generate_tech_stack_component.handler(args);
          case 'analyze_tech_stack':
            return await techStackTools.analyze_tech_stack.handler(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              })
            }
          ],
          isError: true
        };
      }
    });
  }

  private async handleConnect(config: SupabaseConfig) {
    try {
      this.config = config;
      this.supabase = createClient(config.url, config.serviceKey);
      
      // Test connection with a simple query
      const { data, error } = await this.supabase
        .from('strategies')
        .select('count')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is fine
        throw new Error(error.message);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Connected to Supabase successfully!',
              url: config.url
            })
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Failed to connect to Supabase: ${error}`
            })
          }
        ],
        isError: true
      };
    }
  }

  private async handleGenerateExecutiveSummary(args: any) {
    try {
      const { cards, blueprint_type } = args;
      
      // Enhanced executive summary generation
      const systemPrompt = `You are a strategic analyst. Generate a comprehensive executive summary from the provided cards for ${blueprint_type} blueprint.`;
      
      const cardSummaries = cards.map((card: any, index: number) => 
        `${index + 1}. **${card.title}**: ${card.description || 'No description'}`
      ).join('\n');
      
      const userPrompt = `Generate an executive summary for ${blueprint_type} based on these ${cards.length} cards:

${cardSummaries}

Create a summary with:
1. 3-5 key strategic themes
2. Critical implications for decision-making
3. Recommended next steps
4. Overall strategic narrative

Format as structured JSON with themes, implications, nextSteps, and summary fields.`;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              prompts: {
                system: systemPrompt,
                user: userPrompt
              },
              metadata: {
                blueprint_type,
                card_count: cards.length
              }
            })
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        ],
        isError: true
      };
    }
  }

  async run() {
    // MCP Server starting - logging removed to prevent JSON parsing issues
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // MCP Server ready - logging removed to prevent JSON parsing issues
  }
}

// Run the server
const server = new SupabaseMCPServer();
server.run().catch((error) => {
  console.error('❌ Failed to start MCP Server:', error);
  process.exit(1);
});
