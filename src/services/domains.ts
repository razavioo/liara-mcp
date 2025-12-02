import { LiaraClient } from '../api/client.js';
import {
    Domain,
    DomainCheck,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateRequired, unwrapApiResponse } from '../utils/errors.js';

/**
 * List all domains
 */
export async function listDomains(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<Domain[]> {
    const params = paginationToParams(pagination);
    const response = await client.get<any>('/v1/domains', params);
    return unwrapApiResponse<Domain[]>(response, ['domains', 'data', 'items']);
}

/**
 * Get details of a specific domain
 */
export async function getDomain(
    client: LiaraClient,
    domainId: string
): Promise<Domain> {
    validateRequired(domainId, 'Domain ID');
    return await client.get<Domain>(`/v1/domains/${domainId}`);
}

/**
 * Add a domain to an app
 */
export async function addDomain(
    client: LiaraClient,
    appName: string,
    domain: string
): Promise<Domain> {
    validateRequired(appName, 'App name');
    validateRequired(domain, 'Domain');

    return await client.post<Domain>('/v1/domains', {
        project: appName,
        domain,
    });
}

/**
 * Remove a domain from an app
 */
export async function removeDomain(
    client: LiaraClient,
    domainId: string
): Promise<void> {
    validateRequired(domainId, 'Domain ID');
    await client.delete(`/v1/domains/${domainId}`);
}

/**
 * Check domain status
 */
export async function checkDomain(
    client: LiaraClient,
    domainId: string
): Promise<DomainCheck> {
    validateRequired(domainId, 'Domain ID');
    return await client.get<DomainCheck>(`/v1/domains/${domainId}/check`);
}

