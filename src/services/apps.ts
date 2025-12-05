import { LiaraClient } from '../api/client.js';
import {
    Project,
    CreateProjectRequest,
    ProjectDetails,
    Platform,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateAppName, validateRequired, unwrapApiResponse } from '../utils/errors.js';

/**
 * List all apps/projects
 */
export async function listApps(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<Project[]> {
    const params = paginationToParams(pagination);
    const response = await client.get<any>('/v1/projects', params);
    return unwrapApiResponse<Project[]>(response, ['projects', 'data', 'items']);
}

/**
 * Get details of a specific app
 */
export async function getApp(
    client: LiaraClient,
    name: string
): Promise<ProjectDetails> {
    validateAppName(name);
    return await client.get<ProjectDetails>(`/v1/projects/${name}`);
}

/**
 * Create a new app
 */
export async function createApp(
    client: LiaraClient,
    request: CreateProjectRequest
): Promise<Project> {
    validateAppName(request.name);
    validateRequired(request.platform, 'Platform');
    validateRequired(request.planID, 'Plan ID');
    // Network is optional in schema but will be passed to API if provided
    // API will return error if network is required but not provided

    return await client.post<Project>('/v1/projects', request);
}

/**
 * Delete an app
 */
export async function deleteApp(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateAppName(name);
    await client.delete(`/v1/projects/${name}`);
}

/**
 * Start an app (scale up to 1)
 */
export async function startApp(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateAppName(name);
    await client.post(`/v1/projects/${name}/actions/scale`, { scale: 1 });
}

/**
 * Stop an app (scale down to 0)
 */
export async function stopApp(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateAppName(name);
    await client.post(`/v1/projects/${name}/actions/scale`, { scale: 0 });
}

/**
 * Scale an app to a specific number of replicas
 */
export async function scaleApp(
    client: LiaraClient,
    name: string,
    replicas: number
): Promise<void> {
    validateAppName(name);
    if (replicas < 0) {
        throw new Error('Replicas must be 0 or greater');
    }
    await client.post(`/v1/projects/${name}/actions/scale`, { scale: replicas });
}

/**
 * Restart an app
 */
export async function restartApp(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateAppName(name);
    await client.post(`/v1/projects/${name}/actions/restart`);
}

/**
 * Change app plan (resize)
 */
export async function resizeApp(
    client: LiaraClient,
    name: string,
    planID: string
): Promise<void> {
    validateAppName(name);
    validateRequired(planID, 'Plan ID');
    await client.post(`/v1/projects/${name}/resize`, { planID });
}

/**
 * Execute a command in the app container
 * Note: This may require WebSocket support depending on Liara API implementation
 * For now, we'll attempt to use HTTP endpoint if available
 */
export async function execCommand(
    client: LiaraClient,
    appName: string,
    command: string,
    workingDir?: string
): Promise<{ output: string; exitCode: number }> {
    validateAppName(appName);
    validateRequired(command, 'Command');
    
    // Try HTTP endpoint first (if available)
    // Note: Liara may require WebSocket for interactive commands
    // This is a placeholder implementation
    try {
        const response = await client.post<{ output: string; exitCode: number }>(
            `/v1/projects/${appName}/exec`,
            {
                command,
                workingDir: workingDir || '/app',
            }
        );
        return response;
    } catch (error: any) {
        // If HTTP endpoint doesn't exist, return error with guidance
        if (error.response?.status === 404) {
            throw new Error(
                'Command execution requires WebSocket support. ' +
                'Please use the Liara CLI: `liara app shell --app <name> -- <command>` ' +
                'or implement WebSocket support in the MCP server.'
            );
        }
        throw error;
    }
}

/**
 * Get available platforms
 */
export function getAvailablePlatforms(): Platform[] {
    return [
        'node',
        'nextjs',
        'laravel',
        'php',
        'django',
        'flask',
        'dotnet',
        'static',
        'react',
        'angular',
        'vue',
        'docker',
        'python',
        'go',
    ];
}
