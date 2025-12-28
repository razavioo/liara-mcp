/**
 * Database tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';
import * as dbService from '../services/databases.js';

export function getDatabaseTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_databases',
            description: 'List all databases in your Liara account',
            inputSchema: {
                type: 'object',
                properties: getPaginationProperties(),
            },
        },
        {
            name: 'liara_get_database',
            description: 'Get details of a specific database',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_get_database_connection',
            description: 'Get database connection information (host, port, credentials)',
            inputSchema: {
                type: 'object',
                properties: {
                    databaseName: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                },
                required: ['databaseName'],
            },
        },
        {
            name: 'liara_update_database',
            description: 'Update database settings such as plan (resize) or version. At least one of planID or version must be provided.',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                    planID: {
                        type: 'string',
                        description: 'New plan ID to resize the database',
                    },
                    version: {
                        type: 'string',
                        description: 'New database version',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_create_database',
            description: 'Create a new database',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Database name',
                    },
                    type: {
                        type: 'string',
                        description: 'Database type',
                        enum: dbService.getAvailableDatabaseTypes(),
                    },
                    planID: {
                        type: 'string',
                        description: 'Plan ID for the database',
                    },
                    version: {
                        type: 'string',
                        description: 'Database version (optional)',
                    },
                },
                required: ['name', 'type', 'planID'],
            },
        },
        {
            name: 'liara_delete_database',
            description: 'Delete a database',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the database to delete',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_start_database',
            description: 'Start a database',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_stop_database',
            description: 'Stop a database',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_resize_database',
            description: 'Change database plan (resize resources)',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                    planID: {
                        type: 'string',
                        description: 'New plan ID',
                    },
                },
                required: ['name', 'planID'],
            },
        },
        {
            name: 'liara_create_backup',
            description: 'Create a database backup',
            inputSchema: {
                type: 'object',
                properties: {
                    databaseName: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                },
                required: ['databaseName'],
            },
        },
        {
            name: 'liara_list_backups',
            description: 'List backups for a database',
            inputSchema: {
                type: 'object',
                properties: {
                    databaseName: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                    ...getPaginationProperties(),
                },
                required: ['databaseName'],
            },
        },
        {
            name: 'liara_get_backup_download_url',
            description: 'Get download URL for a database backup',
            inputSchema: {
                type: 'object',
                properties: {
                    databaseName: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                    backupId: {
                        type: 'string',
                        description: 'The backup ID',
                    },
                },
                required: ['databaseName', 'backupId'],
            },
        },
        {
            name: 'liara_restart_database',
            description: 'Restart a database',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_restore_backup',
            description: 'Restore a database from a backup',
            inputSchema: {
                type: 'object',
                properties: {
                    databaseName: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                    backupId: {
                        type: 'string',
                        description: 'The backup ID to restore from',
                    },
                },
                required: ['databaseName', 'backupId'],
            },
        },
        {
            name: 'liara_delete_backup',
            description: 'Delete a database backup',
            inputSchema: {
                type: 'object',
                properties: {
                    databaseName: {
                        type: 'string',
                        description: 'The name of the database',
                    },
                    backupId: {
                        type: 'string',
                        description: 'The backup ID to delete',
                    },
                },
                required: ['databaseName', 'backupId'],
            },
        },
    ];
}
