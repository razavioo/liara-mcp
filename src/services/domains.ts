import { LiaraClient } from '../api/client.js';
import {
    Domain,
    DomainCheck,
} from '../api/types.js';
import { validateRequired } from '../utils/errors.js';

/**
 * List all domains
 */
export async function listDomains(client: LiaraClient): Promise<Domain[]> {
    return await client.get<Domain[]>('/v1/domains');
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

