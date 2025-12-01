import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as envService from '../../services/environment.js';

describe('Batch Operations Performance', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
        } as any;
    });

    describe('Environment Variables Batch Operations', () => {
        it('should handle setting multiple env vars in one call', async () => {
            const vars = [
                { key: 'VAR1', value: 'value1' },
                { key: 'VAR2', value: 'value2' },
                { key: 'VAR3', value: 'value3' },
            ];

            (mockClient.post as any).mockResolvedValue({ message: 'Updated' });

            const result = await envService.updateEnvVars(mockClient, 'my-app', vars);

            expect(mockClient.post).toHaveBeenCalledTimes(1);
            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/update-envs', {
                project: 'my-app',
                variables: vars,
            });
            expect(result.message).toBe('Updated');
        });

        it('should handle deleting multiple env vars efficiently', async () => {
            const mockProject = {
                envVars: [
                    { key: 'VAR1', value: 'value1' },
                    { key: 'VAR2', value: 'value2' },
                    { key: 'VAR3', value: 'value3' },
                    { key: 'KEEP_ME', value: 'keep' },
                ],
            };

            (mockClient.get as any).mockResolvedValue(mockProject);
            (mockClient.post as any).mockResolvedValue({ message: 'Updated' });

            const result = await envService.deleteEnvVars(mockClient, 'my-app', [
                'VAR1',
                'VAR2',
                'VAR3',
            ]);

            expect(mockClient.get).toHaveBeenCalledTimes(1);
            expect(mockClient.post).toHaveBeenCalledTimes(1);
            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/update-envs', {
                project: 'my-app',
                variables: [{ key: 'KEEP_ME', value: 'keep' }],
            });
        });
    });
});
