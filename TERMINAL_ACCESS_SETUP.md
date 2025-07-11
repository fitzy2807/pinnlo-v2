# Terminal Access Setup for PINNLO V2 MCP Server

Your PINNLO V2 MCP server has been enhanced with terminal access capabilities! 🚀

## What I've Implemented

### 1. ✅ Terminal Tools Added (`/supabase-mcp/src/tools/terminal-tools.ts`)

**6 New Tools Available:**
- `execute_command` - Execute shell commands with safety restrictions
- `read_file_content` - Read file contents with path validation
- `list_directory_contents` - List directories (with optional recursive mode)
- `get_project_status` - Get comprehensive project info (git, npm, build)
- `get_system_info` - Get system information for debugging
- `monitor_file_changes` - Basic file change monitoring

### 2. ✅ Security Features Built-in
- **Allowed Commands:** ls, cat, pwd, git, npm, node, npx, etc.
- **Blocked Commands:** rm, sudo, chmod, kill, etc.
- **Safe Directories:** Limited to `/Users/matthewfitzpatrick/pinnlo-v2` and temp dirs
- **File Size Limits:** 1MB max for file reading
- **Command Timeouts:** 30-60 second limits

### 3. ✅ Integration Complete
- Updated main MCP server (`/supabase-mcp/src/index.ts`)
- Added all terminal tools to the tools registry
- Added switch case handlers for all terminal commands
- Updated startup messages to show new capabilities

## What You Need To Do

### 1. 🔨 Build the Enhanced MCP Server

```bash
cd /Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp
npm run build
```

### 2. 🧪 Test the Server (Optional)

```bash
# Test in development mode
npm run dev
```

### 3. 🖥️ Update Claude Desktop Configuration

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Add or update your MCP server config:**

```json
{
  "mcpServers": {
    "pinnlo-v2-enhanced": {
      "command": "node",
      "args": ["/Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_ROLE_KEY": "your_service_key",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 4. 🔄 Restart Claude Desktop

Completely quit and restart Claude Desktop for the changes to take effect.

## Testing the Connection

Once set up, test by asking me:

- **"Can you see my current directory?"** → I'll use `get_project_status`
- **"List the files in my src directory"** → I'll use `list_directory_contents`  
- **"Run `git status` to see project changes"** → I'll use `execute_command`
- **"What's in my package.json?"** → I'll use `read_file_content`

## Available Terminal Commands

### Execute Commands
```
execute_command: {
  command: "git status",
  cwd: "/Users/matthewfitzpatrick/pinnlo-v2"
}
```

### Read Files
```
read_file_content: {
  filepath: "/Users/matthewfitzpatrick/pinnlo-v2/package.json"
}
```

### List Directories
```
list_directory_contents: {
  path: "/Users/matthewfitzpatrick/pinnlo-v2/src",
  detailed: true,
  recursive: false
}
```

### Project Status
```
get_project_status: {
  projectPath: "/Users/matthewfitzpatrick/pinnlo-v2"
}
```

## Benefits You'll Get

1. **Real-time Development Assistance:** I can see your actual terminal output
2. **Better Debugging:** I can read error logs and check file contents
3. **Project Navigation:** I can explore your file structure efficiently
4. **Build Status Monitoring:** I can check build errors and dependencies
5. **Git Integration:** I can see commits, branches, and changes

## Security Notes

- Commands are restricted to safe operations only
- File access is limited to your project directory
- All dangerous commands (rm, sudo, etc.) are blocked
- Command execution has timeouts to prevent hanging

## Troubleshooting

If terminal tools don't work:

1. **Check the build:** `cd supabase-mcp && npm run build`
2. **Verify config:** Ensure Claude Desktop config points to the right path
3. **Check permissions:** Make sure the MCP server can access your project directory
4. **Restart Claude:** Completely quit and restart Claude Desktop

Once this is set up, I'll be able to see and interact with your terminal in real-time! 🎉
