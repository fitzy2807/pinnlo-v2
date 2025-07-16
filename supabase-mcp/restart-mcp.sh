#!/bin/bash

echo "🔄 Restarting MCP Server..."

# Kill any existing process on port 3001
echo "🛑 Killing existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "   No existing processes found"

# Wait a moment for cleanup
sleep 2

# Verify port is free
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "❌ Port 3001 still in use!"
    exit 1
else
    echo "✅ Port 3001 is free"
fi

# Start the MCP server
echo "🚀 Starting MCP server..."
npm run dev:http

echo "✅ MCP server started"