import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as dnsService from '../../services/dns.js';
import { Zone, DnsRecord, CreateDnsRecordRequest } from '../../api/types.js';

describe('DNS Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('listZones', () => {
        it('should list DNS zones with pagination', async () => {
            const mockZones: Zone[] = [
                {
                    _id: '1',
                    name: 'example.com',
                    status: 'ACTIVE',
                    createdAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockZones);

            const result = await dnsService.listZones(mockClient, { page: 1, perPage: 20 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/zones', {
                page: 1,
                perPage: 20,
            });
            expect(result).toEqual(mockZones);
        });
    });

    describe('createZone', () => {
        it('should create a DNS zone', async () => {
            const mockZone: Zone = {
                _id: '1',
                name: 'example.com',
                status: 'PENDING',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockZone);

            const result = await dnsService.createZone(mockClient, 'example.com');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/zones', { name: 'example.com' });
            expect(result).toEqual(mockZone);
        });
    });

    describe('createRecord', () => {
        it('should create a DNS record', async () => {
            const request: CreateDnsRecordRequest = {
                type: 'A',
                name: 'www',
                value: '192.168.1.1',
                ttl: 3600,
            };
            const mockRecord: DnsRecord = {
                _id: '1',
                zoneID: 'zone1',
                ...request,
                ttl: 3600,
            };
            (mockClient.post as any).mockResolvedValue(mockRecord);

            const result = await dnsService.createRecord(mockClient, 'zone1', request);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/zones/zone1/records', request);
            expect(result).toEqual(mockRecord);
        });

        it('should create MX record with priority', async () => {
            const request: CreateDnsRecordRequest = {
                type: 'MX',
                name: '@',
                value: 'mail.example.com',
                priority: 10,
            };
            const mockRecord: DnsRecord = {
                _id: '1',
                zoneID: 'zone1',
                type: 'MX',
                name: '@',
                value: 'mail.example.com',
                ttl: 3600,
                priority: 10,
            };
            (mockClient.post as any).mockResolvedValue(mockRecord);

            const result = await dnsService.createRecord(mockClient, 'zone1', request);

            expect(result.priority).toBe(10);
        });
    });

    describe('updateRecord', () => {
        it('should update a DNS record', async () => {
            const updates = { value: '192.168.1.2', ttl: 7200 };
            const mockRecord: DnsRecord = {
                _id: '1',
                zoneID: 'zone1',
                type: 'A',
                name: 'www',
                value: '192.168.1.2',
                ttl: 7200,
            };
            (mockClient.put as any).mockResolvedValue(mockRecord);

            const result = await dnsService.updateRecord(mockClient, 'zone1', 'record1', updates);

            expect(mockClient.put).toHaveBeenCalledWith(
                '/v1/zones/zone1/records/record1',
                updates
            );
            expect(result).toEqual(mockRecord);
        });
    });

    describe('listRecords', () => {
        it('should list DNS records with pagination', async () => {
            const mockRecords: DnsRecord[] = [
                {
                    _id: '1',
                    zoneID: 'zone1',
                    type: 'A',
                    name: 'www',
                    value: '192.168.1.1',
                    ttl: 3600,
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockRecords);

            const result = await dnsService.listRecords(mockClient, 'zone1', {
                limit: 50,
            });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/zones/zone1/records', {
                limit: 50,
            });
            expect(result).toEqual(mockRecords);
        });
    });
});
