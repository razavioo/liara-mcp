import { LiaraClient } from '../api/client.js';
import {
    Database,
    CreateDatabaseRequest,
    DatabaseBackup,
    DatabaseType,
} from '../api/types.js';
import { validateRequired, unwrapApiResponse } from '../utils/errors.js';

/**
 * Resolve database name/hostname to ID
 * If the input looks like a MongoDB ObjectID (24 hex chars), use it directly.
 * Otherwise, try to find a database with matching hostname.
 */
async function resolveDatabaseId(client: LiaraClient, nameOrId: string): Promise<string> {
    // Check if it's already a MongoDB ObjectID (24 hex characters)
    if (/^[a-f0-9]{24}$/i.test(nameOrId)) {
        return nameOrId;
    }

    // Otherwise, search for database by hostname
    const databases = await listDatabases(client);
    const db = databases.find(d => d.hostname === nameOrId || d.id === nameOrId || d._id === nameOrId);

    if (!db) {
        const { LiaraMcpError } = await import('../utils/errors.js');
        throw new LiaraMcpError(
            `Database not found: ${nameOrId}`,
            'DATABASE_NOT_FOUND',
            { nameOrId },
            [
                'Use liara_list_databases to see available databases',
                'Provide either the database hostname or ID',
                'Database names are case-sensitive'
            ]
        );
    }

    return db.id || db._id;
}

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
    const dbId = await resolveDatabaseId(client, name);
    return await client.get<Database>(`/v1/databases/${dbId}`);
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
    const dbId = await resolveDatabaseId(client, name);
    await client.delete(`/v1/databases/${dbId}`);
}

/**
 * Start a database
 */
export async function startDatabase(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateRequired(name, 'Database name');
    const dbId = await resolveDatabaseId(client, name);
    await client.post(`/v1/databases/${dbId}/actions/start`);
}

/**
 * Stop a database
 */
export async function stopDatabase(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateRequired(name, 'Database name');
    const dbId = await resolveDatabaseId(client, name);
    await client.post(`/v1/databases/${dbId}/actions/stop`);
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
    const dbId = await resolveDatabaseId(client, name);
    await client.post(`/v1/databases/${dbId}/resize`, { planID });
}

/**
 * Create a database backup
 */
export async function createBackup(
    client: LiaraClient,
    databaseName: string
): Promise<DatabaseBackup> {
    validateRequired(databaseName, 'Database name');
    const dbId = await resolveDatabaseId(client, databaseName);
    return await client.post<DatabaseBackup>(`/v1/databases/${dbId}/backups`);
}

/**
 * List database backups
 */
export async function listBackups(
    client: LiaraClient,
    databaseName: string
): Promise<DatabaseBackup[]> {
    validateRequired(databaseName, 'Database name');
    const dbId = await resolveDatabaseId(client, databaseName);
    const response = await client.get<any>(`/v1/databases/${dbId}/backups`);
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
    const dbId = await resolveDatabaseId(client, databaseName);
    return await client.get<{ url: string }>(
        `/v1/databases/${dbId}/backups/${backupId}/download`
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
    passwordAvailable: boolean; // Indicates if password was successfully retrieved
    warnings?: string[]; // Any warnings about missing or incomplete info
}

/**
 * Database details structure from Liara API
 */
interface DatabaseDetails {
    hostname?: string;
    host?: string;
    internalHostname?: string;
    port?: number;
    username?: string;
    user?: string;
    password?: string;
    rootPassword?: string;
    root_password?: string;
    database?: string;
    name?: string;
    type?: string;
    connectionString?: string;
    connection?: {
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        database?: string;
    };
}

/**
 * Get database connection information (host, port, credentials)
 * Tries multiple API endpoints and response structures to get complete connection info
 */
export async function getDatabaseConnection(
    client: LiaraClient,
    databaseName: string
): Promise<DatabaseConnectionInfo> {
    validateRequired(databaseName, 'Database name');

    // Resolve database name to ID first
    const dbId = await resolveDatabaseId(client, databaseName);

    const warnings: string[] = [];
    let dbDetails: DatabaseDetails;

    // Try primary endpoint: /v1/databases/{id}
    try {
        const response = await client.get<{ database: DatabaseDetails } | DatabaseDetails>(`/v1/databases/${dbId}`);
        // Handle both wrapped and unwrapped responses
        dbDetails = (response as any).database || response;
    } catch (error: any) {
        const { LiaraMcpError } = await import('../utils/errors.js');
        throw new LiaraMcpError(
            `Failed to fetch database details: ${error.message}`,
            'DATABASE_FETCH_ERROR',
            { databaseName, error: error.message },
            [
                'Verify the database name is correct',
                'Check if the database exists',
                'Ensure you have permission to access this database'
            ]
        );
    }

    // Try alternative endpoint for connection info if primary doesn't have password
    let connectionInfo: DatabaseDetails | null = null;
    if (!dbDetails.password && !dbDetails.root_password && !dbDetails.rootPassword && !dbDetails.connectionString) {
        try {
            // Some APIs have a separate connection endpoint
            const connResponse = await client.get<{ database: DatabaseDetails } | DatabaseDetails>(
                `/v1/databases/${dbId}/connection`
            );
            connectionInfo = (connResponse as any).database || connResponse;
        } catch (error: any) {
            // This endpoint might not exist, that's okay
            warnings.push('Connection-specific endpoint not available, using database details');
        }
    }

    // Merge connection info if available
    if (connectionInfo) {
        dbDetails = {
            ...dbDetails,
            ...connectionInfo,
            connection: connectionInfo.connection || dbDetails.connection,
        };
    }

    // Extract connection info from nested connection object if present
    if (dbDetails.connection) {
        dbDetails = {
            ...dbDetails,
            hostname: dbDetails.connection.host || dbDetails.hostname,
            port: dbDetails.connection.port || dbDetails.port,
            username: dbDetails.connection.username || dbDetails.username,
            password: dbDetails.connection.password || dbDetails.password,
            database: dbDetails.connection.database || dbDetails.database,
        };
    }

    // Validate we have minimum required fields
    const host = dbDetails.hostname || dbDetails.host || dbDetails.internalHostname;
    if (!host) {
        const { LiaraMcpError } = await import('../utils/errors.js');
        throw new LiaraMcpError(
            'Database connection info missing host',
            'INCOMPLETE_CONNECTION_INFO',
            { databaseName, dbDetails },
            [
                'Verify the database exists and is accessible',
                'Check if the database is running',
                'Use liara_get_database to check database status',
                'The database may need to be started first'
            ]
        );
    }

    // Extract password with better fallback logic
    const password = dbDetails.password ||
                    dbDetails.root_password ||
                    dbDetails.rootPassword ||
                    dbDetails.connection?.password ||
                    '';

    const passwordAvailable = !!password;

    if (!passwordAvailable) {
        warnings.push(
            'Password not returned by API. You may need to:',
            '1. Check the dashboard connection tab for the password',
            '2. Reset the password using liara_reset_database_password',
            '3. Use the password that was shown when the database was created'
        );
    }

    // Extract username with better defaults based on database type
    let username = dbDetails.username ||
                  dbDetails.user ||
                  dbDetails.connection?.username;

    // Set default username based on database type if not provided
    const dbType = dbDetails.type || 'unknown';
    if (!username) {
        switch (dbType) {
            case 'postgres':
                username = 'postgres';
                break;
            case 'redis':
                username = 'default';
                break;
            default:
                username = 'root';
        }
        warnings.push(`Username not provided, using default: ${username}`);
    }

    // Build connection info
    const connectionInfoResult: DatabaseConnectionInfo = {
        host,
        port: dbDetails.port || getDefaultPort(dbType),
        username,
        password,
        database: dbDetails.database || dbDetails.name || databaseName,
        connectionString: dbDetails.connectionString || buildConnectionString({
            ...dbDetails,
            type: dbType,
            username,
            password,
        }),
        passwordAvailable,
        warnings: warnings.length > 0 ? warnings : undefined,
    };

    return connectionInfoResult;
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
function buildConnectionString(db: DatabaseDetails & { username?: string; password?: string; type: string }): string | undefined {
    if (!db.hostname && !db.host && !db.internalHostname) return undefined;

    const host = db.hostname || db.host || db.internalHostname;
    const port = db.port || getDefaultPort(db.type);
    const user = db.username || db.user || 'root';
    const pass = db.password || db.rootPassword || '';
    const dbName = db.database || db.name;
    
    // URL encode password to handle special characters
    const encodedPass = pass ? encodeURIComponent(pass) : '';
    const encodedUser = user ? encodeURIComponent(user) : '';
    
    switch (db.type) {
        case 'postgres':
            if (!dbName) return undefined;
            return encodedPass 
                ? `postgresql://${encodedUser}:${encodedPass}@${host}:${port}/${dbName}`
                : `postgresql://${encodedUser}@${host}:${port}/${dbName}`;
        case 'mysql':
        case 'mariadb':
            if (!dbName) return undefined;
            return encodedPass 
                ? `mysql://${encodedUser}:${encodedPass}@${host}:${port}/${dbName}`
                : `mysql://${encodedUser}@${host}:${port}/${dbName}`;
        case 'mongodb':
            if (!dbName) return undefined;
            return encodedPass 
                ? `mongodb://${encodedUser}:${encodedPass}@${host}:${port}/${dbName}`
                : `mongodb://${encodedUser}@${host}:${port}/${dbName}`;
        case 'redis':
            // Redis connection strings don't include database name in URL
            return encodedPass 
                ? `redis://:${encodedPass}@${host}:${port}`
                : `redis://${host}:${port}`;
        case 'mssql':
            if (!dbName) return undefined;
            return encodedPass 
                ? `mssql://${encodedUser}:${encodedPass}@${host}:${port}/${dbName}`
                : `mssql://${encodedUser}@${host}:${port}/${dbName}`;
        case 'elasticsearch':
            return encodedPass 
                ? `https://${encodedUser}:${encodedPass}@${host}:${port}`
                : `http://${host}:${port}`;
        case 'rabbitmq':
            return encodedPass 
                ? `amqp://${encodedUser}:${encodedPass}@${host}:${port}`
                : `amqp://${encodedUser}@${host}:${port}`;
        default:
            return undefined;
    }
}

/**
 * Reset/update database password
 * Note: This may not be available for all database types or may require specific permissions
 */
export async function resetDatabasePassword(
    client: LiaraClient,
    databaseName: string,
    newPassword?: string
): Promise<{ message: string; password?: string }> {
    validateRequired(databaseName, 'Database name');
    const dbId = await resolveDatabaseId(client, databaseName);

    try {
        // Try password reset endpoint
        const response = await client.post<{ message: string; password?: string }>(
            `/v1/databases/${dbId}/reset-password`,
            newPassword ? { password: newPassword } : {}
        );
        return response;
    } catch (error: any) {
        // Try alternative endpoint format
        try {
            const response = await client.post<{ message: string; password?: string }>(
                `/v1/databases/${dbId}/actions/reset-password`,
                newPassword ? { password: newPassword } : {}
            );
            return response;
        } catch (altError: any) {
            const { LiaraMcpError } = await import('../utils/errors.js');
            throw new LiaraMcpError(
                `Failed to reset database password: ${altError.message || error.message}`,
                'PASSWORD_RESET_ERROR',
                { databaseName, error: altError.message || error.message },
                [
                    'Verify the database exists and is running',
                    'Check if password reset is supported for this database type',
                    'Ensure you have permission to reset database passwords',
                    'Some database types may not support password reset via API',
                    'Try resetting the password from the Liara dashboard'
                ]
            );
        }
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
    const dbId = await resolveDatabaseId(client, name);
    await client.post(`/v1/databases/${dbId}/actions/restart`);
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
    const dbId = await resolveDatabaseId(client, databaseName);
    return await client.post<{ message: string }>(
        `/v1/databases/${dbId}/backups/${backupId}/restore`
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
    const dbId = await resolveDatabaseId(client, databaseName);
    await client.delete(`/v1/databases/${dbId}/backups/${backupId}`);
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

/**
 * Update database settings (like version, plan, etc.)
 */
export async function updateDatabase(
    client: LiaraClient,
    databaseName: string,
    updates: {
        planID?: string;
        version?: string;
    }
): Promise<Database> {
    validateRequired(databaseName, 'Database name');

    if (!updates.planID && !updates.version) {
        const { LiaraMcpError } = await import('../utils/errors.js');
        throw new LiaraMcpError(
            'At least one update field (planID or version) is required',
            'INVALID_UPDATE_REQUEST',
            { databaseName, updates }
        );
    }

    const dbId = await resolveDatabaseId(client, databaseName);
    return await client.put<Database>(`/v1/databases/${dbId}`, updates);
}
