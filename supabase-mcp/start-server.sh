#!/bin/bash
cd /Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp

# Load environment variables from parent directory
if [ -f ../.env.local ]; then
    export $(grep -v '^#' ../.env.local | xargs)
fi

echo "🚀 Starting MCP Server with OpenAI integration..."
echo "OpenAI Key: ${OPENAI_API_KEY:0:10}..."

node server.js
