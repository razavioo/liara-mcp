import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as appService from '../../services/apps.js';
import { Project, CreateProjectRequest } from '../../api/types.js';

describe('Apps Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('listApps', () => {
        it('should list all apps', async () => {
            const mockApps: Project[] = [
                {
                    _id: '1',
                    name: 'app1',
                    platform: 'node',
                    planID: 'plan1',
                    status: 'RUNNING',
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockApps);

            const result = await appService.listApps(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects', {});
            expect(result).toEqual(mockApps);
        });

        it('should support pagination', async () => {
            const mockApps: Project[] = [];
            (mockClient.get as any).mockResolvedValue(mockApps);

            await appService.listApps(mockClient, { page: 1, perPage: 20 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects', {
                page: 1,
                perPage: 20,
            });
        });
    });

    describe('getApp', () => {
        it('should get app details', async () => {
            const mockApp = {
                _id: '1',
                name: 'my-app',
                platform: 'node',
                planID: 'plan1',
                status: 'RUNNING',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
            };
            (mockClient.get as any).mockResolvedValue(mockApp);

            const result = await appService.getApp(mockClient, 'my-app');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects/my-app');
            expect(result).toEqual(mockApp);
        });
    });

    describe('createApp', () => {
        it('should create a new app', async () => {
            const request: CreateProjectRequest = {
                name: 'my-app',
                platform: 'node',
                planID: 'plan1',
            };
            const mockApp: Project = {
                _id: '1',
                ...request,
                status: 'CREATING',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockApp);

            const result = await appService.createApp(mockClient, request);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects', request);
            expect(result).toEqual(mockApp);
        });
    });

    describe('deleteApp', () => {
        it('should delete an app', async () => {
            (mockClient.delete as any).mockResolvedValue(undefined);

            await appService.deleteApp(mockClient, 'my-app');

            expect(mockClient.delete).toHaveBeenCalledWith('/v1/projects/my-app');
        });
    });

    describe('startApp', () => {
        it('should start an app', async () => {
            (mockClient.post as any).mockResolvedValue(undefined);

            await appService.startApp(mockClient, 'my-app');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/actions/scale', {
                scale: 1,
            });
        });
    });

    describe('stopApp', () => {
        it('should stop an app', async () => {
            (mockClient.post as any).mockResolvedValue(undefined);

            await appService.stopApp(mockClient, 'my-app');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/actions/scale', {
                scale: 0,
            });
        });
    });

    describe('restartApp', () => {
        it('should restart an app', async () => {
            (mockClient.post as any).mockResolvedValue(undefined);

            await appService.restartApp(mockClient, 'my-app');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/actions/restart');
        });
    });

    describe('resizeApp', () => {
        it('should resize an app', async () => {
            (mockClient.post as any).mockResolvedValue(undefined);

            await appService.resizeApp(mockClient, 'my-app', 'plan2');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/resize', {
                planID: 'plan2',
            });
        });
    });

    describe('getAvailablePlatforms', () => {
        it('should return all available platforms', () => {
            const platforms = appService.getAvailablePlatforms();
            expect(platforms).toContain('node');
            expect(platforms).toContain('nextjs');
            expect(platforms).toContain('docker');
            expect(platforms.length).toBeGreaterThan(10);
        });
    });
});
