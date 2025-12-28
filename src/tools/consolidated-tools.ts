/**
 * Consolidated tool definitions - combines related functionality into fewer tools
 */
import { ToolDefinition, getPaginationProperties } from './types.js';
import * as appService from '../services/apps.js';
import * as dbService from '../services/databases.js';

export function getConsolidatedTools(): ToolDefinition[] {
    return [
        // ===== APP MANAGEMENT CONSOLIDATION =====
        // Combine list, get, create, delete, start, stop, restart, resize into 2 tools
        {
            name: 'liara_manage_app',
            description: 'Comprehensive app management: list apps, get details, create, delete, start, stop, restart, or resize apps',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'Action to perform',
                        enum: ['list', 'get', 'create', 'delete', 'start', 'stop', 'restart', 'resize'],
                    },
                    name: {
                        type: 'string',
                        description: 'App name (required for all actions except list)',
                    },
                    platform: {
                        type: 'string',
                        description: 'Platform type (required for create)',
                        enum: appService.getAvailablePlatforms(),
                    },
                    planID: {
                        type: 'string',
                        description: 'Plan ID (required for create and resize)',
                    },
                    region: {
                        type: 'string',
                        description: 'Deployment region (optional for create)',
                    },
                    ...getPaginationProperties(),
                },
                required: ['action'],
            },
        },

        // ===== ENVIRONMENT VARIABLE MANAGEMENT CONSOLIDATION =====
        // Combine all env var operations into 1 tool
        {
            name: 'liara_manage_env_vars',
            description: 'Manage environment variables: list, set single/multiple, or delete single/multiple variables',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'Action to perform',
                        enum: ['list', 'set', 'set_multiple', 'delete', 'delete_multiple'],
                    },
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    key: {
                        type: 'string',
                        description: 'Variable name (for single operations)',
                    },
                    value: {
                        type: 'string',
                        description: 'Variable value (for set action)',
                    },
                    variables: {
                        type: 'array',
                        description: 'Array of variables (for set_multiple)',
                        items: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: 'Variable name' },
                                value: { type: 'string', description: 'Variable value' },
                            },
                            required: ['key', 'value'],
                        },
                    },
                    keys: {
                        type: 'array',
                        description: 'Array of variable names to delete (for delete_multiple)',
                        items: { type: 'string' },
                    },
                },
                required: ['action', 'appName'],
            },
        },

        // ===== DATABASE MANAGEMENT CONSOLIDATION =====
        // Combine database operations into 3 tools
        {
            name: 'liara_manage_databases',
            description: 'Database lifecycle management: list, get details, create, delete, start, stop, restart, or resize databases',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'Action to perform',
                        enum: ['list', 'get', 'get_connection', 'create', 'delete', 'start', 'stop', 'restart', 'resize', 'update'],
                    },
                    name: {
                        type: 'string',
                        description: 'Database name',
                    },
                    type: {
                        type: 'string',
                        description: 'Database type (for create)',
                        enum: dbService.getAvailableDatabaseTypes(),
                    },
                    planID: {
                        type: 'string',
                        description: 'Plan ID (for create, resize, update)',
                    },
                    version: {
                        type: 'string',
                        description: 'Database version (for create, update)',
                    },
                    ...getPaginationProperties(),
                },
                required: ['action'],
            },
        },

        {
            name: 'liara_manage_database_backups',
            description: 'Database backup management: create, list, get download URL, restore, or delete backups',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'Action to perform',
                        enum: ['create', 'list', 'get_download_url', 'restore', 'delete'],
                    },
                    databaseName: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                    backupId: {
                        type: 'string',
                        description: 'Backup ID (for get_download_url, restore, delete)',
                    },
                    ...getPaginationProperties(),
                },
                required: ['action', 'databaseName'],
            },
        },

        // ===== STORAGE MANAGEMENT CONSOLIDATION =====
        // Combine storage operations into 2 tools
        {
            name: 'liara_manage_buckets',
            description: 'Storage bucket lifecycle management: list, get details, create, delete, or get credentials',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'Action to perform',
                        enum: ['list', 'get', 'create', 'delete', 'get_credentials'],
                    },
                    name: {
                        type: 'string',
                        description: 'Bucket name',
                    },
                    region: {
                        type: 'string',
                        description: 'Region (for create)',
                    },
                    permission: {
                        type: 'string',
                        description: 'Permission level (for create)',
                        enum: ['private', 'public-read'],
                    },
                    ...getPaginationProperties(),
                },
                required: ['action'],
            },
        },

        {
            name: 'liara_manage_bucket_objects',
            description: 'Bucket object operations: list objects, upload, get download URL, or delete objects',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'Action to perform',
                        enum: ['list', 'upload', 'get_download_url', 'delete'],
                    },
                    bucketName: {
                        type: 'string',
                        description: 'The name of the bucket',
                    },
                    objectKey: {
                        type: 'string',
                        description: 'The object key/path',
                    },
                    filePath: {
                        type: 'string',
                        description: 'Path to file (for upload)',
                    },
                    prefix: {
                        type: 'string',
                        description: 'Prefix filter (for list)',
                    },
                    maxKeys: {
                        type: 'number',
                        description: 'Max objects to return (for list)',
                    },
                    expiresIn: {
                        type: 'number',
                        description: 'URL expiration in seconds (for get_download_url)',
                    },
                },
                required: ['action', 'bucketName'],
            },
        },

        // ===== INFRASTRUCTURE OVERVIEW TOOL =====
        // Single tool to get overview of all resources
        {
            name: 'liara_get_infrastructure_overview',
            description: 'Get a comprehensive overview of all Liara infrastructure: apps, databases, buckets, networks',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },

        // ===== DEPLOYMENT MANAGEMENT TOOL =====
        // Consolidated deployment operations
        {
            name: 'liara_manage_deployment',
            description: 'Deployment management: list releases and sources',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'Action to perform',
                        enum: ['list_releases', 'list_sources'],
                    },
                    appName: {
                        type: 'string',
                        description: 'App name',
                    },
                    lines: {
                        type: 'number',
                        description: 'Number of items to retrieve (default: 10)',
                    },
                },
                required: ['action', 'appName'],
            },
        },
    ];
}
