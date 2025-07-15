#!/usr/bin/env node
/**
 * HTTP-based MCP Server for PINNLO V2
 * Provides REST API endpoints for AI generation capabilities
 */
// Load environment variables first
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { strategyCreatorTools, handleGenerateContextSummary, handleGenerateStrategyCards } from './tools/strategy-creator-tools.js';
import { intelligenceTools, handleAnalyzeUrl, handleProcessIntelligenceText, handleGenerateAutomationIntelligence } from './tools/ai-generation.js';
import { developmentBankTools, handleGenerateTechnicalRequirement, handleCommitTrdToTaskList } from './tools/development-bank-tools.js';
import { handleCommitTrdToTaskListBatched } from './tools/development-bank-tools-batched.js';
import { terminalTools, handleExecuteCommand, handleReadFileContent, handleGetProjectStatus } from './tools/terminal-tools.js';
import { editModeGeneratorTools, handleGenerateEditModeContent } from './tools/edit-mode-generator.js';
class HttpMcpServer {
    app;
    supabase;
    config = null;
    port;
    constructor(port = 3001) {
        this.app = express();
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeSupabase();
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }
    initializeSupabase() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
        console.log('🔧 Initializing Supabase...');
        console.log('📍 URL:', supabaseUrl ? 'Found' : 'Missing');
        console.log('🔑 Service Key:', supabaseServiceKey ? 'Found' : 'Missing');
        if (supabaseUrl && supabaseServiceKey) {
            this.config = { url: supabaseUrl, serviceKey: supabaseServiceKey };
            this.supabase = createClient(supabaseUrl, supabaseServiceKey);
            console.log('✅ Supabase client created successfully');
        }
        else {
            console.error('❌ Missing Supabase environment variables');
        }
    }
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });
        // MCP invoke endpoint (used by some API routes)
        this.app.post('/api/mcp/invoke', async (req, res) => {
            try {
                const { tool, arguments: args } = req.body;
                const result = await this.invokeTool(tool, args);
                res.json(result);
            }
            catch (error) {
                console.error('MCP invoke error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        // Strategy Creator endpoints
        this.app.post('/api/tools/generate_context_summary', async (req, res) => {
            try {
                const result = await handleGenerateContextSummary(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Context summary error:', error);
                res.status(500).json({ error: 'Failed to generate context summary' });
            }
        });
        this.app.post('/api/tools/generate_strategy_cards', async (req, res) => {
            try {
                const result = await handleGenerateStrategyCards(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Strategy cards error:', error);
                res.status(500).json({ error: 'Failed to generate strategy cards' });
            }
        });
        // Development Bank endpoints
        this.app.post('/api/tools/commit_trd_to_task_list', async (req, res) => {
            try {
                const result = await handleCommitTrdToTaskList(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('TRD commit error:', error);
                res.status(500).json({ error: 'Failed to commit TRD to task list' });
            }
        });
        this.app.post('/api/tools/commit_trd_to_task_list_batched', async (req, res) => {
            try {
                const result = await handleCommitTrdToTaskListBatched(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Batched TRD commit error:', error);
                res.status(500).json({ error: 'Failed to commit TRD to task list (batched)' });
            }
        });
        this.app.post('/api/tools/generate_technical_requirement', async (req, res) => {
            try {
                const result = await handleGenerateTechnicalRequirement(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Technical requirement error:', error);
                res.status(500).json({ error: 'Failed to generate technical requirement' });
            }
        });
        // Context Summary endpoint (for Strategy Creator)
        this.app.post('/api/tools/generate_context_summary', async (req, res) => {
            try {
                const { blueprintCards, intelligenceCards, intelligenceGroups, strategyName } = req.body;
                const contextItems = [
                    ...blueprintCards.map(card => `Blueprint: ${card.title} - ${card.description}`),
                    ...intelligenceCards.map(card => `Intelligence: ${card.title} - ${card.key_findings?.join(', ') || card.description}`)
                ].join('\n');
                const systemPrompt = `You are a strategic analyst. Create a comprehensive context summary for ${strategyName}.`;
                const userPrompt = `Create a strategic context summary based on:\n\n${contextItems}\n\nGenerate a markdown summary with:\n## Strategic Context\n## Key Themes\n## Strategic Implications\n## Recommended Focus Areas`;
                // Call OpenAI directly
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
                }
                else {
                    // Fallback if OpenAI fails
                    const fallbackSummary = `# Context Summary for ${strategyName}\n\n## Strategic Context\nBased on ${blueprintCards.length} blueprint cards and ${intelligenceCards.length} intelligence cards.\n\n## Key Focus Areas\n- Strategic alignment\n- Intelligence integration\n- Actionable outcomes`;
                    res.json({
                        success: true,
                        summary: fallbackSummary
                    });
                }
            }
            catch (error) {
                console.error('Context summary error:', error);
                res.status(500).json({ success: false, error: 'Failed to generate context summary' });
            }
        });
        // Universal Executive Summary endpoint (for Strategy Creator)
        this.app.post('/api/tools/generate_universal_executive_summary', async (req, res) => {
            try {
                const { cards, blueprint_type } = req.body;
                // Enhanced executive summary generation with explicit card integration
                const systemPrompt = `You are a strategic analyst creating an executive summary for ${blueprint_type} blueprint. 

You MUST base your analysis on the specific cards provided. Do not generate generic content.

Focus on:
1. Extracting key themes from the actual card titles and descriptions
2. Identifying strategic implications based on the specific content
3. Recommending next steps that connect to the cards provided
4. Creating a narrative that ties together the specific initiatives described

The summary should feel like it was written by someone who carefully read each card.`;
                // Create detailed card context with all available information
                const cardDetails = cards.map((card, index) => {
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
                        cards_analyzed: cards.map(c => c.title)
                    }
                };
                res.json(result);
            }
            catch (error) {
                console.error('Executive summary error:', error);
                res.status(500).json({ error: 'Failed to generate executive summary' });
            }
        });
        // Intelligence processing endpoints
        this.app.post('/api/tools/analyze_url', async (req, res) => {
            try {
                const result = await handleAnalyzeUrl(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('URL analysis error:', error);
                res.status(500).json({ error: 'Failed to analyze URL' });
            }
        });
        this.app.post('/api/tools/process_intelligence_text', async (req, res) => {
            try {
                const result = await handleProcessIntelligenceText(req.body, this.supabase);
                res.json(result);
            }
            catch (error) {
                console.error('Intelligence processing error:', error);
                res.status(500).json({ error: 'Failed to process intelligence text' });
            }
        });
        this.app.post('/api/tools/generate_automation_intelligence', async (req, res) => {
            try {
                const result = await handleGenerateAutomationIntelligence(req.body, this.supabase);
                res.json(result);
            }
            catch (error) {
                console.error('Automation intelligence error:', error);
                res.status(500).json({ error: 'Failed to generate automation intelligence' });
            }
        });
        // Edit Mode Generator endpoint
        this.app.post('/api/tools/generate_edit_mode_content', async (req, res) => {
            try {
                const result = await handleGenerateEditModeContent(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Edit mode generation error:', error);
                res.status(500).json({ error: 'Failed to generate edit mode content' });
            }
        });
        // Terminal tools endpoints
        this.app.post('/api/tools/execute_command', async (req, res) => {
            try {
                const result = await handleExecuteCommand(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Command execution error:', error);
                res.status(500).json({ error: 'Failed to execute command' });
            }
        });
        this.app.post('/api/tools/read_file_content', async (req, res) => {
            try {
                const result = await handleReadFileContent(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('File read error:', error);
                res.status(500).json({ error: 'Failed to read file' });
            }
        });
        this.app.post('/api/tools/get_project_status', async (req, res) => {
            try {
                const result = await handleGetProjectStatus(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Project status error:', error);
                res.status(500).json({ error: 'Failed to get project status' });
            }
        });
        // List available tools
        this.app.get('/api/tools', (req, res) => {
            const allTools = [
                ...strategyCreatorTools,
                ...intelligenceTools,
                ...developmentBankTools,
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
        // Supabase connection endpoint
        this.app.post('/api/supabase/connect', async (req, res) => {
            try {
                const { url, serviceKey, anonKey } = req.body;
                if (!url || !serviceKey) {
                    return res.status(400).json({ error: 'Missing required parameters' });
                }
                this.config = { url, serviceKey, anonKey };
                this.supabase = createClient(url, serviceKey);
                res.json({ success: true, message: 'Supabase connected successfully' });
            }
            catch (error) {
                console.error('Supabase connection error:', error);
                res.status(500).json({ error: 'Failed to connect to Supabase' });
            }
        });
    }
    async invokeTool(toolName, args) {
        switch (toolName) {
            case 'generate_context_summary':
                return await handleGenerateContextSummary(args);
            case 'generate_strategy_cards':
                return await handleGenerateStrategyCards(args);
            case 'commit_trd_to_task_list':
                return await handleCommitTrdToTaskList(args);
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
    }
    start() {
        try {
            const server = this.app.listen(this.port, '127.0.0.1', () => {
                console.log(`🚀 HTTP MCP Server running on port ${this.port}`);
                console.log(`📋 Available at: http://localhost:${this.port}`);
                console.log(`🏥 Health check: http://localhost:${this.port}/health`);
            });
            server.on('error', (error) => {
                console.error('❌ Server error:', error);
            });
            // Test that the server is actually listening
            server.on('listening', () => {
                console.log('✅ Server is actually listening!');
            });
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
        }
    }
}
// Start the HTTP MCP server
const server = new HttpMcpServer(3001);
server.start();
//# sourceMappingURL=http-server.js.map