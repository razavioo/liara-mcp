/**
 * DNS tool handlers
 */
import * as dnsService from '../services/dns.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleDnsTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_zones': {
            const zones = await dnsService.listZones(client, extractPagination(args));
            return jsonResponse(zones);
        }

        case 'liara_get_zone': {
            const zone = await dnsService.getZone(client, args!.zoneId as string);
            return jsonResponse(zone);
        }

        case 'liara_create_zone': {
            const zone = await dnsService.createZone(client, args!.name as string);
            return successResponse(`Zone "${zone.name}" created successfully.
${JSON.stringify(zone, null, 2)}`);
        }

        case 'liara_delete_zone': {
            await dnsService.deleteZone(client, args!.zoneId as string);
            return successResponse(`Zone "${args!.zoneId}" deleted successfully.`);
        }

        case 'liara_list_dns_records': {
            const records = await dnsService.listRecords(
                client,
                args!.zoneId as string,
                extractPagination(args)
            );
            return jsonResponse(records);
        }

        case 'liara_create_dns_record': {
            const record = await dnsService.createRecord(
                client,
                args!.zoneId as string,
                {
                    type: args!.type as any,
                    name: args!.name as string,
                    value: args!.value as string,
                    ttl: args?.ttl as number | undefined,
                    priority: args?.priority as number | undefined,
                }
            );
            return successResponse(`DNS record created successfully.
${JSON.stringify(record, null, 2)}`);
        }

        case 'liara_get_dns_record': {
            const record = await dnsService.getRecord(
                client,
                args!.zoneId as string,
                args!.recordId as string
            );
            return jsonResponse(record);
        }

        case 'liara_update_dns_record': {
            const record = await dnsService.updateRecord(
                client,
                args!.zoneId as string,
                args!.recordId as string,
                {
                    type: args?.type as any,
                    name: args?.name as string | undefined,
                    value: args?.value as string | undefined,
                    ttl: args?.ttl as number | undefined,
                    priority: args?.priority as number | undefined,
                }
            );
            return successResponse(`DNS record updated successfully.
${JSON.stringify(record, null, 2)}`);
        }

        case 'liara_delete_dns_record': {
            await dnsService.deleteRecord(
                client,
                args!.zoneId as string,
                args!.recordId as string
            );
            return successResponse(`DNS record "${args!.recordId}" deleted successfully.`);
        }

        default:
            return null;
    }
}
