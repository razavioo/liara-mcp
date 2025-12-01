import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as storageService from '../../services/storage.js';
import { Bucket, CreateBucketRequest } from '../../api/types.js';

describe('Storage Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
            postFormData: vi.fn(),
        } as any;
    });

    describe('listBuckets', () => {
        it('should list buckets with pagination', async () => {
            const mockBuckets: Bucket[] = [
                {
                    _id: '1',
                    name: 'bucket1',
                    region: 'ir1',
                    createdAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockBuckets);

            const result = await storageService.listBuckets(mockClient, { page: 1, perPage: 10 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/buckets', {
                page: 1,
                perPage: 10,
            });
            expect(result).toEqual(mockBuckets);
        });
    });

    describe('createBucket', () => {
        it('should create a bucket', async () => {
            const request: CreateBucketRequest = {
                name: 'my-bucket',
                region: 'ir1',
                permission: 'private',
            };
            const mockBucket: Bucket = {
                _id: '1',
                name: 'my-bucket',
                region: 'ir1',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockBucket);

            const result = await storageService.createBucket(mockClient, request);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/buckets', request);
            expect(result).toEqual(mockBucket);
        });
    });

    describe('listObjects', () => {
        it('should list objects with prefix and maxKeys', async () => {
            const mockObjects = [
                {
                    key: 'folder/file1.txt',
                    size: 1024,
                    lastModified: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockObjects);

            const result = await storageService.listObjects(
                mockClient,
                'my-bucket',
                'folder/',
                100
            );

            expect(mockClient.get).toHaveBeenCalledWith('/v1/buckets/my-bucket/objects', {
                prefix: 'folder/',
                maxKeys: 100,
            });
            expect(result).toEqual(mockObjects);
        });
    });

    describe('deleteObject', () => {
        it('should delete an object', async () => {
            (mockClient.delete as any).mockResolvedValue(undefined);

            await storageService.deleteObject(mockClient, 'my-bucket', 'path/to/file.txt');

            expect(mockClient.delete).toHaveBeenCalledWith(
                '/v1/buckets/my-bucket/objects/path%2Fto%2Ffile.txt'
            );
        });

        it('should URL encode object key', async () => {
            (mockClient.delete as any).mockResolvedValue(undefined);

            await storageService.deleteObject(mockClient, 'my-bucket', 'file with spaces.txt');

            expect(mockClient.delete).toHaveBeenCalledWith(
                '/v1/buckets/my-bucket/objects/file%20with%20spaces.txt'
            );
        });
    });

    describe('getObjectMetadata', () => {
        it('should get object metadata', async () => {
            const mockMetadata = {
                key: 'file.txt',
                size: 1024,
                lastModified: '2024-01-01',
                contentType: 'text/plain',
                etag: 'abc123',
            };
            (mockClient.get as any).mockResolvedValue(mockMetadata);

            const result = await storageService.getObjectMetadata(
                mockClient,
                'my-bucket',
                'file.txt'
            );

            expect(mockClient.get).toHaveBeenCalledWith(
                '/v1/buckets/my-bucket/objects/file.txt/metadata'
            );
            expect(result).toEqual(mockMetadata);
        });
    });
});
