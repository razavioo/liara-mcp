import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as dbService from '../../services/databases.js';
import { Database, CreateDatabaseRequest, DatabaseBackup } from '../../api/types.js';

describe('Databases Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('listDatabases', () => {
        it('should list all databases', async () => {
            const mockDatabases: Database[] = [
                {
                    _id: '1',
                    name: 'db1',
                    type: 'postgres',
                    planID: 'plan1',
                    status: 'RUNNING',
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockDatabases);

            const result = await dbService.listDatabases(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases');
            expect(result).toEqual(mockDatabases);
        });
    });

    describe('createDatabase', () => {
        it('should create a database', async () => {
            const request: CreateDatabaseRequest = {
                name: 'my-db',
                type: 'postgres',
                planID: 'plan1',
            };
            const mockDb: Database = {
                _id: '1',
                ...request,
                status: 'CREATING',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockDb);

            const result = await dbService.createDatabase(mockClient, request);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/databases', request);
            expect(result).toEqual(mockDb);
        });
    });

    describe('listBackups', () => {
        it('should list backups', async () => {
            const mockBackups: DatabaseBackup[] = [
                {
                    _id: '1',
                    databaseID: 'db1',
                    name: 'backup1',
                    size: 1024,
                    createdAt: '2024-01-01',
                    status: 'READY',
                },
            ];

            // Mock listDatabases for resolveDatabaseId
            const mockDatabases = [{ _id: 'my-db-id', hostname: 'my-db' }];
            (mockClient.get as any)
                .mockResolvedValueOnce(mockDatabases) // for listDatabases call
                .mockResolvedValueOnce(mockBackups); // for listBackups call

            const result = await dbService.listBackups(mockClient, 'my-db');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases');
            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases/my-db-id/backups');
            expect(result).toEqual(mockBackups);
        });
    });

    describe('restartDatabase', () => {
        it('should restart a database', async () => {
            // Mock listDatabases for resolveDatabaseId
            const mockDatabases = [{ _id: 'my-db-id', hostname: 'my-db' }];
            (mockClient.get as any).mockResolvedValueOnce(mockDatabases);
            (mockClient.post as any).mockResolvedValue(undefined);

            await dbService.restartDatabase(mockClient, 'my-db');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases');
            expect(mockClient.post).toHaveBeenCalledWith('/v1/databases/my-db-id/actions/restart');
        });
    });

    describe('restoreBackup', () => {
        it('should restore database from backup', async () => {
            // Mock listDatabases for resolveDatabaseId
            const mockDatabases = [{ _id: 'my-db-id', hostname: 'my-db' }];
            (mockClient.get as any).mockResolvedValueOnce(mockDatabases);
            (mockClient.post as any).mockResolvedValue({ message: 'Restore started' });

            const result = await dbService.restoreBackup(mockClient, 'my-db', 'backup-123');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases');
            expect(mockClient.post).toHaveBeenCalledWith(
                '/v1/databases/my-db-id/backups/backup-123/restore'
            );
            expect(result.message).toBe('Restore started');
        });
    });

    describe('deleteBackup', () => {
        it('should delete a backup', async () => {
            // Mock listDatabases for resolveDatabaseId
            const mockDatabases = [{ _id: 'my-db-id', hostname: 'my-db' }];
            (mockClient.get as any).mockResolvedValueOnce(mockDatabases);
            (mockClient.delete as any).mockResolvedValue(undefined);

            await dbService.deleteBackup(mockClient, 'my-db', 'backup-123');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases');
            expect(mockClient.delete).toHaveBeenCalledWith(
                '/v1/databases/my-db-id/backups/backup-123'
            );
        });
    });

    describe('getAvailableDatabaseTypes', () => {
        it('should return all database types', () => {
            const types = dbService.getAvailableDatabaseTypes();
            expect(types).toContain('postgres');
            expect(types).toContain('mysql');
            expect(types).toContain('mongodb');
            expect(types).toContain('redis');
            expect(types.length).toBe(8);
        });
    });
});

