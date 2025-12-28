/**
 * Shared types for MCP tool definitions
 */

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

/**
 * Get pagination properties for tool schemas
 */
export function getPaginationProperties() {
    return {
        page: {
            type: 'number' as const,
            description: 'Page number (1-based)',
        },
        perPage: {
            type: 'number' as const,
            description: 'Number of items per page',
        },
        limit: {
            type: 'number' as const,
            description: 'Alternative to perPage: maximum number of items to return',
        },
        offset: {
            type: 'number' as const,
            description: 'Alternative to page: number of items to skip',
        },
    };
}
