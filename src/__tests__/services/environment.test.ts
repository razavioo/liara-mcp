import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as envService from '../../services/environment.js';
import { EnvironmentVariable } from '../../api/types.js';

describe('Environment Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
        } as any;
    });

    describe('setEnvVar', () => {
        it('should set a single environment variable', async () => {
            (mockClient.post as any).mockResolvedValue({ message: 'Updated' });

            const result = await envService.setEnvVar(mockClient, 'my-app', 'API_KEY', 'secret123');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/update-envs', {
                project: 'my-app',
                variables: [{ key: 'API_KEY', value: 'secret123' }],
            });
            expect(result.message).toBe('Updated');
        });
    });

    describe('updateEnvVars', () => {
        it('should update multiple environment variables', async () => {
            const vars: EnvironmentVariable[] = [
                { key: 'API_KEY', value: 'secret1' },
                { key: 'DATABASE_URL', value: 'postgres://...' },
            ];
            (mockClient.post as any).mockResolvedValue({ message: 'Updated' });

            const result = await envService.updateEnvVars(mockClient, 'my-app', vars);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/update-envs', {
                project: 'my-app',
                variables: vars,
            });
            expect(result.message).toBe('Updated');
        });
    });

    describe('getEnvVars', () => {
        it('should get all environment variables', async () => {
            const mockProject = {
                envVars: [
                    { key: 'API_KEY', value: 'secret1' },
                    { key: 'DATABASE_URL', value: 'postgres://...' },
                ],
            };
            (mockClient.get as any).mockResolvedValue(mockProject);

            const result = await envService.getEnvVars(mockClient, 'my-app');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects/my-app');
            expect(result).toEqual(mockProject.envVars);
        });
    });

    describe('deleteEnvVar', () => {
        it('should delete a single environment variable', async () => {
            const mockProject = {
                envVars: [
                    { key: 'API_KEY', value: 'secret1' },
                    { key: 'DATABASE_URL', value: 'postgres://...' },
                ],
            };
            (mockClient.get as any).mockResolvedValue(mockProject);
            (mockClient.post as any).mockResolvedValue({ message: 'Updated' });

            const result = await envService.deleteEnvVar(mockClient, 'my-app', 'API_KEY');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/update-envs', {
                project: 'my-app',
                variables: [{ key: 'DATABASE_URL', value: 'postgres://...' }],
            });
            expect(result.message).toBe('Updated');
        });
    });

    describe('deleteEnvVars', () => {
        it('should delete multiple environment variables', async () => {
            const mockProject = {
                envVars: [
                    { key: 'API_KEY', value: 'secret1' },
                    { key: 'DATABASE_URL', value: 'postgres://...' },
                    { key: 'NODE_ENV', value: 'production' },
                ],
            };
            (mockClient.get as any).mockResolvedValue(mockProject);
            (mockClient.post as any).mockResolvedValue({ message: 'Updated' });

            const result = await envService.deleteEnvVars(mockClient, 'my-app', [
                'API_KEY',
                'DATABASE_URL',
            ]);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/update-envs', {
                project: 'my-app',
                variables: [{ key: 'NODE_ENV', value: 'production' }],
            });
            expect(result.message).toBe('Updated');
        });
    });
});

