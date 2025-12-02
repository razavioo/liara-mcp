import { LiaraClient } from '../api/client.js';
import {
    Database,
    CreateDatabaseRequest,
    DatabaseBackup,
    DatabaseType,
} from '../api/types.js';
import { validateRequired, unwrapApiResponse } from '../utils/errors.js';

/**
 * List all databases
 */
export async function listDatabases(client: LiaraClient): Promise<Database[]> {
    const response = await client.get<any>('/v1/databases');
    return unwrapApiResponse<Database[]>(response, ['databases', 'data', 'items']);
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
    databaseName: string
): Promise<DatabaseBackup[]> {
    validateRequired(databaseName, 'Database name');
    const response = await client.get<any>(`/v1/databases/${databaseName}/backups`);
    return unwrapApiResponse<DatabaseBackup[]>(response, ['backups', 'data', 'items']);
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
 * Database connection info returned by the API
 */
export interface DatabaseConnectionInfo {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    connectionString?: string;
}

/**
 * Get database connection information (host, port, credentials)
 * The Liara API includes connection info directly in the database details response
 */
export async function getDatabaseConnection(
    client: LiaraClient,
    databaseName: string
): Promise<DatabaseConnectionInfo> {
    validateRequired(databaseName, 'Database name');
    
    // Fetch database details which includes connection info
    const dbDetails = await client.get<any>(`/v1/databases/${databaseName}`);
    
    // Extract connection info from the database details
    // The API structure may include these in different fields based on database type
    const connectionInfo: DatabaseConnectionInfo = {
        host: dbDetails.hostname || dbDetails.host || dbDetails.internalHostname || '',
        port: dbDetails.port || getDefaultPort(dbDetails.type),
        username: dbDetails.username || dbDetails.user || 'root',
        password: dbDetails.password || dbDetails.rootPassword || '',
        database: dbDetails.database || dbDetails.name || databaseName,
        connectionString: buildConnectionString(dbDetails),
    };
    
    return connectionInfo;
}

/**
 * Get default port for database type
 */
function getDefaultPort(dbType: string): number {
    const ports: Record<string, number> = {
        postgres: 5432,
        mysql: 3306,
        mariadb: 3306,
        mongodb: 27017,
        redis: 6379,
        elasticsearch: 9200,
        mssql: 1433,
        rabbitmq: 5672,
    };
    return ports[dbType] || 0;
}

/**
 * Build connection string based on database type
 */
function buildConnectionString(db: any): string | undefined {
    if (!db.hostname && !db.host) return undefined;
    
    const host = db.hostname || db.host || db.internalHostname;
    const port = db.port || getDefaultPort(db.type);
    const user = db.username || db.user || 'root';
    const pass = db.password || db.rootPassword || '';
    const dbName = db.database || db.name;
    
    switch (db.type) {
        case 'postgres':
            return `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;
        case 'mysql':
        case 'mariadb':
            return `mysql://${user}:${pass}@${host}:${port}/${dbName}`;
        case 'mongodb':
            return `mongodb://${user}:${pass}@${host}:${port}/${dbName}`;
        case 'redis':
            return pass ? `redis://:${pass}@${host}:${port}` : `redis://${host}:${port}`;
        default:
            return undefined;
    }
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
