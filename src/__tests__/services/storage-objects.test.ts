import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as storageService from '../../services/storage.js';

describe('Storage Object Operations', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
            postFormData: vi.fn(),
        } as any;
    });

    describe('listObjects', () => {
        it('should list objects without filters', async () => {
            const mockObjects = [
                { key: 'file1.txt', size: 1024, lastModified: '2024-01-01' },
            ];
            (mockClient.get as any).mockResolvedValue(mockObjects);

            const result = await storageService.listObjects(mockClient, 'my-bucket');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/buckets/my-bucket/objects', {});
            expect(result).toEqual(mockObjects);
        });

        it('should list objects with prefix filter', async () => {
            const mockObjects = [
                { key: 'folder/file1.txt', size: 1024, lastModified: '2024-01-01' },
            ];
            (mockClient.get as any).mockResolvedValue(mockObjects);

            const result = await storageService.listObjects(
                mockClient,
                'my-bucket',
                'folder/'
            );

            expect(mockClient.get).toHaveBeenCalledWith('/v1/buckets/my-bucket/objects', {
                prefix: 'folder/',
            });
            expect(result).toEqual(mockObjects);
        });

        it('should list objects with maxKeys limit', async () => {
            (mockClient.get as any).mockResolvedValue([]);

            await storageService.listObjects(mockClient, 'my-bucket', undefined, 50);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/buckets/my-bucket/objects', {
                maxKeys: 50,
            });
        });
    });

    describe('uploadObject', () => {
        it('should upload object with correct key', async () => {
            (mockClient.postFormData as any).mockResolvedValue({
                message: 'Uploaded',
                etag: 'abc123',
            });

            const result = await storageService.uploadObject(
                mockClient,
                'my-bucket',
                'path/to/file.txt',
                '/local/path/file.txt'
            );

            expect(mockClient.postFormData).toHaveBeenCalled();
            expect(result.message).toBe('Uploaded');
        });
    });

    describe('getObjectDownloadUrl', () => {
        it('should get download URL without expiration', async () => {
            (mockClient.get as any).mockResolvedValue({
                url: 'https://example.com/file.txt',
            });

            const result = await storageService.getObjectDownloadUrl(
                mockClient,
                'my-bucket',
                'file.txt'
            );

            expect(mockClient.get).toHaveBeenCalledWith(
                '/v1/buckets/my-bucket/objects/file.txt/download',
                {}
            );
            expect(result.url).toBe('https://example.com/file.txt');
        });

        it('should get download URL with expiration', async () => {
            (mockClient.get as any).mockResolvedValue({
                url: 'https://example.com/file.txt',
                expiresAt: '2024-12-31T23:59:59Z',
            });

            const result = await storageService.getObjectDownloadUrl(
                mockClient,
                'my-bucket',
                'file.txt',
                3600
            );

            expect(mockClient.get).toHaveBeenCalledWith(
                '/v1/buckets/my-bucket/objects/file.txt/download',
                { expiresIn: 3600 }
            );
            expect(result.expiresAt).toBeDefined();
        });
    });
});
