/**
 * Network tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getNetworkTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_networks',
            description: 'List all networks',
            inputSchema: {
                type: 'object',
                properties: getPaginationProperties(),
            },
        },
        {
            name: 'liara_get_network',
            description: 'Get details of a network',
            inputSchema: {
                type: 'object',
                properties: {
                    networkId: {
                        type: 'string',
                        description: 'The network ID',
                    },
                },
                required: ['networkId'],
            },
        },
        {
            name: 'liara_create_network',
            description: 'Create a new network',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Network name',
                    },
                    cidr: {
                        type: 'string',
                        description: 'CIDR block (optional)',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_delete_network',
            description: 'Delete a network',
            inputSchema: {
                type: 'object',
                properties: {
                    networkId: {
                        type: 'string',
                        description: 'The network ID to delete',
                    },
                },
                required: ['networkId'],
            },
        },
    ];
}
