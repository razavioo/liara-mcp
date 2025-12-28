/**
 * Observability tool definitions
 */
import { ToolDefinition } from './types.js';

export function getObservabilityTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_get_metrics',
            description: 'Get app metrics summary',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    period: {
                        type: 'string',
                        description: 'Time period for metrics (optional)',
                    },
                },
                required: ['appName'],
            },
        },
        {
            name: 'liara_get_logs',
            description: 'Get app logs',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of log entries (optional, default: 100)',
                    },
                    since: {
                        type: 'string',
                        description: 'ISO timestamp to fetch logs since (optional)',
                    },
                    until: {
                        type: 'string',
                        description: 'ISO timestamp to fetch logs until (optional)',
                    },
                },
                required: ['appName'],
            },
        },
    ];
}
