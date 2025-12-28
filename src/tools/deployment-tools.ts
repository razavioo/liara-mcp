/**
 * Deployment tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getDeploymentTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_upload_source',
            description: 'Upload source code (.tar.gz file) for deployment',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    filePath: {
                        type: 'string',
                        description: 'Path to the .tar.gz file to upload',
                    },
                },
                required: ['appName', 'filePath'],
            },
        },
        {
            name: 'liara_deploy_release',
            description: 'Deploy a release using a source ID',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    sourceID: {
                        type: 'string',
                        description: 'Source ID from previous source upload',
                    },
                    envVars: {
                        type: 'array',
                        description: 'Optional environment variables for this deployment',
                        items: {
                            type: 'object',
                            properties: {
                                key: { type: 'string' },
                                value: { type: 'string' },
                            },
                        },
                    },
                },
                required: ['appName', 'sourceID'],
            },
        },
        {
            name: 'liara_list_releases',
            description: 'List all releases for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    ...getPaginationProperties(),
                },
                required: ['appName'],
            },
        },
        {
            name: 'liara_get_release',
            description: 'Get details of a specific release',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    releaseID: {
                        type: 'string',
                        description: 'The release ID',
                    },
                },
                required: ['appName', 'releaseID'],
            },
        },
        {
            name: 'liara_rollback_release',
            description: 'Rollback to a previous release',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    releaseID: {
                        type: 'string',
                        description: 'The release ID to rollback to',
                    },
                },
                required: ['appName', 'releaseID'],
            },
        },
        {
            name: 'liara_list_sources',
            description: 'List all uploaded sources for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    ...getPaginationProperties(),
                },
                required: ['appName'],
            },
        },
        {
            name: 'liara_delete_source',
            description: 'Delete an uploaded source',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    sourceID: {
                        type: 'string',
                        description: 'The source ID to delete',
                    },
                },
                required: ['appName', 'sourceID'],
            },
        },
    ];
}
