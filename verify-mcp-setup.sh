#!/bin/bash

# PINNLO V2 MCP Terminal Setup Verification Script
# Run this to test your enhanced MCP server setup

echo "🚀 PINNLO V2 MCP Terminal Setup Verification"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "supabase-mcp" ]; then
    echo "❌ Please run this script from the PINNLO V2 root directory"
    exit 1
fi

echo "✅ In PINNLO V2 root directory"

# Check if MCP server directory exists
if [ ! -d "supabase-mcp/src/tools" ]; then
    echo "❌ MCP server structure missing"
    exit 1
fi

echo "✅ MCP server structure exists"

# Check if terminal tools file exists
if [ ! -f "supabase-mcp/src/tools/terminal-tools.ts" ]; then
    echo "❌ Terminal tools file missing"
    exit 1
fi

echo "✅ Terminal tools file exists"

# Check if main MCP server file is updated
if ! grep -q "terminalTools" "supabase-mcp/src/index.ts"; then
    echo "❌ Main MCP server not updated with terminal tools"
    exit 1
fi

echo "✅ Main MCP server updated with terminal tools"

# Build the MCP server
echo ""
echo "🔨 Building MCP Server..."
cd supabase-mcp

if npm run build; then
    echo "✅ MCP server built successfully"
else
    echo "❌ MCP server build failed"
    exit 1
fi

# Check if dist files exist
if [ ! -f "dist/index.js" ]; then
    echo "❌ Built files missing"
    exit 1
fi

echo "✅ Built files exist"

# Test import structure
echo ""
echo "🧪 Testing import structure..."
if node -e "
const fs = require('fs');
const content = fs.readFileSync('dist/index.js', 'utf8');
if (content.includes('terminalTools') && content.includes('execute_command')) {
    console.log('✅ Terminal tools properly integrated');
} else {
    console.log('❌ Terminal tools not found in build');
    process.exit(1);
}
"; then
    echo "✅ Import structure verified"
else
    echo "❌ Import structure verification failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 SUCCESS! Your enhanced MCP server is ready!"
echo ""
echo "Next steps:"
echo "1. Update your Claude Desktop configuration"
echo "2. Add the MCP server to claude_desktop_config.json"
echo "3. Restart Claude Desktop completely"
echo "4. Test by asking Claude to check your current directory"
echo ""
echo "Configuration path: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "MCP Server path: $(pwd)/supabase-mcp/dist/index.js"
echo ""
echo "See TERMINAL_ACCESS_SETUP.md for detailed instructions!"
