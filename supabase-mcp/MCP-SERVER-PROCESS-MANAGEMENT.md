# MCP Server Process Management Guide

## Overview
This guide provides commands and procedures for managing MCP server processes, particularly for resolving port conflicts on port 3001.

## Current Server Architecture
- **Production Server**: `server-simple.js` (used on Railway)
- **Development HTTP Server**: `src/http-server.ts` (used locally)
- **Unified Server**: `unified-server.js` (Phase 1 consolidation)

## Port 3001 Management

### Check What's Running on Port 3001
```bash
lsof -ti:3001
```

### See Process Details
```bash
ps aux | grep $(lsof -ti:3001)
```

### Kill Process on Port 3001
```bash
kill -9 $(lsof -ti:3001)
```

### Verify Port is Free
```bash
lsof -ti:3001
# Should return nothing if port is free
```

## Starting MCP Servers

### Start Development HTTP Server (Recommended)
```bash
cd /Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp
npm run dev:http
```

### Start Production Server
```bash
cd /Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp
npm run start
```

### Start Unified Server (Testing)
```bash
cd /Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp
npm run unified:dev
```

## Health Check
Test if server is running correctly:
```bash
curl -s http://localhost:3001/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2025-07-16T13:35:56.104Z"}
```

## Common Issues and Solutions

### Port 3001 Already in Use
**Problem**: `EADDRINUSE: address already in use 0.0.0.0:3001`

**Solution**:
1. Check what's using the port: `lsof -ti:3001`
2. Kill the process: `kill -9 $(lsof -ti:3001)`
3. Verify port is free: `lsof -ti:3001`
4. Start your preferred server

### MCP Server Not Responding
**Problem**: `ECONNREFUSED` errors from Next.js application

**Solution**:
1. Check if server is running: `lsof -ti:3001`
2. If not running, start it: `npm run dev:http`
3. Test health: `curl -s http://localhost:3001/health`

### Multiple Servers Running
**Problem**: Confusion about which server is active

**Solution**:
1. Stop all MCP servers: `kill -9 $(lsof -ti:3001)`
2. Start only one server: `npm run dev:http`
3. Verify: `curl -s http://localhost:3001/health`

## Server Logs
- **Development Server**: `supabase-mcp/server-simple.log`
- **Next.js App**: `pinnlo-v2/dev.log`

## Environment Configuration
Ensure these environment variables are set:
- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `MCP_SERVER_URL`: Default `http://localhost:3001`
- `MCP_SERVER_TOKEN`: Default `pinnlo-dev-token-2025`

## Best Practices
1. **Always use port 3001 for HTTP** (as established pattern)
2. **Stop conflicting processes** before starting new ones
3. **Check health endpoint** after starting servers
4. **Monitor logs** for errors and startup messages
5. **Use consistent npm scripts** for predictable behavior

## Quick Start Script
```bash
#!/bin/bash
# Kill any existing server on port 3001
kill -9 $(lsof -ti:3001) 2>/dev/null

# Start the development HTTP server
cd /Users/matthewfitzpatrick/pinnlo-v2/supabase-mcp
npm run dev:http &

# Wait for server to start
sleep 3

# Test health
curl -s http://localhost:3001/health
```

Save this as `start-mcp.sh` and run with `chmod +x start-mcp.sh && ./start-mcp.sh`