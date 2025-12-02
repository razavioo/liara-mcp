import { LiaraClient } from '../api/client.js';
import {
    Zone,
    DnsRecord,
    CreateDnsRecordRequest,
    DomainCheck,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateRequired, unwrapApiResponse } from '../utils/errors.js';

/**
 * List all DNS zones
 */
export async function listZones(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<Zone[]> {
    const params = paginationToParams(pagination);
    const response = await client.get<any>('/v1/zones', params);
    return unwrapApiResponse<Zone[]>(response, ['zones', 'data', 'items']);
}

/**
 * Get details of a specific DNS zone
 */
export async function getZone(
    client: LiaraClient,
    zoneId: string
): Promise<Zone> {
    validateRequired(zoneId, 'Zone ID');
    return await client.get<Zone>(`/v1/zones/${zoneId}`);
}

/**
 * Create a new DNS zone
 */
export async function createZone(
    client: LiaraClient,
    name: string
): Promise<Zone> {
    validateRequired(name, 'Zone name');
    return await client.post<Zone>('/v1/zones', { name });
}

/**
 * Delete a DNS zone
 */
export async function deleteZone(
    client: LiaraClient,
    zoneId: string
): Promise<void> {
    validateRequired(zoneId, 'Zone ID');
    await client.delete(`/v1/zones/${zoneId}`);
}

/**
 * Check DNS zone status
 */
export async function checkZone(
    client: LiaraClient,
    zoneId: string
): Promise<DomainCheck> {
    validateRequired(zoneId, 'Zone ID');
    return await client.get<DomainCheck>(`/v1/zones/${zoneId}/check`);
}

/**
 * List DNS records for a zone
 */
export async function listRecords(
    client: LiaraClient,
    zoneId: string,
    pagination?: PaginationOptions
): Promise<DnsRecord[]> {
    validateRequired(zoneId, 'Zone ID');
    const params = paginationToParams(pagination);
    const response = await client.get<any>(`/v1/zones/${zoneId}/records`, params);
    return unwrapApiResponse<DnsRecord[]>(response, ['records', 'data', 'items']);
}

/**
 * Get a specific DNS record
 */
export async function getRecord(
    client: LiaraClient,
    zoneId: string,
    recordId: string
): Promise<DnsRecord> {
    validateRequired(zoneId, 'Zone ID');
    validateRequired(recordId, 'Record ID');
    return await client.get<DnsRecord>(`/v1/zones/${zoneId}/records/${recordId}`);
}

/**
 * Create a DNS record
 */
export async function createRecord(
    client: LiaraClient,
    zoneId: string,
    request: CreateDnsRecordRequest
): Promise<DnsRecord> {
    validateRequired(zoneId, 'Zone ID');
    validateRequired(request.type, 'Record type');
    validateRequired(request.name, 'Record name');
    validateRequired(request.value, 'Record value');

    return await client.post<DnsRecord>(
        `/v1/zones/${zoneId}/records`,
        request
    );
}

/**
 * Update a DNS record
 */
export async function updateRecord(
    client: LiaraClient,
    zoneId: string,
    recordId: string,
    request: Partial<CreateDnsRecordRequest>
): Promise<DnsRecord> {
    validateRequired(zoneId, 'Zone ID');
    validateRequired(recordId, 'Record ID');

    return await client.put<DnsRecord>(
        `/v1/zones/${zoneId}/records/${recordId}`,
        request
    );
}

/**
 * Delete a DNS record
 */
export async function deleteRecord(
    client: LiaraClient,
    zoneId: string,
    recordId: string
): Promise<void> {
    validateRequired(zoneId, 'Zone ID');
    validateRequired(recordId, 'Record ID');
    await client.delete(`/v1/zones/${zoneId}/records/${recordId}`);
}

