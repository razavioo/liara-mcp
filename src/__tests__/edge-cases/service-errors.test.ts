import { describe, it, expect, vi } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as appService from '../../services/apps.js';

describe('Service Error Handling', () => {
    describe('App Service Errors', () => {
        it('should handle API errors when getting app', async () => {
            const mockClient = {
                get: vi.fn().mockRejectedValue(new Error('App not found')),
            } as any;

            await expect(appService.getApp(mockClient, 'nonexistent')).rejects.toThrow();
        });

        it('should validate app name before API call', async () => {
            const mockClient = {
                get: vi.fn(),
            } as any;

            await expect(appService.getApp(mockClient, '')).rejects.toThrow('App name is required');
            await expect(appService.getApp(mockClient, 'ab')).rejects.toThrow();
        });
    });

    describe('Database Service Errors', () => {
        it('should validate database name', async () => {
            const mockClient = {
                get: vi.fn(),
            } as any;

            await expect(
                appService.getApp(mockClient, undefined as any)
            ).rejects.toThrow();
        });
    });
});
