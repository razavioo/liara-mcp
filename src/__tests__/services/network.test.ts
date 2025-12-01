import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as networkService from '../../services/network.js';
import { Network } from '../../api/types.js';

describe('Network Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('listNetworks', () => {
        it('should list networks with pagination', async () => {
            const mockNetworks: Network[] = [
                {
                    _id: '1',
                    name: 'network1',
                    cidr: '10.0.0.0/24',
                    createdAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockNetworks);

            const result = await networkService.listNetworks(mockClient, { page: 1, perPage: 10 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/networks', {
                page: 1,
                perPage: 10,
            });
            expect(result).toEqual(mockNetworks);
        });
    });

    describe('createNetwork', () => {
        it('should create a network without CIDR', async () => {
            const mockNetwork: Network = {
                _id: '1',
                name: 'my-network',
                cidr: '10.0.0.0/24',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockNetwork);

            const result = await networkService.createNetwork(mockClient, 'my-network');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/networks', {
                name: 'my-network',
            });
            expect(result).toEqual(mockNetwork);
        });

        it('should create a network with CIDR', async () => {
            const mockNetwork: Network = {
                _id: '1',
                name: 'my-network',
                cidr: '10.0.0.0/24',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockNetwork);

            const result = await networkService.createNetwork(
                mockClient,
                'my-network',
                '10.0.0.0/24'
            );

            expect(mockClient.post).toHaveBeenCalledWith('/v1/networks', {
                name: 'my-network',
                cidr: '10.0.0.0/24',
            });
            expect(result).toEqual(mockNetwork);
        });
    });
});
