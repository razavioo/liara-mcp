/**
 * App settings tool definitions
 */
import { ToolDefinition } from './types.js';

export function getSettingsTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_set_zero_downtime',
            description: 'Enable or disable zero-downtime deployment for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    enabled: {
                        type: 'boolean',
                        description: 'Enable (true) or disable (false) zero-downtime deployment',
                    },
                },
                required: ['appName', 'enabled'],
            },
        },
        {
            name: 'liara_set_default_subdomain',
            description: 'Enable or disable default subdomain for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    enabled: {
                        type: 'boolean',
                        description: 'Enable (true) or disable (false) default subdomain',
                    },
                },
                required: ['appName', 'enabled'],
            },
        },
        {
            name: 'liara_set_fixed_ip',
            description: 'Enable or disable static IP for an app (returns IP when enabling)',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    enabled: {
                        type: 'boolean',
                        description: 'Enable (true) or disable (false) static IP',
                    },
                },
                required: ['appName', 'enabled'],
            },
        },
        {
            name: 'liara_set_read_only',
            description: 'Enable or disable read-only mode for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    enabled: {
                        type: 'boolean',
                        description: 'Enable (true) or disable (false) read-only mode',
                    },
                },
                required: ['appName', 'enabled'],
            },
        },
    ];
}
