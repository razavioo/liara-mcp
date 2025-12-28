/**
 * App settings tool handlers
 */
import * as settingsService from '../services/settings.js';
import { LiaraClient, ToolResult, successResponse } from './types.js';

export async function handleSettingsTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_set_zero_downtime': {
            const result = await settingsService.setZeroDowntime(
                client,
                args!.appName as string,
                args!.enabled as boolean
            );
            return successResponse(
                result.message || `Zero-downtime deployment ${args!.enabled ? 'enabled' : 'disabled'} successfully.`
            );
        }

        case 'liara_set_default_subdomain': {
            const result = await settingsService.setDefaultSubdomain(
                client,
                args!.appName as string,
                args!.enabled as boolean
            );
            return successResponse(
                result.message || `Default subdomain ${args!.enabled ? 'enabled' : 'disabled'} successfully.`
            );
        }

        case 'liara_set_fixed_ip': {
            const result = await settingsService.setFixedIP(
                client,
                args!.appName as string,
                args!.enabled as boolean
            );
            const ipInfo = result.IP ? `\nStatic IP: ${result.IP}` : '';
            return successResponse(
                (result.message || `Static IP ${args!.enabled ? 'enabled' : 'disabled'} successfully.`) + ipInfo
            );
        }

        case 'liara_set_read_only': {
            const result = await settingsService.setReadOnly(
                client,
                args!.appName as string,
                args!.enabled as boolean
            );
            return successResponse(
                result.message || `Read-only mode ${args!.enabled ? 'enabled' : 'disabled'} successfully.`
            );
        }

        default:
            return null;
    }
}
