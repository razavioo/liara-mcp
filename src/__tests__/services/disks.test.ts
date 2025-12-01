import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as diskService from '../../services/disks.js';
import { Disk, CreateDiskRequest, FtpAccess } from '../../api/types.js';

describe('Disks Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('getDisk', () => {
        it('should get disk details', async () => {
            const mockDisk: Disk = {
                _id: '1',
                name: 'disk1',
                projectID: 'project1',
                size: 10,
                mountPath: '/data',
                createdAt: '2024-01-01',
            };
            (mockClient.get as any).mockResolvedValue(mockDisk);

            const result = await diskService.getDisk(mockClient, 'my-app', 'disk1');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects/my-app/disks/disk1');
            expect(result).toEqual(mockDisk);
        });
    });

    describe('listDisks', () => {
        it('should list disks with client-side pagination', async () => {
            const mockProject = {
                disks: [
                    { _id: '1', name: 'disk1', size: 10, mountPath: '/data', projectID: 'p1', createdAt: '2024-01-01' },
                    { _id: '2', name: 'disk2', size: 20, mountPath: '/data2', projectID: 'p1', createdAt: '2024-01-01' },
                    { _id: '3', name: 'disk3', size: 30, mountPath: '/data3', projectID: 'p1', createdAt: '2024-01-01' },
                ],
            };
            (mockClient.get as any).mockResolvedValue(mockProject);

            const result = await diskService.listDisks(mockClient, 'my-app', {
                page: 1,
                perPage: 2,
            });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('disk1');
            expect(result[1].name).toBe('disk2');
        });
    });

    describe('createDisk', () => {
        it('should create a disk', async () => {
            const request: CreateDiskRequest = {
                name: 'my-disk',
                size: 50,
                mountPath: '/data',
            };
            const mockDisk: Disk = {
                _id: '1',
                ...request,
                projectID: 'project1',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockDisk);

            const result = await diskService.createDisk(mockClient, 'my-app', request);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/disks', request);
            expect(result).toEqual(mockDisk);
        });

        it('should reject invalid disk size', async () => {
            const request: CreateDiskRequest = {
                name: 'my-disk',
                size: 0,
                mountPath: '/data',
            };

            await expect(
                diskService.createDisk(mockClient, 'my-app', request)
            ).rejects.toThrow('Disk size must be greater than 0');
        });
    });

    describe('resizeDisk', () => {
        it('should resize a disk', async () => {
            const mockDisk: Disk = {
                _id: '1',
                name: 'disk1',
                projectID: 'project1',
                size: 100,
                mountPath: '/data',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockDisk);

            const result = await diskService.resizeDisk(mockClient, 'my-app', 'disk1', 100);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/disks/disk1/resize', {
                size: 100,
            });
            expect(result).toEqual(mockDisk);
        });
    });

    describe('listFtpAccesses', () => {
        it('should list FTP accesses with pagination', async () => {
            const mockFtpAccesses: FtpAccess[] = [
                {
                    _id: '1',
                    hostname: 'ftp.example.com',
                    port: 21,
                    username: 'user',
                    password: 'pass',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockFtpAccesses);

            const result = await diskService.listFtpAccesses(
                mockClient,
                'my-app',
                'disk1',
                { page: 1, perPage: 10 }
            );

            expect(mockClient.get).toHaveBeenCalledWith(
                '/v1/projects/my-app/disks/disk1/ftp',
                { page: 1, perPage: 10 }
            );
            expect(result).toEqual(mockFtpAccesses);
        });
    });

    describe('deleteFtpAccess', () => {
        it('should delete FTP access', async () => {
            (mockClient.delete as any).mockResolvedValue(undefined);

            await diskService.deleteFtpAccess(mockClient, 'my-app', 'disk1', 'ftp-123');

            expect(mockClient.delete).toHaveBeenCalledWith(
                '/v1/projects/my-app/disks/disk1/ftp/ftp-123'
            );
        });
    });
});
