import { LiaraClient } from '../api/client.js';
import {
    Database,
    CreateDatabaseRequest,
    DatabaseBackup,
    DatabaseType,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateRequired } from '../utils/errors.js';

/**
 * List all databases
 */
export async function listDatabases(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<Database[]> {
    const params = paginationToParams(pagination);
    return await client.get<Database[]>('/v1/databases', params);
}

/**
 * Get details of a specific database
 */
export async function getDatabase(
    client: LiaraClient,
    name: string
): Promise<Database> {
    validateRequired(name, 'Database name');
    return await client.get<Database>(`/v1/databases/${name}`);
}

/**
 * Create a new database
 */
export async function createDatabase(
    client: LiaraClient,
    request: CreateDatabaseRequest
): Promise<Database> {
    validateRequired(request.name, 'Database name');
    validateRequired(request.type, 'Database type');
    validateRequired(request.planID, 'Plan ID');

    return await client.post<Database>('/v1/databases', request);
}

/**
 * Delete a database
 */
export async function deleteDatabase(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateRequired(name, 'Database name');
    await client.delete(`/v1/databases/${name}`);
}

/**
 * Start a database
 */
export async function startDatabase(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateRequired(name, 'Database name');
    await client.post(`/v1/databases/${name}/actions/start`);
}

/**
 * Stop a database
 */
export async function stopDatabase(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateRequired(name, 'Database name');
    await client.post(`/v1/databases/${name}/actions/stop`);
}

/**
 * Resize a database (change plan)
 */
export async function resizeDatabase(
    client: LiaraClient,
    name: string,
    planID: string
): Promise<void> {
    validateRequired(name, 'Database name');
    validateRequired(planID, 'Plan ID');
    await client.post(`/v1/databases/${name}/resize`, { planID });
}

/**
 * Create a database backup
 */
export async function createBackup(
    client: LiaraClient,
    databaseName: string
): Promise<DatabaseBackup> {
    validateRequired(databaseName, 'Database name');
    return await client.post<DatabaseBackup>(`/v1/databases/${databaseName}/backups`);
}

/**
 * List database backups
 */
export async function listBackups(
    client: LiaraClient,
    databaseName: string,
    pagination?: PaginationOptions
): Promise<DatabaseBackup[]> {
    validateRequired(databaseName, 'Database name');
    const params = paginationToParams(pagination);
    return await client.get<DatabaseBackup[]>(`/v1/databases/${databaseName}/backups`, params);
}

/**
 * Get download URL for a database backup
 */
export async function getBackupDownloadUrl(
    client: LiaraClient,
    databaseName: string,
    backupId: string
): Promise<{ url: string }> {
    validateRequired(databaseName, 'Database name');
    validateRequired(backupId, 'Backup ID');
    return await client.get<{ url: string }>(
        `/v1/databases/${databaseName}/backups/${backupId}/download`
    );
}

/**
 * Get database connection information (host, port, credentials)
 */
export async function getDatabaseConnection(
    client: LiaraClient,
    databaseName: string
): Promise<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    connectionString?: string;
}> {
    validateRequired(databaseName, 'Database name');
    return await client.get<{
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        connectionString?: string;
    }>(`/v1/databases/${databaseName}/connection`);
}

/**
 * Restart a database
 */
export async function restartDatabase(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateRequired(name, 'Database name');
    await client.post(`/v1/databases/${name}/actions/restart`);
}

/**
 * Restore a database from a backup
 */
export async function restoreBackup(
    client: LiaraClient,
    databaseName: string,
    backupId: string
): Promise<{ message: string }> {
    validateRequired(databaseName, 'Database name');
    validateRequired(backupId, 'Backup ID');
    return await client.post<{ message: string }>(
        `/v1/databases/${databaseName}/backups/${backupId}/restore`
    );
}

/**
 * Delete a database backup
 */
export async function deleteBackup(
    client: LiaraClient,
    databaseName: string,
    backupId: string
): Promise<void> {
    validateRequired(databaseName, 'Database name');
    validateRequired(backupId, 'Backup ID');
    await client.delete(`/v1/databases/${databaseName}/backups/${backupId}`);
}

/**
 * Get available database types
 */
export function getAvailableDatabaseTypes(): DatabaseType[] {
    return [
        'mariadb',
        'mysql',
        'postgres',
        'mssql',
        'mongodb',
        'redis',
        'elasticsearch',
        'rabbitmq',
    ];
}
