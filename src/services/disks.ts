import { LiaraClient } from '../api/client.js';
import {
    Disk,
    CreateDiskRequest,
    FtpAccess,
} from '../api/types.js';
import { validateAppName, validateRequired } from '../utils/errors.js';

/**
 * List disks for a project
 */
export async function listDisks(
    client: LiaraClient,
    appName: string
): Promise<Disk[]> {
    validateAppName(appName);
    // Disks are included in project details
    const project = await client.get<any>(`/v1/projects/${appName}`);
    return project.disks || [];
}

/**
 * Get details of a specific disk
 */
export async function getDisk(
    client: LiaraClient,
    appName: string,
    diskName: string
): Promise<Disk> {
    validateAppName(appName);
    validateRequired(diskName, 'Disk name');
    
    return await client.get<Disk>(`/v1/projects/${appName}/disks/${diskName}`);
}

/**
 * Create a new disk for a project
 */
export async function createDisk(
    client: LiaraClient,
    appName: string,
    request: CreateDiskRequest
): Promise<Disk> {
    validateAppName(appName);
    validateRequired(request.name, 'Disk name');
    validateRequired(request.size, 'Disk size');
    validateRequired(request.mountPath, 'Mount path');

    if (request.size <= 0) {
        throw new Error('Disk size must be greater than 0');
    }

    return await client.post<Disk>(
        `/v1/projects/${appName}/disks`,
        request
    );
}

/**
 * Delete a disk
 */
export async function deleteDisk(
    client: LiaraClient,
    appName: string,
    diskName: string
): Promise<void> {
    validateAppName(appName);
    validateRequired(diskName, 'Disk name');
    await client.delete(`/v1/projects/${appName}/disks/${diskName}`);
}

/**
 * Create FTP access for a disk
 */
export async function createFtpAccess(
    client: LiaraClient,
    appName: string,
    diskName: string
): Promise<FtpAccess> {
    validateAppName(appName);
    validateRequired(diskName, 'Disk name');
    
    return await client.post<FtpAccess>(
        `/v1/projects/${appName}/disks/${diskName}/ftp`
    );
}

/**
 * List FTP accesses for a disk
 */
export async function listFtpAccesses(
    client: LiaraClient,
    appName: string,
    diskName: string
): Promise<FtpAccess[]> {
    validateAppName(appName);
    validateRequired(diskName, 'Disk name');
    
    return await client.get<FtpAccess[]>(
        `/v1/projects/${appName}/disks/${diskName}/ftp`
    );
}

/**
 * Delete/revoke FTP access for a disk
 */
export async function deleteFtpAccess(
    client: LiaraClient,
    appName: string,
    diskName: string,
    ftpId: string
): Promise<void> {
    validateAppName(appName);
    validateRequired(diskName, 'Disk name');
    validateRequired(ftpId, 'FTP access ID');
    
    await client.delete(`/v1/projects/${appName}/disks/${diskName}/ftp/${ftpId}`);
}

/**
 * Resize a disk
 */
export async function resizeDisk(
    client: LiaraClient,
    appName: string,
    diskName: string,
    size: number
): Promise<Disk> {
    validateAppName(appName);
    validateRequired(diskName, 'Disk name');
    validateRequired(size, 'Disk size');
    
    if (size <= 0) {
        throw new Error('Disk size must be greater than 0');
    }
    
    return await client.post<Disk>(
        `/v1/projects/${appName}/disks/${diskName}/resize`,
        { size }
    );
}

