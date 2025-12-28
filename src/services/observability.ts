import { LiaraClient } from '../api/client.js';
import {
    MetricsSummary,
    LogEntry,
} from '../api/types.js';
import { validateAppName } from '../utils/errors.js';

/**
 * Get app metrics summary
 */
export async function getAppMetrics(
    client: LiaraClient,
    appName: string,
    period?: string
): Promise<MetricsSummary> {
    validateAppName(appName);

    const params: Record<string, string | number | boolean> = period ? { period } : {};
    return await client.get<MetricsSummary>(
        `/v1/projects/${appName}/metrics/summary`,
        params
    );
}

/**
 * Get app logs
 * @param limit - Maximum number of log entries to return (default: 100)
 * @param since - ISO timestamp to fetch logs since
 * @param until - ISO timestamp to fetch logs until
 */
export async function getAppLogs(
    client: LiaraClient,
    appName: string,
    options?: {
        limit?: number;
        since?: string;
        until?: string;
    }
): Promise<LogEntry[]> {
    validateAppName(appName);
    
    const params: any = {};
    if (options?.limit) {
        params.limit = options.limit;
    }
    if (options?.since) {
        params.since = options.since;
    }
    if (options?.until) {
        params.until = options.until;
    }
    
    return await client.get<LogEntry[]>(
        `/v1/projects/${appName}/logs`,
        params
    );
}

/**
 * Stream app logs (real-time)
 * Note: This would typically use WebSocket, but for MCP we return recent logs
 * For true streaming, consider implementing WebSocket support separately
 */
export async function streamAppLogs(
    client: LiaraClient,
    appName: string
): Promise<LogEntry[]> {
    validateAppName(appName);
    
    // For now, return recent logs
    // WebSocket streaming would require separate implementation
    return await getAppLogs(client, appName, { limit: 100 });
}

