import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as appService from '../../services/apps.js';

describe('Concurrent Operations', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('Parallel list operations', () => {
        it('should handle multiple simultaneous list requests', async () => {
            const mockApps = [{ _id: '1', name: 'app1', platform: 'node', planID: 'p1', status: 'RUNNING', createdAt: '2024-01-01', updatedAt: '2024-01-01' }];
            const mockDatabases = [{ _id: '1', name: 'db1', type: 'postgres', planID: 'p1', status: 'RUNNING', createdAt: '2024-01-01', updatedAt: '2024-01-01' }];

            (mockClient.get as any)
                .mockResolvedValueOnce(mockApps)
                .mockResolvedValueOnce(mockDatabases);

            const [apps, databases] = await Promise.all([
                appService.listApps(mockClient),
                require('../../services/databases.js').listDatabases(mockClient),
            ]);

            expect(apps).toEqual(mockApps);
            expect(databases).toEqual(mockDatabases);
            expect(mockClient.get).toHaveBeenCalledTimes(2);
        });
    });

    describe('Sequential operations', () => {
        it('should handle create then delete operations', async () => {
            const mockApp = {
                _id: '1',
                name: 'test-app',
                platform: 'node',
                planID: 'plan1',
                status: 'CREATING',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
            };

            (mockClient.post as any).mockResolvedValue(mockApp);
            (mockClient.delete as any).mockResolvedValue(undefined);

            const app = await appService.createApp(mockClient, {
                name: 'test-app',
                platform: 'node',
                planID: 'plan1',
            });

            await appService.deleteApp(mockClient, 'test-app');

            expect(mockClient.post).toHaveBeenCalled();
            expect(mockClient.delete).toHaveBeenCalled();
        });
    });
});
