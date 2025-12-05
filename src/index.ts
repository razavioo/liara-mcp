#!/usr/bin/env node

// Load environment variables from .env file if it exists
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createLiaraClient } from './api/client.js';
import { formatErrorForMcp, LiaraMcpError } from './utils/errors.js';
import { PaginationOptions, CreateProjectRequest } from './api/types.js';
import * as appService from './services/apps.js';
import * as envService from './services/environment.js';
import * as deployService from './services/deployment.js';
import * as dbService from './services/databases.js';
import * as storageService from './services/storage.js';
import * as planService from './services/plans.js';
import * as dnsService from './services/dns.js';
import * as mailService from './services/mail.js';
import * as iaasService from './services/iaas.js';
import * as diskService from './services/disks.js';
import * as networkService from './services/network.js';
import * as userService from './services/user.js';
import * as observabilityService from './services/observability.js';
import * as settingsService from './services/settings.js';
import * as domainService from './services/domains.js';

/**
 * Liara MCP Server
 * Provides tools for managing Liara cloud infrastructure
 */
class LiaraMcpServer {
    private server: Server;
    private client: ReturnType<typeof createLiaraClient>;

    constructor() {
        this.server = new Server(
            {
                name: 'liara-mcp',
                version: '0.3.3',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Initialize Liara API client
        try {
            this.client = createLiaraClient();
        } catch (error) {
            console.error('Failed to initialize Liara client:', error);
            throw error;
        }

        this.setupHandlers();

        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupHandlers() {
        this.setupListToolsHandler();
        this.setupCallToolHandler();
    }

    /**
     * Get pagination properties for tool schemas
     */
    private getPaginationProperties() {
        return {
            page: {
                type: 'number' as const,
                description: 'Page number (1-based)',
            },
            perPage: {
                type: 'number' as const,
                description: 'Number of items per page',
            },
            limit: {
                type: 'number' as const,
                description: 'Alternative to perPage: maximum number of items to return',
            },
            offset: {
                type: 'number' as const,
                description: 'Alternative to page: number of items to skip',
            },
        };
    }

    /**
     * Extract pagination options from tool arguments
     */
    private extractPagination(args: any): PaginationOptions | undefined {
        if (args?.page || args?.perPage || args?.limit || args?.offset) {
            return {
                page: args.page as number | undefined,
                perPage: args.perPage as number | undefined,
                limit: args.limit as number | undefined,
                offset: args.offset as number | undefined,
            };
        }
        return undefined;
    }

    private setupListToolsHandler() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                // App Management Tools
                {
                    name: 'liara_list_apps',
                    description: 'List all apps/projects in your Liara account',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
                    },
                },
                {
                    name: 'liara_get_app',
                    description: 'Get detailed information about a specific app',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_create_app',
                    description: 'Create a new app',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'App name (3-32 chars, lowercase, alphanumeric with hyphens)',
                            },
                            platform: {
                                type: 'string',
                                description: 'Platform type',
                                enum: appService.getAvailablePlatforms(),
                            },
                            planID: {
                                type: 'string',
                                description: 'Plan ID for the app',
                            },
                            region: {
                                type: 'string',
                                description: 'Deployment region (optional)',
                            },
                        },
                        required: ['name', 'platform', 'planID'],
                    },
                },
                {
                    name: 'liara_delete_app',
                    description: 'Delete an app',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the app to delete',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_start_app',
                    description: 'Start an app (scale up)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the app to start',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_stop_app',
                    description: 'Stop an app (scale down)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the app to stop',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_restart_app',
                    description: 'Restart an app',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the app to restart',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_resize_app',
                    description: 'Change app plan (resize resources)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            planID: {
                                type: 'string',
                                description: 'New plan ID',
                            },
                        },
                        required: ['name', 'planID'],
                    },
                },

                // Environment Variable Tools
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

                // App Settings Tools
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

                // Deployment Tools
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
                            ...this.getPaginationProperties(),
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
                            ...this.getPaginationProperties(),
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

                // Database Tools
                {
                    name: 'liara_list_databases',
                    description: 'List all databases in your Liara account',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
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
                    description: 'Get database connection information (host, port, credentials). Tries multiple API endpoints to retrieve complete connection info including passwords. Returns warnings if password is not available.',
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
                    name: 'liara_reset_database_password',
                    description: 'Reset or update database password. If newPassword is not provided, generates a new random password. Returns the new password in the response.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            databaseName: {
                                type: 'string',
                                description: 'The name of the database',
                            },
                            newPassword: {
                                type: 'string',
                                description: 'Optional: New password to set. If not provided, a random password will be generated.',
                            },
                        },
                        required: ['databaseName'],
                    },
                },
                {
                    name: 'liara_update_database',
                    description: 'Update database settings such as plan (resize) or version',
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
                            ...this.getPaginationProperties(),
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

                // Storage (Bucket) Tools
                {
                    name: 'liara_list_buckets',
                    description: 'List all storage buckets',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
                    },
                },
                {
                    name: 'liara_get_bucket',
                    description: 'Get details of a specific bucket',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the bucket',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_create_bucket',
                    description: 'Create a new storage bucket',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Bucket name',
                            },
                            region: {
                                type: 'string',
                                description: 'Region (optional)',
                            },
                            permission: {
                                type: 'string',
                                description: 'Permission level',
                                enum: ['private', 'public-read'],
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_delete_bucket',
                    description: 'Delete a storage bucket',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the bucket to delete',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_get_bucket_credentials',
                    description: 'Get S3-compatible credentials for a bucket',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'The name of the bucket',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'liara_list_objects',
                    description: 'List objects in a bucket',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            bucketName: {
                                type: 'string',
                                description: 'The name of the bucket',
                            },
                            prefix: {
                                type: 'string',
                                description: 'Prefix to filter objects (optional)',
                            },
                            maxKeys: {
                                type: 'number',
                                description: 'Maximum number of objects to return (optional)',
                            },
                        },
                        required: ['bucketName'],
                    },
                },
                {
                    name: 'liara_upload_object',
                    description: 'Upload an object to a bucket',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            bucketName: {
                                type: 'string',
                                description: 'The name of the bucket',
                            },
                            objectKey: {
                                type: 'string',
                                description: 'The object key (path)',
                            },
                            filePath: {
                                type: 'string',
                                description: 'Path to the file to upload',
                            },
                        },
                        required: ['bucketName', 'objectKey', 'filePath'],
                    },
                },
                {
                    name: 'liara_get_object_download_url',
                    description: 'Get download URL for an object',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            bucketName: {
                                type: 'string',
                                description: 'The name of the bucket',
                            },
                            objectKey: {
                                type: 'string',
                                description: 'The object key',
                            },
                            expiresIn: {
                                type: 'number',
                                description: 'URL expiration time in seconds (optional)',
                            },
                        },
                        required: ['bucketName', 'objectKey'],
                    },
                },
                {
                    name: 'liara_delete_object',
                    description: 'Delete an object from a bucket',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            bucketName: {
                                type: 'string',
                                description: 'The name of the bucket',
                            },
                            objectKey: {
                                type: 'string',
                                description: 'The object key to delete',
                            },
                        },
                        required: ['bucketName', 'objectKey'],
                    },
                },


                // Plan Tools
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
                            ...this.getPaginationProperties(),
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

                // DNS Tools
                {
                    name: 'liara_list_zones',
                    description: 'List all DNS zones',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
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
                            ...this.getPaginationProperties(),
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

                // Domain Tools (App Domains)
                {
                    name: 'liara_list_domains',
                    description: 'List all domains attached to apps',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
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

                // Mail Tools
                {
                    name: 'liara_list_mail_servers',
                    description: 'List all mail servers',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
                    },
                },
                {
                    name: 'liara_get_mail_server',
                    description: 'Get details of a mail server',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            mailId: {
                                type: 'string',
                                description: 'The mail server ID',
                            },
                        },
                        required: ['mailId'],
                    },
                },
                {
                    name: 'liara_create_mail_server',
                    description: 'Create a new mail server',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Mail server name',
                            },
                            mode: {
                                type: 'string',
                                description: 'Mail server mode',
                                enum: ['DEV', 'LIVE'],
                            },
                            planID: {
                                type: 'string',
                                description: 'Plan ID for the mail server (required)',
                            },
                            domain: {
                                type: 'string',
                                description: 'Domain name for the mail server (required)',
                            },
                        },
                        required: ['planID', 'domain'],
                    },
                },
                {
                    name: 'liara_delete_mail_server',
                    description: 'Delete a mail server',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            mailId: {
                                type: 'string',
                                description: 'The mail server ID to delete',
                            },
                        },
                        required: ['mailId'],
                    },
                },
                {
                    name: 'liara_send_email',
                    description: 'Send an email via a mail server',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            mailId: {
                                type: 'string',
                                description: 'The mail server ID',
                            },
                            from: {
                                type: 'string',
                                description: 'From email address',
                            },
                            to: {
                                type: 'string',
                                description: 'To email address(es) - comma-separated for multiple',
                            },
                            subject: {
                                type: 'string',
                                description: 'Email subject',
                            },
                            html: {
                                type: 'string',
                                description: 'HTML email content (optional)',
                            },
                            text: {
                                type: 'string',
                                description: 'Plain text email content (optional)',
                            },
                        },
                        required: ['mailId', 'from', 'to', 'subject'],
                    },
                },
                {
                    name: 'liara_start_mail_server',
                    description: 'Start a mail server',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            mailId: {
                                type: 'string',
                                description: 'The mail server ID',
                            },
                        },
                        required: ['mailId'],
                    },
                },
                {
                    name: 'liara_stop_mail_server',
                    description: 'Stop a mail server',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            mailId: {
                                type: 'string',
                                description: 'The mail server ID',
                            },
                        },
                        required: ['mailId'],
                    },
                },
                {
                    name: 'liara_restart_mail_server',
                    description: 'Restart a mail server',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            mailId: {
                                type: 'string',
                                description: 'The mail server ID',
                            },
                        },
                        required: ['mailId'],
                    },
                },

                // VM (IaaS) Tools
                {
                    name: 'liara_list_vms',
                    description: 'List all virtual machines',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
                    },
                },
                {
                    name: 'liara_get_vm',
                    description: 'Get details of a virtual machine',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                        },
                        required: ['vmId'],
                    },
                },
                {
                    name: 'liara_create_vm',
                    description: 'Create a new virtual machine',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'VM name',
                            },
                            planID: {
                                type: 'string',
                                description: 'Plan ID for the VM',
                            },
                            os: {
                                type: 'string',
                                description: 'Operating system',
                            },
                            sshKey: {
                                type: 'string',
                                description: 'SSH public key (optional)',
                            },
                            network: {
                                type: 'string',
                                description: 'Network ID (required by the API)',
                            },
                        },
                        required: ['name', 'planID', 'os', 'network'],
                    },
                },
                {
                    name: 'liara_start_vm',
                    description: 'Start a virtual machine',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                        },
                        required: ['vmId'],
                    },
                },
                {
                    name: 'liara_stop_vm',
                    description: 'Stop a virtual machine',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                        },
                        required: ['vmId'],
                    },
                },
                {
                    name: 'liara_restart_vm',
                    description: 'Restart a virtual machine',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                        },
                        required: ['vmId'],
                    },
                },
                {
                    name: 'liara_delete_vm',
                    description: 'Delete a virtual machine',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID to delete',
                            },
                        },
                        required: ['vmId'],
                    },
                },
                {
                    name: 'liara_resize_vm',
                    description: 'Resize a virtual machine (change plan)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                            planID: {
                                type: 'string',
                                description: 'New plan ID',
                            },
                        },
                        required: ['vmId', 'planID'],
                    },
                },
                {
                    name: 'liara_create_snapshot',
                    description: 'Create a VM snapshot',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                            name: {
                                type: 'string',
                                description: 'Snapshot name (optional)',
                            },
                        },
                        required: ['vmId'],
                    },
                },
                {
                    name: 'liara_list_snapshots',
                    description: 'List VM snapshots',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                            ...this.getPaginationProperties(),
                        },
                        required: ['vmId'],
                    },
                },
                {
                    name: 'liara_restore_snapshot',
                    description: 'Restore a VM from a snapshot',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                            snapshotId: {
                                type: 'string',
                                description: 'The snapshot ID',
                            },
                        },
                        required: ['vmId', 'snapshotId'],
                    },
                },
                {
                    name: 'liara_delete_snapshot',
                    description: 'Delete a VM snapshot',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                            snapshotId: {
                                type: 'string',
                                description: 'The snapshot ID to delete',
                            },
                        },
                        required: ['vmId', 'snapshotId'],
                    },
                },
                {
                    name: 'liara_attach_network',
                    description: 'Attach a network to a VM',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                            networkId: {
                                type: 'string',
                                description: 'The network ID',
                            },
                        },
                        required: ['vmId', 'networkId'],
                    },
                },
                {
                    name: 'liara_detach_network',
                    description: 'Detach a network from a VM',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vmId: {
                                type: 'string',
                                description: 'The VM ID',
                            },
                            networkId: {
                                type: 'string',
                                description: 'The network ID',
                            },
                        },
                        required: ['vmId', 'networkId'],
                    },
                },

                // Disk Tools
                {
                    name: 'liara_list_disks',
                    description: 'List disks for an app',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            ...this.getPaginationProperties(),
                        },
                        required: ['appName'],
                    },
                },
                {
                    name: 'liara_create_disk',
                    description: 'Create a new disk for an app',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            name: {
                                type: 'string',
                                description: 'Disk name',
                            },
                            size: {
                                type: 'number',
                                description: 'Disk size in GB',
                            },
                            mountPath: {
                                type: 'string',
                                description: 'Mount path for the disk',
                            },
                        },
                        required: ['appName', 'name', 'size', 'mountPath'],
                    },
                },
                {
                    name: 'liara_delete_disk',
                    description: 'Delete a disk',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            diskName: {
                                type: 'string',
                                description: 'The name of the disk to delete',
                            },
                        },
                        required: ['appName', 'diskName'],
                    },
                },
                {
                    name: 'liara_get_disk',
                    description: 'Get details of a specific disk',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            diskName: {
                                type: 'string',
                                description: 'The name of the disk',
                            },
                        },
                        required: ['appName', 'diskName'],
                    },
                },
                {
                    name: 'liara_resize_disk',
                    description: 'Resize a disk',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            diskName: {
                                type: 'string',
                                description: 'The name of the disk',
                            },
                            size: {
                                type: 'number',
                                description: 'New disk size in GB',
                            },
                        },
                        required: ['appName', 'diskName', 'size'],
                    },
                },
                {
                    name: 'liara_create_ftp_access',
                    description: 'Create FTP access for a disk',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            diskName: {
                                type: 'string',
                                description: 'The name of the disk',
                            },
                        },
                        required: ['appName', 'diskName'],
                    },
                },
                {
                    name: 'liara_list_ftp_accesses',
                    description: 'List FTP accesses for a disk',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            diskName: {
                                type: 'string',
                                description: 'The name of the disk',
                            },
                            ...this.getPaginationProperties(),
                        },
                        required: ['appName', 'diskName'],
                    },
                },
                {
                    name: 'liara_delete_ftp_access',
                    description: 'Delete/revoke FTP access for a disk',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'The name of the app',
                            },
                            diskName: {
                                type: 'string',
                                description: 'The name of the disk',
                            },
                            ftpId: {
                                type: 'string',
                                description: 'The FTP access ID to delete',
                            },
                        },
                        required: ['appName', 'diskName', 'ftpId'],
                    },
                },

                // Network Tools
                {
                    name: 'liara_list_networks',
                    description: 'List all networks',
                    inputSchema: {
                        type: 'object',
                        properties: this.getPaginationProperties(),
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

                // User Tools
                {
                    name: 'liara_get_user',
                    description: 'Get comprehensive user information including plans and teams',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },

                // Observability Tools
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
            ],
        }));
    }

    private setupCallToolHandler() {
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;

                switch (name) {
                    // App Management
                    case 'liara_list_apps': {
                        const apps = await appService.listApps(this.client, this.extractPagination(args));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(apps, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_app': {
                        const app = await appService.getApp(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(app, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_app': {
                        const app = await appService.createApp(this.client, args as unknown as CreateProjectRequest);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: app,
                                        message: `App "${app.name}" created successfully`
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_delete_app': {
                        await appService.deleteApp(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `App "${args!.name}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_start_app': {
                        await appService.startApp(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `App "${args!.name}" started successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_stop_app': {
                        await appService.stopApp(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `App "${args!.name}" stopped successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_restart_app': {
                        await appService.restartApp(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `App "${args!.name}" restarted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_resize_app': {
                        await appService.resizeApp(
                            this.client,
                            args!.name as string,
                            args!.planID as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `App "${args!.name}" resized to plan "${args!.planID}" successfully.`,
                                },
                            ],
                        };
                    }

                    // Environment Variables
                    case 'liara_set_env_vars': {
                        const result = await envService.updateEnvVars(
                            this.client,
                            args!.appName as string,
                            args!.variables as any[]
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || 'Environment variables updated successfully.',
                                },
                            ],
                        };
                    }

                    case 'liara_set_env_var': {
                        const result = await envService.setEnvVar(
                            this.client,
                            args!.appName as string,
                            args!.key as string,
                            args!.value as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Environment variable ${args!.key} set successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_get_env_vars': {
                        const envVars = await envService.getEnvVars(this.client, args!.appName as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(envVars, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_delete_env_var': {
                        const result = await envService.deleteEnvVar(
                            this.client,
                            args!.appName as string,
                            args!.key as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Environment variable ${args!.key} deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_env_vars': {
                        const result = await envService.deleteEnvVars(
                            this.client,
                            args!.appName as string,
                            args!.keys as string[]
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || 'Environment variables deleted successfully.',
                                },
                            ],
                        };
                    }

                    // App Settings
                    case 'liara_set_zero_downtime': {
                        const result = await settingsService.setZeroDowntime(
                            this.client,
                            args!.appName as string,
                            args!.enabled as boolean
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Zero-downtime deployment ${args!.enabled ? 'enabled' : 'disabled'} successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_set_default_subdomain': {
                        const result = await settingsService.setDefaultSubdomain(
                            this.client,
                            args!.appName as string,
                            args!.enabled as boolean
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Default subdomain ${args!.enabled ? 'enabled' : 'disabled'} successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_set_fixed_ip': {
                        const result = await settingsService.setFixedIP(
                            this.client,
                            args!.appName as string,
                            args!.enabled as boolean
                        );
                        const ipInfo = result.IP ? `\nStatic IP: ${result.IP}` : '';
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: (result.message || `Static IP ${args!.enabled ? 'enabled' : 'disabled'} successfully.`) + ipInfo,
                                },
                            ],
                        };
                    }

                    case 'liara_set_read_only': {
                        const result = await settingsService.setReadOnly(
                            this.client,
                            args!.appName as string,
                            args!.enabled as boolean
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Read-only mode ${args!.enabled ? 'enabled' : 'disabled'} successfully.`,
                                },
                            ],
                        };
                    }

                    // Deployment
                    case 'liara_upload_source': {
                        const result = await deployService.uploadSource(
                            this.client,
                            args!.appName as string,
                            args!.filePath as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Source uploaded successfully. Source ID: ${result.sourceID}`,
                                },
                            ],
                        };
                    }

                    case 'liara_deploy_release': {
                        const result = await deployService.deployRelease(
                            this.client,
                            args!.appName as string,
                            {
                                sourceID: args!.sourceID as string,
                                envVars: args!.envVars as any,
                            }
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Deployment initiated. Release ID: ${result.releaseID}`,
                                },
                            ],
                        };
                    }

                    case 'liara_list_releases': {
                        const releases = await deployService.listReleases(
                            this.client,
                            args!.appName as string,
                            this.extractPagination(args)
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(releases, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_release': {
                        const release = await deployService.getRelease(
                            this.client,
                            args!.appName as string,
                            args!.releaseID as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(release, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_rollback_release': {
                        const result = await deployService.rollbackRelease(
                            this.client,
                            args!.appName as string,
                            args!.releaseID as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Rolled back to release "${args!.releaseID}" successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_list_sources': {
                        const sources = await deployService.listSources(
                            this.client,
                            args!.appName as string,
                            this.extractPagination(args)
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(sources, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_delete_source': {
                        await deployService.deleteSource(
                            this.client,
                            args!.appName as string,
                            args!.sourceID as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Source "${args!.sourceID}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    // Databases
                    case 'liara_list_databases': {
                        const databases = await dbService.listDatabases(this.client);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(databases, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_database': {
                        const database = await dbService.getDatabase(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(database, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_database_connection': {
                        const connection = await dbService.getDatabaseConnection(
                            this.client,
                            args!.databaseName as string
                        );
                        
                        // Format response with clear indication of password availability
                        let responseText = JSON.stringify(connection, null, 2);
                        
                        if (!connection.passwordAvailable) {
                            responseText += '\n\n⚠️  WARNING: Password not available in API response.\n';
                            if (connection.warnings) {
                                responseText += connection.warnings.join('\n') + '\n';
                            }
                        }
                        
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: responseText,
                                },
                            ],
                        };
                    }

                    case 'liara_reset_database_password': {
                        const result = await dbService.resetDatabasePassword(
                            this.client,
                            args!.databaseName as string,
                            args!.newPassword as string | undefined
                        );
                        
                        let responseText = `Password reset successfully for database "${args!.databaseName}".\n`;
                        if (result.password) {
                            responseText += `\n🔑 New Password: ${result.password}\n`;
                            responseText += '\n⚠️  IMPORTANT: Save this password immediately. It will not be shown again.\n';
                        }
                        if (result.message) {
                            responseText += `\nMessage: ${result.message}\n`;
                        }
                        
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: responseText + '\n' + JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_update_database': {
                        const database = await dbService.updateDatabase(
                            this.client,
                            args!.name as string,
                            {
                                planID: args!.planID as string | undefined,
                                version: args!.version as string | undefined,
                            }
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Database "${args!.name}" updated successfully.\n${JSON.stringify(database, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_create_database': {
                        const database = await dbService.createDatabase(this.client, args as any);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Database "${database.name}" created successfully.\n${JSON.stringify(database, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_database': {
                        await dbService.deleteDatabase(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Database "${args!.name}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_start_database': {
                        await dbService.startDatabase(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Database "${args!.name}" started successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_stop_database': {
                        await dbService.stopDatabase(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Database "${args!.name}" stopped successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_resize_database': {
                        await dbService.resizeDatabase(
                            this.client,
                            args!.name as string,
                            args!.planID as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Database "${args!.name}" resized to plan "${args!.planID}" successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_create_backup': {
                        const backup = await dbService.createBackup(this.client, args!.databaseName as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Backup created successfully.\n${JSON.stringify(backup, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_list_backups': {
                        const backups = await dbService.listBackups(
                            this.client,
                            args!.databaseName as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(backups, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_backup_download_url': {
                        const result = await dbService.getBackupDownloadUrl(
                            this.client,
                            args!.databaseName as string,
                            args!.backupId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_restart_database': {
                        await dbService.restartDatabase(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Database "${args!.name}" restarted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_restore_backup': {
                        const result = await dbService.restoreBackup(
                            this.client,
                            args!.databaseName as string,
                            args!.backupId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Database "${args!.databaseName}" restored from backup "${args!.backupId}" successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_backup': {
                        await dbService.deleteBackup(
                            this.client,
                            args!.databaseName as string,
                            args!.backupId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Backup "${args!.backupId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    // Storage
                    case 'liara_list_buckets': {
                        const buckets = await storageService.listBuckets(this.client, this.extractPagination(args));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(buckets, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_bucket': {
                        const bucket = await storageService.getBucket(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(bucket, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_bucket': {
                        const bucket = await storageService.createBucket(this.client, args as any);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Bucket "${bucket.name}" created successfully.\n${JSON.stringify(bucket, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_bucket': {
                        await storageService.deleteBucket(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Bucket "${args!.name}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_get_bucket_credentials': {
                        const credentials = await storageService.getBucketCredentials(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(credentials, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_list_objects': {
                        const objects = await storageService.listObjects(
                            this.client,
                            args!.bucketName as string,
                            args?.prefix as string | undefined,
                            args?.maxKeys as number | undefined
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(objects, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_upload_object': {
                        const result = await storageService.uploadObject(
                            this.client,
                            args!.bucketName as string,
                            args!.objectKey as string,
                            args!.filePath as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Object "${args!.objectKey}" uploaded successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_get_object_download_url': {
                        const result = await storageService.getObjectDownloadUrl(
                            this.client,
                            args!.bucketName as string,
                            args!.objectKey as string,
                            args?.expiresIn as number | undefined
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_delete_object': {
                        await storageService.deleteObject(
                            this.client,
                            args!.bucketName as string,
                            args!.objectKey as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Object "${args!.objectKey}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    // Plans
                    case 'liara_list_plans': {
                        const plans = await planService.listPlans(
                            this.client,
                            args?.planType as 'app' | 'database' | 'vm' | undefined,
                            this.extractPagination(args)
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(plans, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_plan': {
                        const plan = await planService.getPlan(this.client, args!.planId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(plan, null, 2),
                                },
                            ],
                        };
                    }

                    // DNS
                    case 'liara_list_zones': {
                        const zones = await dnsService.listZones(this.client, this.extractPagination(args));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(zones, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_zone': {
                        const zone = await dnsService.getZone(this.client, args!.zoneId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(zone, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_zone': {
                        const zone = await dnsService.createZone(this.client, args!.name as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Zone "${zone.name}" created successfully.\n${JSON.stringify(zone, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_zone': {
                        await dnsService.deleteZone(this.client, args!.zoneId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Zone "${args!.zoneId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_list_dns_records': {
                        const records = await dnsService.listRecords(
                            this.client,
                            args!.zoneId as string,
                            this.extractPagination(args)
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(records, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_dns_record': {
                        const record = await dnsService.createRecord(
                            this.client,
                            args!.zoneId as string,
                            {
                                type: args!.type as any,
                                name: args!.name as string,
                                value: args!.value as string,
                                ttl: args?.ttl as number | undefined,
                                priority: args?.priority as number | undefined,
                            }
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `DNS record created successfully.\n${JSON.stringify(record, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_get_dns_record': {
                        const record = await dnsService.getRecord(
                            this.client,
                            args!.zoneId as string,
                            args!.recordId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(record, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_update_dns_record': {
                        const record = await dnsService.updateRecord(
                            this.client,
                            args!.zoneId as string,
                            args!.recordId as string,
                            {
                                type: args?.type as any,
                                name: args?.name as string | undefined,
                                value: args?.value as string | undefined,
                                ttl: args?.ttl as number | undefined,
                                priority: args?.priority as number | undefined,
                            }
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `DNS record updated successfully.\n${JSON.stringify(record, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_dns_record': {
                        await dnsService.deleteRecord(
                            this.client,
                            args!.zoneId as string,
                            args!.recordId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `DNS record "${args!.recordId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    // Domains (App Domains)
                    case 'liara_list_domains': {
                        const domains = await domainService.listDomains(this.client, this.extractPagination(args));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(domains, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_domain': {
                        const domain = await domainService.getDomain(this.client, args!.domainId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(domain, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_add_domain': {
                        const domain = await domainService.addDomain(
                            this.client,
                            args!.appName as string,
                            args!.domain as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Domain "${domain.name}" added successfully.\n${JSON.stringify(domain, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_remove_domain': {
                        await domainService.removeDomain(this.client, args!.domainId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Domain "${args!.domainId}" removed successfully.`,
                                },
                            ],
                        };
                    }

                    // Mail
                    case 'liara_list_mail_servers': {
                        const servers = await mailService.listMailServers(this.client, this.extractPagination(args));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(servers, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_mail_server': {
                        const server = await mailService.getMailServer(this.client, args!.mailId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(server, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_mail_server': {
                        const server = await mailService.createMailServer(
                            this.client,
                            args!.name as string,
                            args?.mode as 'DEV' | 'LIVE' | undefined,
                            args?.planID as string | undefined,
                            args?.domain as string | undefined
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Mail server "${server.name}" created successfully.\n${JSON.stringify(server, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_mail_server': {
                        await mailService.deleteMailServer(this.client, args!.mailId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Mail server "${args!.mailId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_send_email': {
                        const toAddresses = (args!.to as string).split(',').map(s => s.trim());
                        const result = await mailService.sendEmail(
                            this.client,
                            args!.mailId as string,
                            {
                                from: args!.from as string,
                                to: toAddresses.length === 1 ? toAddresses[0] : toAddresses,
                                subject: args!.subject as string,
                                html: args?.html as string | undefined,
                                text: args?.text as string | undefined,
                            }
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || 'Email sent successfully.',
                                },
                            ],
                        };
                    }

                    case 'liara_start_mail_server': {
                        await mailService.startMailServer(this.client, args!.mailId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Mail server "${args!.mailId}" started successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_stop_mail_server': {
                        await mailService.stopMailServer(this.client, args!.mailId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Mail server "${args!.mailId}" stopped successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_restart_mail_server': {
                        await mailService.restartMailServer(this.client, args!.mailId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Mail server "${args!.mailId}" restarted successfully.`,
                                },
                            ],
                        };
                    }

                    // VMs
                    case 'liara_list_vms': {
                        const vms = await iaasService.listVMs(this.client, this.extractPagination(args));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(vms, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_vm': {
                        const vm = await iaasService.getVM(this.client, args!.vmId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(vm, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_vm': {
                        const vm = await iaasService.createVM(this.client, args as any);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `VM "${vm.name}" created successfully.\n${JSON.stringify(vm, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_start_vm': {
                        await iaasService.startVM(this.client, args!.vmId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `VM "${args!.vmId}" started successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_stop_vm': {
                        await iaasService.stopVM(this.client, args!.vmId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `VM "${args!.vmId}" stopped successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_restart_vm': {
                        await iaasService.restartVM(this.client, args!.vmId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `VM "${args!.vmId}" restarted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_vm': {
                        await iaasService.deleteVM(this.client, args!.vmId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `VM "${args!.vmId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_resize_vm': {
                        const vm = await iaasService.resizeVM(
                            this.client,
                            args!.vmId as string,
                            args!.planID as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `VM "${args!.vmId}" resized to plan "${args!.planID}" successfully.\n${JSON.stringify(vm, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_create_snapshot': {
                        const snapshot = await iaasService.createSnapshot(
                            this.client,
                            args!.vmId as string,
                            args?.name as string | undefined
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Snapshot created successfully.\n${JSON.stringify(snapshot, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_list_snapshots': {
                        const snapshots = await iaasService.listSnapshots(
                            this.client,
                            args!.vmId as string,
                            this.extractPagination(args)
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(snapshots, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_restore_snapshot': {
                        const result = await iaasService.restoreSnapshot(
                            this.client,
                            args!.vmId as string,
                            args!.snapshotId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `VM "${args!.vmId}" restored from snapshot "${args!.snapshotId}" successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_snapshot': {
                        await iaasService.deleteSnapshot(
                            this.client,
                            args!.vmId as string,
                            args!.snapshotId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Snapshot "${args!.snapshotId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_attach_network': {
                        const result = await iaasService.attachNetwork(
                            this.client,
                            args!.vmId as string,
                            args!.networkId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result.message || `Network "${args!.networkId}" attached to VM "${args!.vmId}" successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_detach_network': {
                        await iaasService.detachNetwork(
                            this.client,
                            args!.vmId as string,
                            args!.networkId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Network "${args!.networkId}" detached from VM "${args!.vmId}" successfully.`,
                                },
                            ],
                        };
                    }

                    // Disks
                    case 'liara_list_disks': {
                        const disks = await diskService.listDisks(
                            this.client,
                            args!.appName as string,
                            this.extractPagination(args)
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(disks, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_disk': {
                        const disk = await diskService.createDisk(
                            this.client,
                            args!.appName as string,
                            {
                                name: args!.name as string,
                                size: args!.size as number,
                                mountPath: args!.mountPath as string,
                            }
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Disk "${disk.name}" created successfully.\n${JSON.stringify(disk, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_get_disk': {
                        const disk = await diskService.getDisk(
                            this.client,
                            args!.appName as string,
                            args!.diskName as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(disk, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_delete_disk': {
                        await diskService.deleteDisk(
                            this.client,
                            args!.appName as string,
                            args!.diskName as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Disk "${args!.diskName}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    case 'liara_resize_disk': {
                        const disk = await diskService.resizeDisk(
                            this.client,
                            args!.appName as string,
                            args!.diskName as string,
                            args!.size as number
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Disk "${args!.diskName}" resized to ${args!.size}GB successfully.\n${JSON.stringify(disk, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_create_ftp_access': {
                        const ftp = await diskService.createFtpAccess(
                            this.client,
                            args!.appName as string,
                            args!.diskName as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `FTP access created successfully.\n${JSON.stringify(ftp, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_list_ftp_accesses': {
                        const ftpAccesses = await diskService.listFtpAccesses(
                            this.client,
                            args!.appName as string,
                            args!.diskName as string,
                            this.extractPagination(args)
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(ftpAccesses, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_delete_ftp_access': {
                        await diskService.deleteFtpAccess(
                            this.client,
                            args!.appName as string,
                            args!.diskName as string,
                            args!.ftpId as string
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `FTP access "${args!.ftpId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    // Networks
                    case 'liara_list_networks': {
                        const networks = await networkService.listNetworks(this.client, this.extractPagination(args));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(networks, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_network': {
                        const network = await networkService.getNetwork(this.client, args!.networkId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(network, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_create_network': {
                        const network = await networkService.createNetwork(
                            this.client,
                            args!.name as string,
                            args?.cidr as string | undefined
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Network "${network.name}" created successfully.\n${JSON.stringify(network, null, 2)}`,
                                },
                            ],
                        };
                    }

                    case 'liara_delete_network': {
                        await networkService.deleteNetwork(this.client, args!.networkId as string);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Network "${args!.networkId}" deleted successfully.`,
                                },
                            ],
                        };
                    }

                    // User
                    case 'liara_get_user': {
                        const userInfo = await userService.getUserInfo(this.client);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(userInfo, null, 2),
                                },
                            ],
                        };
                    }

                    // Observability
                    case 'liara_get_metrics': {
                        const metrics = await observabilityService.getAppMetrics(
                            this.client,
                            args!.appName as string,
                            args?.period as string | undefined
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(metrics, null, 2),
                                },
                            ],
                        };
                    }

                    case 'liara_get_logs': {
                        const logs = await observabilityService.getAppLogs(
                            this.client,
                            args!.appName as string,
                            {
                                limit: args?.limit as number | undefined,
                                since: args?.since as string | undefined,
                                until: args?.until as string | undefined,
                            }
                        );
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(logs, null, 2),
                                },
                            ],
                        };
                    }

                    default:
                        throw new McpError(
                            ErrorCode.MethodNotFound,
                            `Unknown tool: ${name}`
                        );
                }
            } catch (error) {
                // Extract base message (without suggestions) and suggestions separately
                // to avoid duplication in the response
                const errorMessage = formatErrorForMcp(error);
                const suggestions = (error instanceof LiaraMcpError && error.suggestions) 
                    ? error.suggestions 
                    : undefined;
                const errorCode = (error instanceof LiaraMcpError && error.code) 
                    ? error.code 
                    : 'UNKNOWN_ERROR';
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: {
                                    code: errorCode,
                                    message: errorMessage,
                                    ...(suggestions && { suggestions })
                                }
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Liara MCP server running on stdio');
    }
}

// Start the server
const server = new LiaraMcpServer();
server.run().catch(console.error);