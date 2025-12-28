/**
 * Plan tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getPlanTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_plans',
            description: 'List available plans (apps, databases, or VMs)',
            inputSchema: {
                type: 'object',
                properties: {
                    planType: {
                        type: 'string',
                        description: 'Filter by plan type',
                        enum: ['app', 'database', 'vm'],
                    },
                    ...getPaginationProperties(),
                },
            },
        },
        {
            name: 'liara_get_plan',
            description: 'Get details of a specific plan',
            inputSchema: {
                type: 'object',
                properties: {
                    planId: {
                        type: 'string',
                        description: 'The plan ID',
                    },
                },
                required: ['planId'],
            },
        },
    ];
}
