/**
 * Database tool handlers
 */
import * as dbService from '../services/databases.js';
import { LiaraClient, ToolResult, successResponse, jsonResponse } from './types.js';

export async function handleDatabaseTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_databases': {
            const databases = await dbService.listDatabases(client);
            return jsonResponse(databases);
        }

        case 'liara_get_database': {
            const database = await dbService.getDatabase(client, args!.name as string);
            return jsonResponse(database);
        }

        case 'liara_get_database_connection': {
            const connection = await dbService.getDatabaseConnection(
                client,
                args!.databaseName as string
            );
            return jsonResponse(connection);
        }

        case 'liara_update_database': {
            const database = await dbService.updateDatabase(
                client,
                args!.name as string,
                {
                    planID: args!.planID as string | undefined,
                    version: args!.version as string | undefined,
                }
            );
            return successResponse(`Database "${args!.name}" updated successfully.\n${JSON.stringify(database, null, 2)}`);
        }

        case 'liara_create_database': {
            const database = await dbService.createDatabase(client, args as any);
            return successResponse(`Database "${database.name}" created successfully.\n${JSON.stringify(database, null, 2)}`);
        }

        case 'liara_delete_database': {
            await dbService.deleteDatabase(client, args!.name as string);
            return successResponse(`Database "${args!.name}" deleted successfully.`);
        }

        case 'liara_start_database': {
            await dbService.startDatabase(client, args!.name as string);
            return successResponse(`Database "${args!.name}" started successfully.`);
        }

        case 'liara_stop_database': {
            await dbService.stopDatabase(client, args!.name as string);
            return successResponse(`Database "${args!.name}" stopped successfully.`);
        }

        case 'liara_resize_database': {
            await dbService.resizeDatabase(
                client,
                args!.name as string,
                args!.planID as string
            );
            return successResponse(`Database "${args!.name}" resized to plan "${args!.planID}" successfully.`);
        }

        case 'liara_create_backup': {
            const backup = await dbService.createBackup(client, args!.databaseName as string);
            return successResponse(`Backup created successfully.\n${JSON.stringify(backup, null, 2)}`);
        }

        case 'liara_list_backups': {
            const backups = await dbService.listBackups(
                client,
                args!.databaseName as string
            );
            return jsonResponse(backups);
        }

        case 'liara_get_backup_download_url': {
            const result = await dbService.getBackupDownloadUrl(
                client,
                args!.databaseName as string,
                args!.backupId as string
            );
            return jsonResponse(result);
        }

        case 'liara_restart_database': {
            await dbService.restartDatabase(client, args!.name as string);
            return successResponse(`Database "${args!.name}" restarted successfully.`);
        }

        case 'liara_restore_backup': {
            const result = await dbService.restoreBackup(
                client,
                args!.databaseName as string,
                args!.backupId as string
            );
            return successResponse(
                result.message || `Database "${args!.databaseName}" restored from backup "${args!.backupId}" successfully.`
            );
        }

        case 'liara_delete_backup': {
            await dbService.deleteBackup(
                client,
                args!.databaseName as string,
                args!.backupId as string
            );
            return successResponse(`Backup "${args!.backupId}" deleted successfully.`);
        }

        default:
            return null;
    }
}
