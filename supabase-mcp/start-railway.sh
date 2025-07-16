#!/bin/bash

# Railway deployment script for advanced MCP server
echo "🚀 Starting Advanced MCP Server on Railway..."
echo "OpenAI Key: ${OPENAI_API_KEY:0:10}..."
echo "Port: ${PORT:-3001}"
echo "Environment: Railway"

# Use the advanced MCP server instead of simple server
node dist/http-server.js