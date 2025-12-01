# Liara MCP Server

A Model Context Protocol (MCP) server for the Liara cloud platform. This server enables AI assistants to deploy and manage applications, databases, and infrastructure on Liara through natural language.

## Features

### Current Capabilities

- **App Management**: Create, deploy, start, stop, restart, and delete apps across 14+ platforms
- **Environment Variables**: Set and update environment variables for apps
- **Deployment**: Deploy releases to apps
- **Database Management**: Create, manage, and backup databases (MySQL, PostgreSQL, MongoDB, Redis, etc.)
- **Object Storage**: Manage S3-compatible storage buckets
- **Plans**: List and view available resource plans

### Supported Platforms

Node.js, Next.js, Laravel, PHP, Django, Flask, .NET, Static sites, React, Angular, Vue, Docker, Python, Go

### Supported Databases

MariaDB, MySQL, PostgreSQL, MSSQL, MongoDB, Redis, ElasticSearch, RabbitMQ

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd liara-mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your Liara API credentials in `.env`:
```
LIARA_API_TOKEN=your_api_token_here
LIARA_TEAM_ID=optional_team_id
LIARA_API_BASE_URL=https://api.iran.liara.ir
```

### Getting Your API Token

1. Log in to [Liara Console](https://console.liara.ir)
2. Navigate to the API section in your account menu
3. Click "Create new key" to generate your API token

### Team ID (Optional)

If you're working with a team account, you can find your Team ID in the API section of the Liara console when viewing your team.

## Usage

### With MCP Client

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "liara": {
      "command": "node",
      "args": ["/path/to/liara-mcp/dist/index.js"],
      "env": {
        "LIARA_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

### Available Tools

#### App Management
- `liara_list_apps` - List all apps
- `liara_get_app` - Get app details
- `liara_create_app` - Create a new app
- `liara_delete_app` - Delete an app
- `liara_start_app` - Start an app
- `liara_stop_app` - Stop an app
- `liara_restart_app` - Restart an app
- `liara_resize_app` - Change app plan

#### Environment Variables
- `liara_set_env_vars` - Set multiple environment variables
- `liara_set_env_var` - Set a single environment variable

#### Deployment
- `liara_deploy_release` - Deploy a release

#### Database Management
- `liara_list_databases` - List all databases
- `liara_get_database` - Get database details
- `liara_create_database` - Create a new database
- `liara_delete_database` - Delete a database
- `liara_start_database` - Start a database
- `liara_stop_database` - Stop a database
- `liara_resize_database` - Change database plan
- `liara_create_backup` - Create a database backup
- `liara_list_backups` - List database backups

#### Object Storage
- `liara_list_buckets` - List all buckets
- `liara_get_bucket` - Get bucket details
- `liara_create_bucket` - Create a new bucket
- `liara_delete_bucket` - Delete a bucket
- `liara_get_bucket_credentials` - Get S3 credentials for a bucket

#### Plans
- `liara_list_plans` - List available plans
- `liara_get_plan` - Get plan details

## Examples

### Example Conversations

**Create and deploy an app:**
```
User: Create a Node.js app called "my-api" with the basic plan
Assistant: [Uses liara_create_app tool]

User: Set the NODE_ENV to production for my-api
Assistant: [Uses liara_set_env_var tool]

User: Start the app
Assistant: [Uses liara_start_app tool]
```

**Create a database:**
```
User: Create a PostgreSQL database called "my-db" with the starter plan
Assistant: [Uses liara_create_database tool]

User: Create a backup of my-db
Assistant: [Uses liara_create_backup tool]
```

**Manage storage:**
```
User: Create a bucket called "my-files"
Assistant: [Uses liara_create_bucket tool]

User: Get the S3 credentials for my-files
Assistant: [Uses liara_get_bucket_credentials tool]
```

## Development

```bash
# Watch mode for development
npm run dev

# Type checking
npm run type-check

# Build
npm run build

# Clean build artifacts
npm run clean
```

## Project Structure

```
liara-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── api/
│   │   ├── client.ts         # Liara API client
│   │   └── types.ts          # TypeScript types
│   ├── services/
│   │   ├── apps.ts           # App management
│   │   ├── databases.ts      # Database management
│   │   ├── storage.ts        # Object storage
│   │   ├── deployment.ts     # Deployment operations
│   │   ├── environment.ts    # Environment variables
│   │   └── plans.ts          # Plan information
│   └── utils/
│       └── errors.ts         # Error handling & validation
├── package.json
├── tsconfig.json
└── README.md
```

## Error Handling

The server provides user-friendly error messages for common scenarios:
- Invalid API token
- Missing required parameters
- Resource not found
- API rate limiting
- Network connectivity issues

## Requirements

- Node.js >= 18.0.0
- Valid Liara API token

## License

MIT

## Resources

- [Liara Documentation](https://docs.liara.ir)
- [Liara API Reference](https://openapi.liara.ir)
- [Model Context Protocol](https://modelcontextprotocol.io)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues related to:
- This MCP server: Open an issue on GitHub
- Liara platform: Contact [Liara Support](https://liara.ir)
- MCP protocol: See [MCP Documentation](https://modelcontextprotocol.io)
