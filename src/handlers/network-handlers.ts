/**
 * Network tool handlers
 */
import * as networkService from '../services/network.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleNetworkTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_networks': {
            const networks = await networkService.listNetworks(client, extractPagination(args));
            return jsonResponse(networks);
        }

        case 'liara_get_network': {
            const network = await networkService.getNetwork(client, args!.networkId as string);
            return jsonResponse(network);
        }

        case 'liara_create_network': {
            const network = await networkService.createNetwork(
                client,
                args!.name as string,
                args?.cidr as string | undefined
            );
            return successResponse(`Network "${network.name}" created successfully.\n${JSON.stringify(network, null, 2)}`);
        }

        case 'liara_delete_network': {
            await networkService.deleteNetwork(client, args!.networkId as string);
            return successResponse(`Network "${args!.networkId}" deleted successfully.`);
        }

        default:
            return null;
    }
}
