#!/usr/bin/env node
/**
 * HTTP-based MCP Server for PINNLO V2
 * Provides REST API endpoints for AI generation capabilities
 */
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { strategyCreatorTools, handleGenerateContextSummary, handleGenerateStrategyCards } from './tools/strategy-creator-tools.js';
import { intelligenceTools, handleAnalyzeUrl, handleProcessIntelligenceText, handleGenerateAutomationIntelligence } from './tools/ai-generation.js';
import { terminalTools, handleExecuteCommand, handleReadFileContent, handleGetProjectStatus } from './tools/terminal-tools.js';
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
        if (supabaseUrl && supabaseServiceKey) {
            this.config = { url: supabaseUrl, serviceKey: supabaseServiceKey };
            this.supabase = createClient(supabaseUrl, supabaseServiceKey);
            // Debug: Supabase initialized with environment variables
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
                const result = await handleProcessIntelligenceText(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Intelligence processing error:', error);
                res.status(500).json({ error: 'Failed to process intelligence text' });
            }
        });
        this.app.post('/api/tools/generate_automation_intelligence', async (req, res) => {
            try {
                const result = await handleGenerateAutomationIntelligence(req.body);
                res.json(result);
            }
            catch (error) {
                console.error('Automation intelligence error:', error);
                res.status(500).json({ error: 'Failed to generate automation intelligence' });
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
                ...terminalTools
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
            case 'analyze_url':
                return await handleAnalyzeUrl(args);
            case 'process_intelligence_text':
                return await handleProcessIntelligenceText(args);
            case 'generate_automation_intelligence':
                return await handleGenerateAutomationIntelligence(args);
            case 'execute_command':
                return await handleExecuteCommand(args);
            case 'read_file_content':
                return await handleReadFileContent(args);
            case 'get_project_status':
                return await handleGetProjectStatus(args);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 HTTP MCP Server running on port ${this.port}`);
            console.log(`📋 Available at: http://localhost:${this.port}`);
            console.log(`🏥 Health check: http://localhost:${this.port}/health`);
        });
    }
}
// Start the HTTP MCP server
const server = new HttpMcpServer(3001);
server.start();
//# sourceMappingURL=http-server.js.map