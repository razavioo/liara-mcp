import { LiaraClient } from '../api/client.js';
import {
    Network,
} from '../api/types.js';
import { validateRequired } from '../utils/errors.js';

/**
 * List all networks
 */
export async function listNetworks(client: LiaraClient): Promise<Network[]> {
    return await client.get<Network[]>('/v1/networks');
}

/**
 * Get details of a specific network
 */
export async function getNetwork(
    client: LiaraClient,
    networkId: string
): Promise<Network> {
    validateRequired(networkId, 'Network ID');
    return await client.get<Network>(`/v1/networks/${networkId}`);
}

/**
 * Create a new network
 */
export async function createNetwork(
    client: LiaraClient,
    name: string,
    cidr?: string
): Promise<Network> {
    validateRequired(name, 'Network name');
    
    const request: any = { name };
    if (cidr) {
        request.cidr = cidr;
    }
    
    return await client.post<Network>('/v1/networks', request);
}

/**
 * Delete a network
 */
export async function deleteNetwork(
    client: LiaraClient,
    networkId: string
): Promise<void> {
    validateRequired(networkId, 'Network ID');
    await client.delete(`/v1/networks/${networkId}`);
}

