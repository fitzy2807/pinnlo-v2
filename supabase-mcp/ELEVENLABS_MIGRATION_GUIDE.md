# ElevenLabs Migration Guide for PINNLO

## Overview

ElevenLabs is migrating from embedded tool definitions to standalone tool entities. This guide shows how to use the new architecture with PINNLO's MCP server.

## Migration Timeline

- **June 30, 2025**: Last day for full backwards compatibility
- **July 1, 2025**: GET endpoints stop returning tools field
- **July 16, 2025**: Legacy prompt.tools field permanently removed

## New Architecture

### 1. Tool Management
Tools are now standalone entities with unique IDs:

```typescript
// Create tools first
const toolIds = await elevenLabsClient.createPinnloTools('http://localhost:3001');

// Then reference by ID in agent config
const agent = {
  prompt: {
    tool_ids: toolIds,
    built_in_tools: ['end_call', 'language_detection']
  }
}
```

### 2. PINNLO Integration

#### Step 1: Create ElevenLabs Tools
```bash
# Create complete PINNLO integration
curl -X POST http://localhost:3001/api/tools/elevenlabs_create_pinnlo_integration \
  -H "Authorization: Bearer pinnlo-dev-token-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "mcp_server_url": "http://localhost:3001"
  }'
```

This creates 4 PINNLO-specific tools:
- `process_voice_intelligence` - Process voice into intelligence cards
- `generate_strategy_cards` - Generate strategy cards from voice
- `generate_technical_requirement` - Create technical requirements
- `analyze_url` - Analyze URLs from voice conversations

#### Step 2: Use the Agent
The response includes an `agent_id` that you can use to create conversations:

```typescript
const conversation = await elevenLabsClient.createConversation({
  agent_id: 'your-agent-id',
  conversation_id: 'unique-conversation-id'
});
```

## Available MCP Tools

### Tool Management
- `elevenlabs_create_tool` - Create individual tools
- `elevenlabs_get_tools` - List all tools
- `elevenlabs_create_agent` - Create agents with tool IDs
- `elevenlabs_get_agents` - List all agents

### Quick Setup
- `elevenlabs_create_pinnlo_integration` - Complete PINNLO setup

## Webhook Integration

Your MCP server now includes webhook endpoints for ElevenLabs:

- `POST /api/tools/process_voice_intelligence`
- `POST /api/tools/generate_strategy_cards`
- `POST /api/tools/generate_technical_requirement`
- `POST /api/tools/analyze_url`

These endpoints:
✅ Process ElevenLabs webhook calls
✅ Store results in Supabase
✅ Return structured responses
✅ Handle errors gracefully

## Benefits of New Architecture

### 1. Reusability
Same PINNLO tools can be used across different agent types:
- Strategy planning agents
- Technical requirement agents
- Competitive intelligence agents

### 2. Easier Management
- Update tools in one place
- Consistent tool definitions
- Better version control

### 3. Cleaner Agent Configs
```json
{
  "prompt": {
    "tool_ids": ["tool-1", "tool-2"],
    "built_in_tools": ["end_call"]
  }
}
```

Instead of embedding full tool definitions in each agent.

## Testing

```bash
# 1. Start your MCP server
cd supabase-mcp
npm run unified

# 2. Create PINNLO integration
curl -X POST http://localhost:3001/api/tools/elevenlabs_create_pinnlo_integration \
  -H "Authorization: Bearer pinnlo-dev-token-2025"

# 3. Test webhook endpoints
curl -X POST http://localhost:3001/api/tools/process_voice_intelligence \
  -H "Content-Type: application/json" \
  -d '{"text": "I need to analyze our competitors", "user_id": "test-user"}'
```

## Environment Setup

Add to your `.env.local`:
```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Next Steps

1. Get your ElevenLabs API key from https://elevenlabs.io
2. Update `.env.local` with your API key
3. Run the PINNLO integration setup
4. Start creating voice-powered strategy sessions!

The new architecture makes PINNLO-ElevenLabs integration more powerful and maintainable! 🚀