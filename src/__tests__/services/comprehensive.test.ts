import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as appService from '../../services/apps.js';
import * as dbService from '../../services/databases.js';
import * as storageService from '../../services/storage.js';

describe('Comprehensive Service Tests', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
            put: vi.fn(),
        } as any;
    });

    describe('Cross-service operations', () => {
        it('should handle app creation with database', async () => {
            const mockApp = {
                _id: '1',
                name: 'my-app',
                platform: 'node',
                planID: 'plan1',
                status: 'CREATING',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
            };
            const mockDb = {
                _id: '1',
                name: 'my-db',
                type: 'postgres',
                planID: 'plan1',
                status: 'CREATING',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
            };

            (mockClient.post as any)
                .mockResolvedValueOnce(mockApp)
                .mockResolvedValueOnce(mockDb);

            const app = await appService.createApp(mockClient, {
                name: 'my-app',
                platform: 'node',
                planID: 'plan1',
            });

            const db = await dbService.createDatabase(mockClient, {
                name: 'my-db',
                type: 'postgres',
                planID: 'plan1',
            });

            expect(app.name).toBe('my-app');
            expect(db.name).toBe('my-db');
        });
    });

    describe('Resource lifecycle', () => {
        it('should handle complete app lifecycle', async () => {
            (mockClient.post as any).mockResolvedValue({});
            (mockClient.delete as any).mockResolvedValue(undefined);

            // Create
            await appService.createApp(mockClient, {
                name: 'test-app',
                platform: 'node',
                planID: 'plan1',
            });

            // Start
            await appService.startApp(mockClient, 'test-app');

            // Stop
            await appService.stopApp(mockClient, 'test-app');

            // Delete
            await appService.deleteApp(mockClient, 'test-app');

            expect(mockClient.post).toHaveBeenCalledTimes(3);
            expect(mockClient.delete).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error scenarios', () => {
        it('should handle missing resources gracefully', async () => {
            (mockClient.get as any).mockRejectedValue(
                new Error('Resource not found')
            );

            await expect(
                appService.getApp(mockClient, 'nonexistent')
            ).rejects.toThrow();
        });
    });
});
