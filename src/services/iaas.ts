import { LiaraClient } from '../api/client.js';
import {
    VirtualMachine,
    CreateVmRequest,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateRequired } from '../utils/errors.js';

/**
 * Create a specialized IaaS client with the IaaS API base URL
 */
function createIaaSClient(client: LiaraClient): LiaraClient {
    // Access the internal client to get the API token
    const internalClient = (client as any).client;
    const apiToken = internalClient?.defaults?.headers?.Authorization?.replace('Bearer ', '') || 
                     process.env.LIARA_API_TOKEN;
    const teamId = (client as any).teamId || process.env.LIARA_TEAM_ID;

    if (!apiToken) {
        throw new Error('API token is required for IaaS operations');
    }

    // Create new client with IaaS base URL
    // Import LiaraClient class dynamically
    return new LiaraClient({
        apiToken,
        teamId,
        baseURL: 'https://iaas-api.liara.ir',
    });
}

/**
 * List all virtual machines
 */
export async function listVMs(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<VirtualMachine[]> {
    const iaasClient = createIaaSClient(client);
    const params = paginationToParams(pagination);
    return await iaasClient.get<VirtualMachine[]>('/vm', params);
}

/**
 * Get details of a specific VM
 */
export async function getVM(
    client: LiaraClient,
    vmId: string
): Promise<VirtualMachine> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    return await iaasClient.get<VirtualMachine>(`/vm/${vmId}`);
}

/**
 * Create a new virtual machine
 */
export async function createVM(
    client: LiaraClient,
    request: CreateVmRequest
): Promise<VirtualMachine> {
    validateRequired(request.name, 'VM name');
    validateRequired(request.planID, 'Plan ID');
    validateRequired(request.os, 'Operating system');
    validateRequired(request.network, 'Network ID');

    const iaasClient = createIaaSClient(client);
    return await iaasClient.post<VirtualMachine>('/vm', request);
}

/**
 * Start a VM
 */
export async function startVM(
    client: LiaraClient,
    vmId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.post(`/vm/${vmId}/actions/start`);
}

/**
 * Stop a VM
 */
export async function stopVM(
    client: LiaraClient,
    vmId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.post(`/vm/${vmId}/actions/stop`);
}

/**
 * Restart a VM
 */
export async function restartVM(
    client: LiaraClient,
    vmId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.post(`/vm/${vmId}/actions/restart`);
}

/**
 * Shutdown a VM
 */
export async function shutdownVM(
    client: LiaraClient,
    vmId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.post(`/vm/${vmId}/actions/shutdown`);
}

/**
 * Power off a VM
 */
export async function powerOffVM(
    client: LiaraClient,
    vmId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.post(`/vm/${vmId}/actions/poweroff`);
}

/**
 * Delete a VM
 */
export async function deleteVM(
    client: LiaraClient,
    vmId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.delete(`/vm/${vmId}`);
}

/**
 * Resize a VM (change plan)
 */
export async function resizeVM(
    client: LiaraClient,
    vmId: string,
    planID: string
): Promise<VirtualMachine> {
    validateRequired(vmId, 'VM ID');
    validateRequired(planID, 'Plan ID');
    const iaasClient = createIaaSClient(client);
    return await iaasClient.post<VirtualMachine>(`/vm/${vmId}/resize`, { planID });
}

/**
 * Create a VM snapshot
 */
export async function createSnapshot(
    client: LiaraClient,
    vmId: string,
    name?: string
): Promise<{ snapshotId: string; name: string; createdAt: string }> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    const body = name ? { name } : {};
    return await iaasClient.post<{ snapshotId: string; name: string; createdAt: string }>(
        `/vm/${vmId}/snapshots`,
        body
    );
}

/**
 * List VM snapshots
 */
export async function listSnapshots(
    client: LiaraClient,
    vmId: string,
    pagination?: PaginationOptions
): Promise<Array<{ snapshotId: string; name: string; createdAt: string; size?: number }>> {
    validateRequired(vmId, 'VM ID');
    const iaasClient = createIaaSClient(client);
    const params = paginationToParams(pagination);
    return await iaasClient.get<Array<{ snapshotId: string; name: string; createdAt: string; size?: number }>>(
        `/vm/${vmId}/snapshots`,
        params
    );
}

/**
 * Restore a VM from a snapshot
 */
export async function restoreSnapshot(
    client: LiaraClient,
    vmId: string,
    snapshotId: string
): Promise<{ message: string }> {
    validateRequired(vmId, 'VM ID');
    validateRequired(snapshotId, 'Snapshot ID');
    const iaasClient = createIaaSClient(client);
    return await iaasClient.post<{ message: string }>(
        `/vm/${vmId}/snapshots/${snapshotId}/restore`
    );
}

/**
 * Delete a VM snapshot
 */
export async function deleteSnapshot(
    client: LiaraClient,
    vmId: string,
    snapshotId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    validateRequired(snapshotId, 'Snapshot ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.delete(`/vm/${vmId}/snapshots/${snapshotId}`);
}

/**
 * Attach a network to a VM
 */
export async function attachNetwork(
    client: LiaraClient,
    vmId: string,
    networkId: string
): Promise<{ message: string }> {
    validateRequired(vmId, 'VM ID');
    validateRequired(networkId, 'Network ID');
    const iaasClient = createIaaSClient(client);
    return await iaasClient.post<{ message: string }>(
        `/vm/${vmId}/networks/${networkId}/attach`
    );
}

/**
 * Detach a network from a VM
 */
export async function detachNetwork(
    client: LiaraClient,
    vmId: string,
    networkId: string
): Promise<void> {
    validateRequired(vmId, 'VM ID');
    validateRequired(networkId, 'Network ID');
    const iaasClient = createIaaSClient(client);
    await iaasClient.delete(`/vm/${vmId}/networks/${networkId}`);
}

