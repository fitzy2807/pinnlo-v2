#!/bin/bash

# Claude Desktop MCP Configuration Script
# This script will set up the Supabase MCP server for Claude Desktop

set -e

echo "🔧 Setting up Supabase MCP for Claude Desktop..."

# Define paths
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
MCP_SERVER_PATH="/Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp/dist/index.js"

# Create Claude config directory if it doesn't exist
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo "📁 Creating Claude config directory..."
    mkdir -p "$CLAUDE_CONFIG_DIR"
fi

# Check if the MCP server exists
if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo "❌ MCP server not found at: $MCP_SERVER_PATH"
    echo "Make sure you've built the MCP server first:"
    echo "cd /Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp && npm run build"
    exit 1
fi

# Backup existing config if it exists
if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    echo "💾 Backing up existing config..."
    cp "$CLAUDE_CONFIG_FILE" "$CLAUDE_CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create or update the configuration
echo "⚙️ Creating Claude Desktop configuration..."

if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    # Config exists, try to merge
    echo "📝 Existing config found, attempting to merge..."
    
    # Create a temporary file with the merged config
    python3 -c "
import json
import sys

# Read existing config
try:
    with open('$CLAUDE_CONFIG_FILE', 'r') as f:
        config = json.load(f)
except:
    config = {}

# Ensure mcpServers section exists
if 'mcpServers' not in config:
    config['mcpServers'] = {}

# Add our Supabase server
config['mcpServers']['supabase'] = {
    'command': 'node',
    'args': ['$MCP_SERVER_PATH']
}

# Write back to file
with open('$CLAUDE_CONFIG_FILE', 'w') as f:
    json.dump(config, f, indent=2)

print('✅ Configuration merged successfully')
"
else
    # No config exists, create new one
    echo "📄 No existing config found, creating new one..."
    cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"]
    }
  }
}
EOF
fi

echo "✅ Claude Desktop configuration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart Claude Desktop completely"
echo "2. Look for MCP tools in the interface"
echo "3. You should see Supabase tools available"
echo ""
echo "🔍 Configuration file location: $CLAUDE_CONFIG_FILE"
echo "🛠️ MCP server location: $MCP_SERVER_PATH"
echo ""

# Show the current config
echo "📄 Current configuration:"
cat "$CLAUDE_CONFIG_FILE"

echo ""
echo "🎉 Setup complete! Restart Claude Desktop to use the Supabase MCP tools."
