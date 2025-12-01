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

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases', {});
            expect(result).toEqual(mockDatabases);
        });

        it('should support pagination', async () => {
            (mockClient.get as any).mockResolvedValue([]);

            await dbService.listDatabases(mockClient, { page: 2, perPage: 10 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases', {
                page: 2,
                perPage: 10,
            });
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

    describe('restartDatabase', () => {
        it('should restart a database', async () => {
            (mockClient.post as any).mockResolvedValue(undefined);

            await dbService.restartDatabase(mockClient, 'my-db');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/databases/my-db/actions/restart');
        });
    });

    describe('restoreBackup', () => {
        it('should restore database from backup', async () => {
            (mockClient.post as any).mockResolvedValue({ message: 'Restore started' });

            const result = await dbService.restoreBackup(mockClient, 'my-db', 'backup-123');

            expect(mockClient.post).toHaveBeenCalledWith(
                '/v1/databases/my-db/backups/backup-123/restore'
            );
            expect(result.message).toBe('Restore started');
        });
    });

    describe('deleteBackup', () => {
        it('should delete a backup', async () => {
            (mockClient.delete as any).mockResolvedValue(undefined);

            await dbService.deleteBackup(mockClient, 'my-db', 'backup-123');

            expect(mockClient.delete).toHaveBeenCalledWith(
                '/v1/databases/my-db/backups/backup-123'
            );
        });
    });

    describe('listBackups', () => {
        it('should list backups with pagination', async () => {
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
            (mockClient.get as any).mockResolvedValue(mockBackups);

            const result = await dbService.listBackups(mockClient, 'my-db', {
                page: 1,
                perPage: 10,
            });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/databases/my-db/backups', {
                page: 1,
                perPage: 10,
            });
            expect(result).toEqual(mockBackups);
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
