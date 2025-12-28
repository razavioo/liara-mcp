/**
 * Environment variable tool definitions
 */
import { ToolDefinition } from './types.js';

export function getEnvTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_set_env_vars',
            description: 'Set or update environment variables for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    variables: {
                        type: 'array',
                        description: 'Array of environment variables',
                        items: {
                            type: 'object',
                            properties: {
                                key: {
                                    type: 'string',
                                    description: 'Variable name (uppercase, alphanumeric with underscores)',
                                },
                                value: {
                                    type: 'string',
                                    description: 'Variable value',
                                },
                            },
                            required: ['key', 'value'],
                        },
                    },
                },
                required: ['appName', 'variables'],
            },
        },
        {
            name: 'liara_set_env_var',
            description: 'Set a single environment variable for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    key: {
                        type: 'string',
                        description: 'Variable name (uppercase, alphanumeric with underscores)',
                    },
                    value: {
                        type: 'string',
                        description: 'Variable value',
                    },
                },
                required: ['appName', 'key', 'value'],
            },
        },
        {
            name: 'liara_get_env_vars',
            description: 'Get all environment variables for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                },
                required: ['appName'],
            },
        },
        {
            name: 'liara_delete_env_var',
            description: 'Delete/unset an environment variable for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    key: {
                        type: 'string',
                        description: 'Variable name to delete',
                    },
                },
                required: ['appName', 'key'],
            },
        },
        {
            name: 'liara_delete_env_vars',
            description: 'Delete/unset multiple environment variables for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    keys: {
                        type: 'array',
                        description: 'Array of variable names to delete',
                        items: {
                            type: 'string',
                        },
                    },
                },
                required: ['appName', 'keys'],
            },
        },
    ];
}
