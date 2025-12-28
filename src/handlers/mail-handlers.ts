/**
 * Mail tool handlers
 */
import * as mailService from '../services/mail.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleMailTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_mail_servers': {
            const servers = await mailService.listMailServers(client, extractPagination(args));
            return jsonResponse(servers);
        }

        case 'liara_get_mail_server': {
            const server = await mailService.getMailServer(client, args!.mailId as string);
            return jsonResponse(server);
        }

        case 'liara_create_mail_server': {
            const server = await mailService.createMailServer(
                client,
                args!.name as string,
                args?.mode as 'DEV' | 'LIVE' | undefined,
                args?.planID as string | undefined,
                args?.domain as string | undefined
            );
            return successResponse(`Mail server "${server.name}" created successfully.\n${JSON.stringify(server, null, 2)}`);
        }

        case 'liara_delete_mail_server': {
            await mailService.deleteMailServer(client, args!.mailId as string);
            return successResponse(`Mail server "${args!.mailId}" deleted successfully.`);
        }

        case 'liara_send_email': {
            const toAddresses = (args!.to as string).split(',').map(s => s.trim());
            const result = await mailService.sendEmail(
                client,
                args!.mailId as string,
                {
                    from: args!.from as string,
                    to: toAddresses.length === 1 ? toAddresses[0] : toAddresses,
                    subject: args!.subject as string,
                    html: args?.html as string | undefined,
                    text: args?.text as string | undefined,
                }
            );
            return successResponse(result.message || 'Email sent successfully.');
        }

        case 'liara_start_mail_server': {
            await mailService.startMailServer(client, args!.mailId as string);
            return successResponse(`Mail server "${args!.mailId}" started successfully.`);
        }

        case 'liara_stop_mail_server': {
            await mailService.stopMailServer(client, args!.mailId as string);
            return successResponse(`Mail server "${args!.mailId}" stopped successfully.`);
        }

        case 'liara_restart_mail_server': {
            await mailService.restartMailServer(client, args!.mailId as string);
            return successResponse(`Mail server "${args!.mailId}" restarted successfully.`);
        }

        default:
            return null;
    }
}
