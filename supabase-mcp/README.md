# Supabase MCP Server

A Model Context Protocol (MCP) server that provides direct Supabase database management capabilities.

## Features

- 🔌 **Direct Supabase Connection** - Connect to any Supabase project
- 🛡️ **RLS Management** - Enable/disable Row Level Security and manage policies
- 📊 **Schema Inspection** - View tables and column information
- 💾 **Data Operations** - Full CRUD operations on your data
- 🔍 **Raw SQL Execution** - Execute custom SQL queries
- 🎯 **Type Safe** - Built with TypeScript for better developer experience

## Installation

```bash
cd supabase-mcp
npm install
npm run build
```

## Available Tools

### Connection
- `supabase_connect` - Connect to a Supabase project

### Schema Management
- `supabase_get_tables` - List all tables in the database
- `supabase_get_table_schema` - Get detailed schema for a specific table

### Security
- `supabase_enable_rls` - Enable Row Level Security on tables
- `supabase_create_policy` - Create RLS policies

### Data Operations
- `supabase_query_data` - Query data from tables
- `supabase_insert_data` - Insert new records
- `supabase_update_data` - Update existing records

### Advanced
- `supabase_execute_sql` - Execute raw SQL queries

## Usage

This MCP server can be used with any MCP-compatible client. The most common use case is with Claude Desktop or other AI assistants that support MCP.

### Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["/path/to/supabase-mcp/dist/index.js"]
    }
  }
}
```

### Example Usage

1. **Connect to Supabase:**
```
Use supabase_connect with your project URL and service key
```

2. **Enable RLS:**
```
Use supabase_enable_rls on the "cards" table
```

3. **Create Security Policies:**
```
Use supabase_create_policy to create user-specific access rules
```

4. **Query Data:**
```
Use supabase_query_data to fetch records from your tables
```

## Security Notes

- Always use the service role key for administrative operations
- Store credentials securely (environment variables recommended)
- RLS policies are enforced for non-service role operations
- Test policies thoroughly before production use

## Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start built version
npm start
```

## Contributing

This MCP server is designed to solve the common problem of manual database management during development. Contributions welcome!

## License

MIT