/**
 * DNS tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getDnsTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_zones',
            description: 'List all DNS zones',
            inputSchema: {
                type: 'object',
                properties: getPaginationProperties(),
            },
        },
        {
            name: 'liara_get_zone',
            description: 'Get details of a DNS zone',
            inputSchema: {
                type: 'object',
                properties: {
                    zoneId: {
                        type: 'string',
                        description: 'The zone ID',
                    },
                },
                required: ['zoneId'],
            },
        },
        {
            name: 'liara_create_zone',
            description: 'Create a new DNS zone',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Zone name (domain)',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_delete_zone',
            description: 'Delete a DNS zone',
            inputSchema: {
                type: 'object',
                properties: {
                    zoneId: {
                        type: 'string',
                        description: 'The zone ID to delete',
                    },
                },
                required: ['zoneId'],
            },
        },
        {
            name: 'liara_list_dns_records',
            description: 'List DNS records for a zone',
            inputSchema: {
                type: 'object',
                properties: {
                    zoneId: {
                        type: 'string',
                        description: 'The zone ID',
                    },
                    ...getPaginationProperties(),
                },
                required: ['zoneId'],
            },
        },
        {
            name: 'liara_create_dns_record',
            description: 'Create a DNS record',
            inputSchema: {
                type: 'object',
                properties: {
                    zoneId: {
                        type: 'string',
                        description: 'The zone ID',
                    },
                    type: {
                        type: 'string',
                        description: 'Record type',
                        enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV'],
                    },
                    name: {
                        type: 'string',
                        description: 'Record name',
                    },
                    value: {
                        type: 'string',
                        description: 'Record value',
                    },
                    ttl: {
                        type: 'number',
                        description: 'TTL in seconds (optional)',
                    },
                    priority: {
                        type: 'number',
                        description: 'Priority (for MX and SRV records, optional)',
                    },
                },
                required: ['zoneId', 'type', 'name', 'value'],
            },
        },
        {
            name: 'liara_get_dns_record',
            description: 'Get details of a DNS record',
            inputSchema: {
                type: 'object',
                properties: {
                    zoneId: {
                        type: 'string',
                        description: 'The zone ID',
                    },
                    recordId: {
                        type: 'string',
                        description: 'The record ID',
                    },
                },
                required: ['zoneId', 'recordId'],
            },
        },
        {
            name: 'liara_update_dns_record',
            description: 'Update a DNS record',
            inputSchema: {
                type: 'object',
                properties: {
                    zoneId: {
                        type: 'string',
                        description: 'The zone ID',
                    },
                    recordId: {
                        type: 'string',
                        description: 'The record ID',
                    },
                    type: {
                        type: 'string',
                        description: 'Record type (optional)',
                        enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV'],
                    },
                    name: {
                        type: 'string',
                        description: 'Record name (optional)',
                    },
                    value: {
                        type: 'string',
                        description: 'Record value (optional)',
                    },
                    ttl: {
                        type: 'number',
                        description: 'TTL in seconds (optional)',
                    },
                    priority: {
                        type: 'number',
                        description: 'Priority (for MX and SRV records, optional)',
                    },
                },
                required: ['zoneId', 'recordId'],
            },
        },
        {
            name: 'liara_delete_dns_record',
            description: 'Delete a DNS record',
            inputSchema: {
                type: 'object',
                properties: {
                    zoneId: {
                        type: 'string',
                        description: 'The zone ID',
                    },
                    recordId: {
                        type: 'string',
                        description: 'The record ID to delete',
                    },
                },
                required: ['zoneId', 'recordId'],
            },
        },
    ];
}
