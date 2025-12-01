import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as domainService from '../../services/domains.js';
import { Domain } from '../../api/types.js';

describe('Domains Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('listDomains', () => {
        it('should list domains with pagination', async () => {
            const mockDomains: Domain[] = [
                {
                    _id: '1',
                    name: 'example.com',
                    projectID: 'project1',
                    status: 'ACTIVE',
                    createdAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockDomains);

            const result = await domainService.listDomains(mockClient, { page: 1, perPage: 10 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/domains', {
                page: 1,
                perPage: 10,
            });
            expect(result).toEqual(mockDomains);
        });
    });

    describe('addDomain', () => {
        it('should add a domain to an app', async () => {
            const mockDomain: Domain = {
                _id: '1',
                name: 'example.com',
                projectID: 'project1',
                status: 'PENDING',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockDomain);

            const result = await domainService.addDomain(mockClient, 'my-app', 'example.com');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/domains', {
                project: 'my-app',
                domain: 'example.com',
            });
            expect(result).toEqual(mockDomain);
        });
    });

    describe('checkDomain', () => {
        it('should check domain status', async () => {
            const mockCheck = {
                domain: 'example.com',
                valid: true,
                dnsConfigured: true,
                message: 'Domain is configured correctly',
            };
            (mockClient.get as any).mockResolvedValue(mockCheck);

            const result = await domainService.checkDomain(mockClient, 'domain1');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/domains/domain1/check');
            expect(result).toEqual(mockCheck);
        });
    });
});
