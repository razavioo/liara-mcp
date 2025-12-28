#!/usr/bin/env node

// Load environment variables from .env file if it exists
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createLiaraClient } from './api/client.js';
import { getAllTools } from './tools/index.js';
import { handleToolCall } from './handlers/index.js';

/**
 * Liara MCP Server
 * Provides tools for managing Liara cloud infrastructure
 */
class LiaraMcpServer {
    private server: Server;
    private client: ReturnType<typeof createLiaraClient>;

    constructor() {
        this.server = new Server(
            {
                name: 'liara-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Initialize Liara API client
        try {
            this.client = createLiaraClient();
        } catch (error) {
            console.error('Failed to initialize Liara client:', error);
            throw error;
        }

        this.setupHandlers();

        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupHandlers() {
        this.setupListToolsHandler();
        this.setupCallToolHandler();
    }

    private setupListToolsHandler() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: getAllTools(),
        }));
    }

    private setupCallToolHandler() {
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            return handleToolCall(this.client, name, args);
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Liara MCP server running on stdio');
    }
}

// Start the server
const server = new LiaraMcpServer();
server.run().catch(console.error);
