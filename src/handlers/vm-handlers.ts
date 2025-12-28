/**
 * VM (IaaS) tool handlers
 */
import * as iaasService from '../services/iaas.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleVmTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_vms': {
            const vms = await iaasService.listVMs(client, extractPagination(args));
            return jsonResponse(vms);
        }

        case 'liara_get_vm': {
            const vm = await iaasService.getVM(client, args!.vmId as string);
            return jsonResponse(vm);
        }

        case 'liara_create_vm': {
            const vm = await iaasService.createVM(client, args as any);
            return successResponse(`VM "${vm.name}" created successfully.\n${JSON.stringify(vm, null, 2)}`);
        }

        case 'liara_start_vm': {
            await iaasService.startVM(client, args!.vmId as string);
            return successResponse(`VM "${args!.vmId}" started successfully.`);
        }

        case 'liara_stop_vm': {
            await iaasService.stopVM(client, args!.vmId as string);
            return successResponse(`VM "${args!.vmId}" stopped successfully.`);
        }

        case 'liara_restart_vm': {
            await iaasService.restartVM(client, args!.vmId as string);
            return successResponse(`VM "${args!.vmId}" restarted successfully.`);
        }

        case 'liara_delete_vm': {
            await iaasService.deleteVM(client, args!.vmId as string);
            return successResponse(`VM "${args!.vmId}" deleted successfully.`);
        }

        case 'liara_resize_vm': {
            const vm = await iaasService.resizeVM(
                client,
                args!.vmId as string,
                args!.planID as string
            );
            return successResponse(`VM "${args!.vmId}" resized to plan "${args!.planID}" successfully.\n${JSON.stringify(vm, null, 2)}`);
        }

        case 'liara_create_snapshot': {
            const snapshot = await iaasService.createSnapshot(
                client,
                args!.vmId as string,
                args?.name as string | undefined
            );
            return successResponse(`Snapshot created successfully.\n${JSON.stringify(snapshot, null, 2)}`);
        }

        case 'liara_list_snapshots': {
            const snapshots = await iaasService.listSnapshots(
                client,
                args!.vmId as string,
                extractPagination(args)
            );
            return jsonResponse(snapshots);
        }

        case 'liara_restore_snapshot': {
            const result = await iaasService.restoreSnapshot(
                client,
                args!.vmId as string,
                args!.snapshotId as string
            );
            return successResponse(
                result.message || `VM "${args!.vmId}" restored from snapshot "${args!.snapshotId}" successfully.`
            );
        }

        case 'liara_delete_snapshot': {
            await iaasService.deleteSnapshot(
                client,
                args!.vmId as string,
                args!.snapshotId as string
            );
            return successResponse(`Snapshot "${args!.snapshotId}" deleted successfully.`);
        }

        case 'liara_attach_network': {
            const result = await iaasService.attachNetwork(
                client,
                args!.vmId as string,
                args!.networkId as string
            );
            return successResponse(
                result.message || `Network "${args!.networkId}" attached to VM "${args!.vmId}" successfully.`
            );
        }

        case 'liara_detach_network': {
            await iaasService.detachNetwork(
                client,
                args!.vmId as string,
                args!.networkId as string
            );
            return successResponse(`Network "${args!.networkId}" detached from VM "${args!.vmId}" successfully.`);
        }

        default:
            return null;
    }
}
