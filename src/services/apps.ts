import { LiaraClient } from '../api/client.js';
import {
    Project,
    CreateProjectRequest,
    ProjectDetails,
    Platform,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateAppName, validateRequired } from '../utils/errors.js';

/**
 * List all apps/projects
 */
export async function listApps(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<Project[]> {
    const params = paginationToParams(pagination);
    return await client.get<Project[]>('/v1/projects', params);
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
