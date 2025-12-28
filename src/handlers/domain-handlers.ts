/**
 * Domain (App Domains) tool handlers
 */
import * as domainService from '../services/domains.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleDomainTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_domains': {
            const domains = await domainService.listDomains(client, extractPagination(args));
            return jsonResponse(domains);
        }

        case 'liara_get_domain': {
            const domain = await domainService.getDomain(client, args!.domainId as string);
            return jsonResponse(domain);
        }

        case 'liara_add_domain': {
            const domain = await domainService.addDomain(
                client,
                args!.appName as string,
                args!.domain as string
            );
            return successResponse(`Domain "${domain.name}" added successfully.\n${JSON.stringify(domain, null, 2)}`);
        }

        case 'liara_remove_domain': {
            await domainService.removeDomain(client, args!.domainId as string);
            return successResponse(`Domain "${args!.domainId}" removed successfully.`);
        }

        default:
            return null;
    }
}
