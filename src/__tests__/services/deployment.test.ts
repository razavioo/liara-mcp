import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as deployService from '../../services/deployment.js';
import { DeployReleaseRequest } from '../../api/types.js';

describe('Deployment Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
            postFormData: vi.fn(),
        } as any;
    });

    describe('uploadSource', () => {
        it('should upload source file', async () => {
            const mockResponse = { sourceID: 'src-123' };
            (mockClient.postFormData as any).mockResolvedValue(mockResponse);

            const result = await deployService.uploadSource(
                mockClient,
                'my-app',
                '/path/to/source.tar.gz'
            );

            expect(mockClient.postFormData).toHaveBeenCalled();
            expect(result.sourceID).toBe('src-123');
        });
    });

    describe('deployRelease', () => {
        it('should deploy a release', async () => {
            const request: DeployReleaseRequest = {
                sourceID: 'src-123',
            };
            const mockResponse = { releaseID: 'rel-123' };
            (mockClient.post as any).mockResolvedValue(mockResponse);

            const result = await deployService.deployRelease(mockClient, 'my-app', request);

            expect(mockClient.post).toHaveBeenCalledWith(
                '/v2/projects/my-app/releases',
                request
            );
            expect(result.releaseID).toBe('rel-123');
        });
    });

    describe('listReleases', () => {
        it('should list releases with pagination', async () => {
            const mockReleases = [
                {
                    _id: '1',
                    releaseID: 'rel-1',
                    sourceID: 'src-1',
                    status: 'SUCCESS',
                    createdAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockReleases);

            const result = await deployService.listReleases(mockClient, 'my-app', {
                page: 1,
                perPage: 10,
            });

            expect(mockClient.get).toHaveBeenCalledWith('/v2/projects/my-app/releases', {
                page: 1,
                perPage: 10,
            });
            expect(result).toEqual(mockReleases);
        });
    });

    describe('listSources', () => {
        it('should list sources with pagination', async () => {
            const mockSources = [
                {
                    _id: '1',
                    sourceID: 'src-1',
                    status: 'READY',
                    createdAt: '2024-01-01',
                    size: 1024,
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockSources);

            const result = await deployService.listSources(mockClient, 'my-app', {
                limit: 20,
            });

            expect(mockClient.get).toHaveBeenCalledWith('/v2/projects/my-app/sources', {
                limit: 20,
            });
            expect(result).toEqual(mockSources);
        });
    });

    describe('deleteSource', () => {
        it('should delete a source', async () => {
            (mockClient.delete as any).mockResolvedValue(undefined);

            await deployService.deleteSource(mockClient, 'my-app', 'src-123');

            expect(mockClient.delete).toHaveBeenCalledWith('/v2/projects/my-app/sources/src-123');
        });
    });

    describe('rollbackRelease', () => {
        it('should rollback to a release', async () => {
            (mockClient.post as any).mockResolvedValue({ message: 'Rollback started' });

            const result = await deployService.rollbackRelease(mockClient, 'my-app', 'rel-123');

            expect(mockClient.post).toHaveBeenCalledWith(
                '/v2/projects/my-app/releases/rel-123/rollback'
            );
            expect(result.message).toBe('Rollback started');
        });
    });
});
