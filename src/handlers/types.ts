/**
 * Shared types for tool handlers
 */
import { createLiaraClient } from '../api/client.js';
import { PaginationOptions } from '../api/types.js';

export type LiaraClient = ReturnType<typeof createLiaraClient>;

export interface ToolResult {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
    [key: string]: unknown;
}

/**
 * Extract pagination options from tool arguments
 */
export function extractPagination(args: any): PaginationOptions | undefined {
    if (args?.page || args?.perPage || args?.limit || args?.offset) {
        return {
            page: args.page as number | undefined,
            perPage: args.perPage as number | undefined,
            limit: args.limit as number | undefined,
            offset: args.offset as number | undefined,
        };
    }
    return undefined;
}

/**
 * Create a success response
 */
export function successResponse(text: string): ToolResult {
    return {
        content: [{ type: 'text', text }],
    };
}

/**
 * Create a JSON response
 */
export function jsonResponse(data: any): ToolResult {
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
}
