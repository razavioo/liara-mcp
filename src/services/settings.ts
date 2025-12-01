import { LiaraClient } from '../api/client.js';
import { validateAppName } from '../utils/errors.js';

/**
 * Enable or disable zero-downtime deployment for an app
 */
export async function setZeroDowntime(
    client: LiaraClient,
    appName: string,
    enabled: boolean
): Promise<{ message: string }> {
    validateAppName(appName);
    const status = enabled ? 'enable' : 'disable';
    
    // Note: API uses project ID, but we'll use name and let the API handle it
    // If needed, we might need to get the project ID first
    return await client.post<{ message: string }>(
        `/v1/projects/${appName}/zero-downtime/${status}`
    );
}

/**
 * Enable or disable default subdomain for an app
 */
export async function setDefaultSubdomain(
    client: LiaraClient,
    appName: string,
    enabled: boolean
): Promise<{ message: string }> {
    validateAppName(appName);
    const status = enabled ? 'enable' : 'disable';
    
    return await client.post<{ message: string }>(
        `/v1/projects/${appName}/default-subdomain/${status}`
    );
}

/**
 * Enable or disable static IP for an app
 * Returns the IP address when enabling
 */
export async function setFixedIP(
    client: LiaraClient,
    appName: string,
    enabled: boolean
): Promise<{ message: string; IP?: string }> {
    validateAppName(appName);
    const status = enabled ? 'enable' : 'disable';
    
    return await client.post<{ message: string; IP?: string }>(
        `/v1/projects/${appName}/fixed-ip/${status}`
    );
}

/**
 * Enable or disable read-only mode for an app
 */
export async function setReadOnly(
    client: LiaraClient,
    appName: string,
    enabled: boolean
): Promise<{ message: string }> {
    validateAppName(appName);
    const status = enabled ? 'enable' : 'disable';
    
    return await client.post<{ message: string }>(
        `/v1/projects/${appName}/read-only/${status}`
    );
}

