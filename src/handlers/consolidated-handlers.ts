/**
 * Consolidated tool handlers - handles all consolidated tool operations
 */
import { LiaraClient, ToolResult } from './types.js';
import * as appService from '../services/apps.js';
import * as envService from '../services/environment.js';
import * as dbService from '../services/databases.js';
import * as storageService from '../services/storage.js';
import * as deploymentService from '../services/deployment.js';

/**
 * Handle consolidated tool calls
 */
export async function handleConsolidatedTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_manage_app':
            return await handleAppManagement(client, args);

        case 'liara_manage_env_vars':
            return await handleEnvVarManagement(client, args);

        case 'liara_manage_databases':
            return await handleDatabaseManagement(client, args);

        case 'liara_manage_database_backups':
            return await handleDatabaseBackupManagement(client, args);

        case 'liara_manage_buckets':
            return await handleBucketManagement(client, args);

        case 'liara_manage_bucket_objects':
            return await handleBucketObjectManagement(client, args);

        case 'liara_get_infrastructure_overview':
            return await handleInfrastructureOverview(client);

        case 'liara_manage_deployment':
            return await handleDeploymentManagement(client, args);

        default:
            return null; // Not a consolidated tool
    }
}

/**
 * Handle app management operations
 */
async function handleAppManagement(client: LiaraClient, args: any): Promise<ToolResult> {
    const { action, name, platform, planID, region, page, perPage } = args;

    switch (action) {
        case 'list':
            const apps = await appService.listApps(client, { page, perPage });
            return {
                content: [{ type: 'text', text: JSON.stringify(apps, null, 2) }],
            };

        case 'get':
            if (!name) throw new Error('App name is required for get action');
            const app = await appService.getApp(client, name);
            return {
                content: [{ type: 'text', text: JSON.stringify(app, null, 2) }],
            };

        case 'create':
            if (!name || !platform || !planID) {
                throw new Error('name, platform, and planID are required for create action');
            }
            const createdApp = await appService.createApp(client, { name, platform, planID, region });
            return {
                content: [{ type: 'text', text: JSON.stringify(createdApp, null, 2) }],
            };

        case 'delete':
            if (!name) throw new Error('App name is required for delete action');
            await appService.deleteApp(client, name);
            return {
                content: [{ type: 'text', text: `App '${name}' deleted successfully` }],
            };

        case 'start':
            if (!name) throw new Error('App name is required for start action');
            await appService.startApp(client, name);
            return {
                content: [{ type: 'text', text: `App '${name}' started successfully` }],
            };

        case 'stop':
            if (!name) throw new Error('App name is required for stop action');
            await appService.stopApp(client, name);
            return {
                content: [{ type: 'text', text: `App '${name}' stopped successfully` }],
            };

        case 'restart':
            if (!name) throw new Error('App name is required for restart action');
            await appService.restartApp(client, name);
            return {
                content: [{ type: 'text', text: `App '${name}' restarted successfully` }],
            };

        case 'resize':
            if (!name || !planID) throw new Error('App name and planID are required for resize action');
            await appService.resizeApp(client, name, planID);
            return {
                content: [{ type: 'text', text: `App '${name}' resized to plan '${planID}' successfully` }],
            };

        default:
            throw new Error(`Unknown app action: ${action}`);
    }
}

/**
 * Handle environment variable management operations
 */
async function handleEnvVarManagement(client: LiaraClient, args: any): Promise<ToolResult> {
    const { action, appName, key, value, variables, keys } = args;

    if (!appName) throw new Error('appName is required for all env var actions');

    switch (action) {
        case 'list':
            const envVars = await envService.getEnvVars(client, appName);
            return {
                content: [{ type: 'text', text: JSON.stringify(envVars, null, 2) }],
            };

        case 'set':
            if (!key || !value) throw new Error('key and value are required for set action');
            await envService.setEnvVar(client, appName, key, value);
            return {
                content: [{ type: 'text', text: `Environment variable '${key}' set successfully for app '${appName}'` }],
            };

        case 'set_multiple':
            if (!variables || !Array.isArray(variables)) throw new Error('variables array is required for set_multiple action');
            await envService.updateEnvVars(client, appName, variables);
            return {
                content: [{ type: 'text', text: `${variables.length} environment variables set successfully for app '${appName}'` }],
            };

        case 'delete':
            if (!key) throw new Error('key is required for delete action');
            await envService.deleteEnvVar(client, appName, key);
            return {
                content: [{ type: 'text', text: `Environment variable '${key}' deleted successfully from app '${appName}'` }],
            };

        case 'delete_multiple':
            if (!keys || !Array.isArray(keys)) throw new Error('keys array is required for delete_multiple action');
            await envService.deleteEnvVars(client, appName, keys);
            return {
                content: [{ type: 'text', text: `${keys.length} environment variables deleted successfully from app '${appName}'` }],
            };

        default:
            throw new Error(`Unknown env var action: ${action}`);
    }
}

/**
 * Handle database management operations
 */
async function handleDatabaseManagement(client: LiaraClient, args: any): Promise<ToolResult> {
    const { action, name, type, planID, version } = args;

    switch (action) {
        case 'list':
            const databases = await dbService.listDatabases(client);
            return {
                content: [{ type: 'text', text: JSON.stringify(databases, null, 2) }],
            };

        case 'get':
            if (!name) throw new Error('Database name is required for get action');
            const database = await dbService.getDatabase(client, name);
            return {
                content: [{ type: 'text', text: JSON.stringify(database, null, 2) }],
            };

        case 'get_connection':
            if (!name) throw new Error('Database name is required for get_connection action');
            const connection = await dbService.getDatabaseConnection(client, name);
            return {
                content: [{ type: 'text', text: JSON.stringify(connection, null, 2) }],
            };

        case 'create':
            if (!name || !type || !planID) {
                throw new Error('name, type, and planID are required for create action');
            }
            const createdDb = await dbService.createDatabase(client, { name, type, planID, version });
            return {
                content: [{ type: 'text', text: JSON.stringify(createdDb, null, 2) }],
            };

        case 'delete':
            if (!name) throw new Error('Database name is required for delete action');
            await dbService.deleteDatabase(client, name);
            return {
                content: [{ type: 'text', text: `Database '${name}' deleted successfully` }],
            };

        case 'start':
            if (!name) throw new Error('Database name is required for start action');
            await dbService.startDatabase(client, name);
            return {
                content: [{ type: 'text', text: `Database '${name}' started successfully` }],
            };

        case 'stop':
            if (!name) throw new Error('Database name is required for stop action');
            await dbService.stopDatabase(client, name);
            return {
                content: [{ type: 'text', text: `Database '${name}' stopped successfully` }],
            };

        case 'restart':
            if (!name) throw new Error('Database name is required for restart action');
            await dbService.restartDatabase(client, name);
            return {
                content: [{ type: 'text', text: `Database '${name}' restarted successfully` }],
            };

        case 'resize':
        case 'update':
            if (!name) throw new Error('Database name is required for update action');
            const updateData: any = {};
            if (planID) updateData.planID = planID;
            if (version) updateData.version = version;
            if (Object.keys(updateData).length === 0) {
                throw new Error('At least planID or version must be provided for update action');
            }
            await dbService.updateDatabase(client, name, updateData);
            return {
                content: [{ type: 'text', text: `Database '${name}' updated successfully` }],
            };

        default:
            throw new Error(`Unknown database action: ${action}`);
    }
}

/**
 * Handle database backup management operations
 */
async function handleDatabaseBackupManagement(client: LiaraClient, args: any): Promise<ToolResult> {
    const { action, databaseName, backupId } = args;

    if (!databaseName) throw new Error('databaseName is required for all backup actions');

    switch (action) {
        case 'create':
            const backup = await dbService.createBackup(client, databaseName);
            return {
                content: [{ type: 'text', text: JSON.stringify(backup, null, 2) }],
            };

        case 'list':
            const backups = await dbService.listBackups(client, databaseName);
            return {
                content: [{ type: 'text', text: JSON.stringify(backups, null, 2) }],
            };

        case 'get_download_url':
            if (!backupId) throw new Error('backupId is required for get_download_url action');
            const downloadUrl = await dbService.getBackupDownloadUrl(client, databaseName, backupId);
            return {
                content: [{ type: 'text', text: downloadUrl.url }],
            };

        case 'restore':
            if (!backupId) throw new Error('backupId is required for restore action');
            await dbService.restoreBackup(client, databaseName, backupId);
            return {
                content: [{ type: 'text', text: `Database '${databaseName}' restored from backup '${backupId}' successfully` }],
            };

        case 'delete':
            if (!backupId) throw new Error('backupId is required for delete action');
            await dbService.deleteBackup(client, databaseName, backupId);
            return {
                content: [{ type: 'text', text: `Backup '${backupId}' deleted successfully from database '${databaseName}'` }],
            };

        default:
            throw new Error(`Unknown backup action: ${action}`);
    }
}

/**
 * Handle bucket management operations
 */
async function handleBucketManagement(client: LiaraClient, args: any): Promise<ToolResult> {
    const { action, name, region, permission, page, perPage } = args;

    switch (action) {
        case 'list':
            const buckets = await storageService.listBuckets(client, { page, perPage });
            return {
                content: [{ type: 'text', text: JSON.stringify(buckets, null, 2) }],
            };

        case 'get':
            if (!name) throw new Error('Bucket name is required for get action');
            const bucket = await storageService.getBucket(client, name);
            return {
                content: [{ type: 'text', text: JSON.stringify(bucket, null, 2) }],
            };

        case 'create':
            if (!name) throw new Error('Bucket name is required for create action');
            const createdBucket = await storageService.createBucket(client, { name, region, permission });
            return {
                content: [{ type: 'text', text: JSON.stringify(createdBucket, null, 2) }],
            };

        case 'delete':
            if (!name) throw new Error('Bucket name is required for delete action');
            await storageService.deleteBucket(client, name);
            return {
                content: [{ type: 'text', text: `Bucket '${name}' deleted successfully` }],
            };

        case 'get_credentials':
            if (!name) throw new Error('Bucket name is required for get_credentials action');
            const credentials = await storageService.getBucketCredentials(client, name);
            return {
                content: [{ type: 'text', text: JSON.stringify(credentials, null, 2) }],
            };

        default:
            throw new Error(`Unknown bucket action: ${action}`);
    }
}

/**
 * Handle bucket object management operations
 */
async function handleBucketObjectManagement(client: LiaraClient, args: any): Promise<ToolResult> {
    const { action, bucketName, objectKey, filePath, prefix, maxKeys, expiresIn } = args;

    if (!bucketName) throw new Error('bucketName is required for all object actions');

    switch (action) {
        case 'list':
            const objects = await storageService.listObjects(client, bucketName, prefix, maxKeys);
            return {
                content: [{ type: 'text', text: JSON.stringify(objects, null, 2) }],
            };

        case 'upload':
            if (!objectKey || !filePath) throw new Error('objectKey and filePath are required for upload action');
            await storageService.uploadObject(client, bucketName, objectKey, filePath);
            return {
                content: [{ type: 'text', text: `Object '${objectKey}' uploaded successfully to bucket '${bucketName}'` }],
            };

        case 'get_download_url':
            if (!objectKey) throw new Error('objectKey is required for get_download_url action');
            const downloadUrl = await storageService.getObjectDownloadUrl(client, bucketName, objectKey, expiresIn);
            return {
                content: [{ type: 'text', text: downloadUrl.url }],
            };

        case 'delete':
            if (!objectKey) throw new Error('objectKey is required for delete action');
            await storageService.deleteObject(client, bucketName, objectKey);
            return {
                content: [{ type: 'text', text: `Object '${objectKey}' deleted successfully from bucket '${bucketName}'` }],
            };

        default:
            throw new Error(`Unknown object action: ${action}`);
    }
}

/**
 * Handle infrastructure overview
 */
async function handleInfrastructureOverview(client: LiaraClient): Promise<ToolResult> {
    // Get all resources in parallel
    const [apps, databases, buckets] = await Promise.all([
        appService.listApps(client, {}),
        dbService.listDatabases(client),
        storageService.listBuckets(client, {}),
    ]);

    const overview = {
        apps: {
            count: apps.length,
            items: apps,
        },
        databases: {
            count: databases.length,
            items: databases,
        },
        buckets: {
            count: buckets.length,
            items: buckets,
        },
        timestamp: new Date().toISOString(),
    };

    return {
        content: [{ type: 'text', text: JSON.stringify(overview, null, 2) }],
    };
}

/**
 * Handle deployment management operations
 */
async function handleDeploymentManagement(client: LiaraClient, args: any): Promise<ToolResult> {
    const { action, appName, lines } = args;

    if (!appName) throw new Error('appName is required for all deployment actions');

    switch (action) {
        case 'list_releases':
            const releases = await deploymentService.listReleases(client, appName, { page: 1, perPage: lines || 10 });
            return {
                content: [{ type: 'text', text: JSON.stringify(releases, null, 2) }],
            };

        case 'list_sources':
            const sources = await deploymentService.listSources(client, appName);
            return {
                content: [{ type: 'text', text: JSON.stringify(sources, null, 2) }],
            };

        case 'upload_source':
            // This would require file path parameter - simplified for now
            throw new Error('upload_source requires file path parameter (not implemented in consolidated tool)');

        default:
            throw new Error(`Unknown deployment action: ${action}`);
    }
}
