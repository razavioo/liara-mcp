/**
 * Domain (App Domains) tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getDomainTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_domains',
            description: 'List all domains attached to apps',
            inputSchema: {
                type: 'object',
                properties: getPaginationProperties(),
            },
        },
        {
            name: 'liara_get_domain',
            description: 'Get details of a domain',
            inputSchema: {
                type: 'object',
                properties: {
                    domainId: {
                        type: 'string',
                        description: 'The domain ID',
                    },
                },
                required: ['domainId'],
            },
        },
        {
            name: 'liara_add_domain',
            description: 'Add a domain to an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    domain: {
                        type: 'string',
                        description: 'Domain name to add',
                    },
                },
                required: ['appName', 'domain'],
            },
        },
        {
            name: 'liara_remove_domain',
            description: 'Remove a domain from an app',
            inputSchema: {
                type: 'object',
                properties: {
                    domainId: {
                        type: 'string',
                        description: 'The domain ID to remove',
                    },
                },
                required: ['domainId'],
            },
        },
    ];
}
