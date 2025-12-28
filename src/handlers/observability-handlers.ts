/**
 * Observability tool handlers
 */
import * as observabilityService from '../services/observability.js';
import { LiaraClient, ToolResult, jsonResponse } from './types.js';

export async function handleObservabilityTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_get_metrics': {
            const metrics = await observabilityService.getAppMetrics(
                client,
                args!.appName as string,
                args?.period as string | undefined
            );
            return jsonResponse(metrics);
        }

        case 'liara_get_logs': {
            const logs = await observabilityService.getAppLogs(
                client,
                args!.appName as string,
                {
                    limit: args?.limit as number | undefined,
                    since: args?.since as string | undefined,
                    until: args?.until as string | undefined,
                }
            );
            return jsonResponse(logs);
        }

        default:
            return null;
    }
}
