/**
 * Disk tool handlers
 */
import * as diskService from '../services/disks.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleDiskTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_disks': {
            const disks = await diskService.listDisks(
                client,
                args!.appName as string,
                extractPagination(args)
            );
            return jsonResponse(disks);
        }

        case 'liara_create_disk': {
            const disk = await diskService.createDisk(
                client,
                args!.appName as string,
                {
                    name: args!.name as string,
                    size: args!.size as number,
                    mountPath: args!.mountPath as string,
                }
            );
            return successResponse(`Disk "${disk.name}" created successfully.\n${JSON.stringify(disk, null, 2)}`);
        }

        case 'liara_get_disk': {
            const disk = await diskService.getDisk(
                client,
                args!.appName as string,
                args!.diskName as string
            );
            return jsonResponse(disk);
        }

        case 'liara_delete_disk': {
            await diskService.deleteDisk(
                client,
                args!.appName as string,
                args!.diskName as string
            );
            return successResponse(`Disk "${args!.diskName}" deleted successfully.`);
        }

        case 'liara_resize_disk': {
            const disk = await diskService.resizeDisk(
                client,
                args!.appName as string,
                args!.diskName as string,
                args!.size as number
            );
            return successResponse(`Disk "${args!.diskName}" resized to ${args!.size}GB successfully.\n${JSON.stringify(disk, null, 2)}`);
        }

        case 'liara_create_ftp_access': {
            const ftp = await diskService.createFtpAccess(
                client,
                args!.appName as string,
                args!.diskName as string
            );
            return successResponse(`FTP access created successfully.\n${JSON.stringify(ftp, null, 2)}`);
        }

        case 'liara_list_ftp_accesses': {
            const ftpAccesses = await diskService.listFtpAccesses(
                client,
                args!.appName as string,
                args!.diskName as string,
                extractPagination(args)
            );
            return jsonResponse(ftpAccesses);
        }

        case 'liara_delete_ftp_access': {
            await diskService.deleteFtpAccess(
                client,
                args!.appName as string,
                args!.diskName as string,
                args!.ftpId as string
            );
            return successResponse(`FTP access "${args!.ftpId}" deleted successfully.`);
        }

        default:
            return null;
    }
}
