/**
 * App management tool handlers
 */
import * as appService from '../services/apps.js';
import { CreateProjectRequest } from '../api/types.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleAppTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_apps': {
            const apps = await appService.listApps(client, extractPagination(args));
            return jsonResponse(apps);
        }

        case 'liara_get_app': {
            const app = await appService.getApp(client, args!.name as string);
            return jsonResponse(app);
        }

        case 'liara_create_app': {
            const app = await appService.createApp(client, args as unknown as CreateProjectRequest);
            return jsonResponse({
                success: true,
                data: app,
                message: `App "${app.name}" created successfully`
            });
        }

        case 'liara_delete_app': {
            await appService.deleteApp(client, args!.name as string);
            return successResponse(`App "${args!.name}" deleted successfully.`);
        }

        case 'liara_start_app': {
            await appService.startApp(client, args!.name as string);
            return successResponse(`App "${args!.name}" started successfully.`);
        }

        case 'liara_stop_app': {
            await appService.stopApp(client, args!.name as string);
            return successResponse(`App "${args!.name}" stopped successfully.`);
        }

        case 'liara_restart_app': {
            await appService.restartApp(client, args!.name as string);
            return successResponse(`App "${args!.name}" restarted successfully.`);
        }

        case 'liara_resize_app': {
            await appService.resizeApp(
                client,
                args!.name as string,
                args!.planID as string
            );
            return successResponse(`App "${args!.name}" resized to plan "${args!.planID}" successfully.`);
        }

        default:
            return null;
    }
}
