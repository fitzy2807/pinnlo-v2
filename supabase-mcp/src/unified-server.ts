#!/usr/bin/env node

/**
 * Unified MCP Server for PINNLO V2
 * Supports both STDIO (MCP protocol) and HTTP (REST API) transports
 * Maintains 100% backward compatibility with existing servers
 */

// Load environment variables first
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

// Import all existing tool handlers
import { strategyCreatorTools, handleGenerateContextSummary, handleGenerateStrategyCards } from './tools/strategy-creator-tools.js';
import { intelligenceTools, handleAnalyzeUrl, handleProcessIntelligenceText, handleGenerateAutomationIntelligence } from './tools/ai-generation.js';
import { 
  developmentBankTools,
  handleGenerateTechnicalRequirement,
  handleCommitTrdToTaskList
} from './tools/development-bank-tools.js';
import { batchedDevelopmentBankTools, handleCommitTrdToTaskListBatched } from './tools/development-bank-tools-batched.js';
import { 
  terminalTools, 
  handleExecuteCommand, 
  handleReadFileContent, 
  handleListDirectoryContents, 
  handleGetProjectStatus, 
  handleGetSystemInfo, 
  handleMonitorFileChanges 
} from './tools/terminal-tools.js';
import { 
  editModeGeneratorTools, 
  handleGenerateEditModeContent 
} from './tools/edit-mode-generator.js';

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
class UnifiedMcpServer {
  private mcpServer: Server;
  private httpApp: express.Application;
  private supabase: any;
  private config: UnifiedServerConfig;
  private supabaseConfig: SupabaseConfig | null = null;

  constructor(config: Partial<UnifiedServerConfig> = {}) {
    this.config = {
      port: config.port || 3001,
      enableHttp: config.enableHttp ?? true,
      enableStdio: config.enableStdio ?? true,
      ...config
    };

    // Initialize MCP server for STDIO transport
    this.mcpServer = new Server(
      {
        name: 'pinnlo-unified-mcp',
        version: '1.0.0',
        description: 'Unified MCP server for Pinnlo V2 with STDIO and HTTP support'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    // Initialize HTTP server
    this.httpApp = express();
    
    this.initializeSupabase();
    this.setupHttpMiddleware();
    this.setupMcpTools();
    this.setupHttpRoutes();
  }

  private initializeSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    console.log('🔧 Initializing Supabase...');
    console.log('📍 URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('🔑 Service Key:', supabaseServiceKey ? 'Found' : 'Missing');
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabaseConfig = { url: supabaseUrl, serviceKey: supabaseServiceKey };
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log('✅ Supabase client created successfully');
    } else {
      console.error('❌ Missing Supabase environment variables');
    }
  }

  private setupHttpMiddleware() {
    this.httpApp.use(cors());
    this.httpApp.use(express.json({ limit: '10mb' }));
    this.httpApp.use(express.urlencoded({ extended: true }));
  }

  private setupMcpTools() {
    // Register all MCP tools for STDIO transport
    const allTools = [
      ...strategyCreatorTools,
      ...intelligenceTools,
      ...developmentBankTools,
      ...batchedDevelopmentBankTools,
      ...terminalTools,
      ...editModeGeneratorTools
    ];

    // Register list tools handler
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: allTools };
    });

    // Register call tool handler
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const result = await this.handleMcpTool(name, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message || 'Unknown error'
              })
            }
          ],
          isError: true
        };
      }
    });

    console.log(`✅ Registered ${allTools.length} MCP tools for STDIO transport`);
  }

  private setupHttpRoutes() {
    // Health check endpoint (backward compatible)
    this.httpApp.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Authentication middleware (backward compatible)
    const authenticateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const authHeader = req.headers.authorization;
      const expectedToken = process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025';
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      if (token !== expectedToken) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      next();
    };

    // Generic MCP invoke endpoint (backward compatible)
    this.httpApp.post('/api/mcp/invoke', authenticateRequest, async (req, res) => {
      try {
        const { tool, arguments: args } = req.body;
        const result = await this.handleMcpTool(tool, args);
        res.json(result);
      } catch (error) {
        console.error('MCP invoke error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Strategy Creator endpoints (backward compatible)
    this.httpApp.post('/api/tools/generate_strategy_cards', authenticateRequest, async (req, res) => {
      try {
        const result = await handleGenerateStrategyCards(req.body);
        res.json(result);
      } catch (error) {
        console.error('Strategy cards error:', error);
        res.status(500).json({ error: 'Failed to generate strategy cards' });
      }
    });

    // Development Bank endpoints (backward compatible)
    this.httpApp.post('/api/tools/commit_trd_to_task_list', authenticateRequest, async (req, res) => {
      try {
        const result = await handleCommitTrdToTaskList(req.body);
        res.json(result);
      } catch (error) {
        console.error('TRD commit error:', error);
        res.status(500).json({ error: 'Failed to commit TRD to task list' });
      }
    });

    this.httpApp.post('/api/tools/commit_trd_to_task_list_batched', authenticateRequest, async (req, res) => {
      try {
        const result = await handleCommitTrdToTaskListBatched(req.body);
        res.json(result);
      } catch (error) {
        console.error('Batched TRD commit error:', error);
        res.status(500).json({ error: 'Failed to commit TRD to task list (batched)' });
      }
    });

    this.httpApp.post('/api/tools/generate_technical_requirement', authenticateRequest, async (req, res) => {
      try {
        const result = await handleGenerateTechnicalRequirement(req.body);
        res.json(result);
      } catch (error) {
        console.error('Technical requirement error:', error);
        res.status(500).json({ error: 'Failed to generate technical requirement' });
      }
    });

    // Context Summary endpoint (backward compatible with both servers)
    this.httpApp.post('/api/tools/generate_context_summary', authenticateRequest, async (req, res) => {
      try {
        const { blueprintCards, intelligenceCards, intelligenceGroups, strategyName } = req.body;
        
        const contextItems = [
          ...blueprintCards.map((card: any) => `Blueprint: ${card.title} - ${card.description}`),
          ...intelligenceCards.map((card: any) => `Intelligence: ${card.title} - ${card.key_findings?.join(', ') || card.description}`)
        ].join('\n');

        const systemPrompt = `You are a strategic analyst. Create a comprehensive context summary for ${strategyName}.`;
        
        const userPrompt = `Create a strategic context summary based on:\n\n${contextItems}\n\nGenerate a markdown summary with:\n## Strategic Context\n## Key Themes\n## Strategic Implications\n## Recommended Focus Areas`;

        // Call OpenAI directly (backward compatible)
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (openaiResponse.ok) {
          const result = await openaiResponse.json();
          const summary = result.choices[0].message.content;
          
          res.json({
            success: true,
            summary: summary
          });
        } else {
          // Fallback if OpenAI fails (backward compatible)
          const fallbackSummary = `# Context Summary for ${strategyName}\n\n## Strategic Context\nBased on ${blueprintCards.length} blueprint cards and ${intelligenceCards.length} intelligence cards.\n\n## Key Focus Areas\n- Strategic alignment\n- Intelligence integration\n- Actionable outcomes`;
          
          res.json({
            success: true,
            summary: fallbackSummary
          });
        }
      } catch (error) {
        console.error('Context summary error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate context summary' });
      }
    });

    // Universal Executive Summary endpoint (backward compatible)
    this.httpApp.post('/api/tools/generate_universal_executive_summary', authenticateRequest, async (req, res) => {
      try {
        const { cards, blueprint_type } = req.body;
        
        // Enhanced executive summary generation (backward compatible)
        const systemPrompt = `You are a strategic analyst creating an executive summary for ${blueprint_type} blueprint. 

You MUST base your analysis on the specific cards provided. Do not generate generic content.

Focus on:
1. Extracting key themes from the actual card titles and descriptions
2. Identifying strategic implications based on the specific content
3. Recommending next steps that connect to the cards provided
4. Creating a narrative that ties together the specific initiatives described

The summary should feel like it was written by someone who carefully read each card.`;
        
        // Create detailed card context (backward compatible)
        const cardDetails = cards.map((card: any, index: number) => {
          const details = [
            `**Card ${index + 1}: ${card.title}**`,
            `Description: ${card.description || 'No description provided'}`,
            card.priority ? `Priority: ${card.priority}` : '',
            card.confidenceLevel ? `Confidence: ${card.confidenceLevel}` : '',
            card.strategicAlignment ? `Strategic Alignment: ${card.strategicAlignment}` : '',
            card.tags && card.tags.length > 0 ? `Tags: ${card.tags.join(', ')}` : '',
            card.relationships && card.relationships.length > 0 ? `Related Cards: ${card.relationships.length} connections` : ''
          ].filter(Boolean);
          
          return details.join('\n');
        }).join('\n\n');
        
        const userPrompt = `Analyze these ${cards.length} ${blueprint_type} cards and create a comprehensive executive summary:

${cardDetails}

**Required Analysis:**

1. **Key Themes** (3-5 themes): Extract the main strategic themes from these specific cards. Reference card titles and content directly.

2. **Strategic Implications** (3-4 points): What do these specific initiatives mean for the organization? How do they connect?

3. **Recommended Next Steps** (3-4 actions): Based on the cards above, what should be done next? Be specific to the content provided.

4. **Strategic Narrative** (2-3 sentences): Tie these specific cards together into a coherent strategic story.

**Output Format:**
{
  "detected_blueprint": "${blueprint_type}",
  "themes": ["Theme 1 (referencing specific cards)", "Theme 2..."],
  "implications": ["Implication 1 (based on card content)", "Implication 2..."],
  "nextSteps": ["Action 1 (derived from cards)", "Action 2..."],
  "summary": "Strategic narrative connecting the ${cards.length} cards provided..."
}

**Important:** Your response must reference the actual card content. Avoid generic strategic advice.`;

        const result = {
          success: true,
          prompts: {
            system: systemPrompt,
            user: userPrompt
          },
          metadata: {
            blueprint_type,
            card_count: cards.length,
            cards_analyzed: cards.map((c: any) => c.title)
          }
        };
        
        res.json(result);
      } catch (error) {
        console.error('Executive summary error:', error);
        res.status(500).json({ error: 'Failed to generate executive summary' });
      }
    });

    // Intelligence processing endpoints (backward compatible)
    this.httpApp.post('/api/tools/analyze_url', authenticateRequest, async (req, res) => {
      try {
        const result = await handleAnalyzeUrl(req.body);
        res.json(result);
      } catch (error) {
        console.error('URL analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze URL' });
      }
    });

    this.httpApp.post('/api/tools/process_intelligence_text', authenticateRequest, async (req, res) => {
      try {
        const result = await handleProcessIntelligenceText(req.body, this.supabase);
        res.json(result);
      } catch (error) {
        console.error('Intelligence processing error:', error);
        res.status(500).json({ error: 'Failed to process intelligence text' });
      }
    });

    this.httpApp.post('/api/tools/generate_automation_intelligence', authenticateRequest, async (req, res) => {
      try {
        const result = await handleGenerateAutomationIntelligence(req.body, this.supabase);
        res.json(result);
      } catch (error) {
        console.error('Automation intelligence error:', error);
        res.status(500).json({ error: 'Failed to generate automation intelligence' });
      }
    });

    // Edit Mode Generator endpoint (backward compatible)
    this.httpApp.post('/api/tools/generate_edit_mode_content', authenticateRequest, async (req, res) => {
      try {
        const result = await handleGenerateEditModeContent(req.body);
        res.json(result);
      } catch (error) {
        console.error('Edit mode generation error:', error);
        res.status(500).json({ error: 'Failed to generate edit mode content' });
      }
    });

    // Terminal tools endpoints (backward compatible)
    this.httpApp.post('/api/tools/execute_command', authenticateRequest, async (req, res) => {
      try {
        const result = await handleExecuteCommand(req.body);
        res.json(result);
      } catch (error) {
        console.error('Command execution error:', error);
        res.status(500).json({ error: 'Failed to execute command' });
      }
    });

    this.httpApp.post('/api/tools/read_file_content', authenticateRequest, async (req, res) => {
      try {
        const result = await handleReadFileContent(req.body);
        res.json(result);
      } catch (error) {
        console.error('File read error:', error);
        res.status(500).json({ error: 'Failed to read file' });
      }
    });

    this.httpApp.post('/api/tools/get_project_status', authenticateRequest, async (req, res) => {
      try {
        const result = await handleGetProjectStatus(req.body);
        res.json(result);
      } catch (error) {
        console.error('Project status error:', error);
        res.status(500).json({ error: 'Failed to get project status' });
      }
    });

    // List available tools (backward compatible)
    this.httpApp.get('/api/tools', (req, res) => {
      const allTools = [
        ...strategyCreatorTools,
        ...intelligenceTools,
        ...developmentBankTools,
        ...batchedDevelopmentBankTools,
        ...terminalTools,
        ...editModeGeneratorTools
      ];
      res.json({
        tools: allTools.map(tool => ({
          name: tool.name,
          description: tool.description
        }))
      });
    });

    // Supabase connection endpoint (backward compatible)
    this.httpApp.post('/api/supabase/connect', authenticateRequest, async (req, res) => {
      try {
        const { url, serviceKey, anonKey } = req.body;
        
        if (!url || !serviceKey) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }

        this.supabaseConfig = { url, serviceKey, anonKey };
        this.supabase = createClient(url, serviceKey);

        res.json({ success: true, message: 'Supabase connected successfully' });
      } catch (error) {
        console.error('Supabase connection error:', error);
        res.status(500).json({ error: 'Failed to connect to Supabase' });
      }
    });

    console.log('✅ HTTP routes configured for backward compatibility');
  }

  private async handleMcpTool(toolName: string, args: any) {
    try {
      switch (toolName) {
        case 'generate_context_summary':
          return await handleGenerateContextSummary(args);
        case 'generate_strategy_cards':
          return await handleGenerateStrategyCards(args);
        case 'commit_trd_to_task_list':
          return await handleCommitTrdToTaskList(args);
        case 'commit_trd_to_task_list_batched':
          return await handleCommitTrdToTaskListBatched(args);
        case 'generate_technical_requirement':
          return await handleGenerateTechnicalRequirement(args);
        case 'analyze_url':
          return await handleAnalyzeUrl(args);
        case 'process_intelligence_text':
          return await handleProcessIntelligenceText(args, this.supabase);
        case 'generate_automation_intelligence':
          return await handleGenerateAutomationIntelligence(args, this.supabase);
        case 'execute_command':
          return await handleExecuteCommand(args);
        case 'read_file_content':
          return await handleReadFileContent(args);
        case 'get_project_status':
          return await handleGetProjectStatus(args);
        case 'generate_edit_mode_content':
          return await handleGenerateEditModeContent(args);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Error handling MCP tool ${toolName}:`, error);
      throw error;
    }
  }

  public async startStdio() {
    if (!this.config.enableStdio) {
      console.log('📟 STDIO transport disabled');
      return;
    }

    try {
      const transport = new StdioServerTransport();
      console.log('📟 Starting STDIO MCP server...');
      await this.mcpServer.connect(transport);
      console.log('✅ STDIO MCP server started successfully');
    } catch (error) {
      console.error('❌ Failed to start STDIO MCP server:', error);
      throw error;
    }
  }

  public async startHttp() {
    if (!this.config.enableHttp) {
      console.log('🌐 HTTP transport disabled');
      return;
    }

    try {
      const server = this.httpApp.listen(this.config.port, '0.0.0.0', () => {
        console.log(`🚀 HTTP MCP Server running on port ${this.config.port}`);
        console.log(`📋 Available at: http://localhost:${this.config.port}`);
        console.log(`🏥 Health check: http://localhost:${this.config.port}/health`);
      });
      
      server.on('error', (error) => {
        console.error('❌ HTTP server error:', error);
      });
      
      server.on('listening', () => {
        console.log('✅ HTTP server is listening!');
      });
      
    } catch (error) {
      console.error('❌ Failed to start HTTP server:', error);
      throw error;
    }
  }

  public async start() {
    console.log('🚀 Starting Unified MCP Server...');
    console.log('📊 Configuration:', {
      port: this.config.port,
      enableHttp: this.config.enableHttp,
      enableStdio: this.config.enableStdio,
      supabaseConfigured: !!this.supabaseConfig
    });

    try {
      // Start both transports if enabled
      if (this.config.enableStdio) {
        await this.startStdio();
      }
      
      if (this.config.enableHttp) {
        await this.startHttp();
      }

      console.log('✅ Unified MCP Server started successfully');
      console.log('🔧 Maintains 100% backward compatibility');
      
    } catch (error) {
      console.error('❌ Failed to start Unified MCP Server:', error);
      process.exit(1);
    }
  }
}

// Export for programmatic use
export { UnifiedMcpServer };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new UnifiedMcpServer({
    port: parseInt(process.env.PORT || '3001'),
    enableHttp: process.env.ENABLE_HTTP !== 'false',
    enableStdio: process.env.ENABLE_STDIO !== 'false'
  });
  
  server.start();
}