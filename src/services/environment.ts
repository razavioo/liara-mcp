import { LiaraClient } from '../api/client.js';
import {
    EnvironmentVariable,
    UpdateEnvsRequest,
} from '../api/types.js';
import { validateAppName, validateEnvKey, validateRequired } from '../utils/errors.js';

/**
 * Update environment variables for an app
 */
export async function updateEnvVars(
    client: LiaraClient,
    appName: string,
    variables: EnvironmentVariable[]
): Promise<{ message: string }> {
    validateAppName(appName);
    validateRequired(variables, 'Variables');

    // Validate each environment variable
    for (const { key, value } of variables) {
        validateEnvKey(key);
        validateRequired(value, `Value for ${key}`);
    }

    const request: UpdateEnvsRequest = {
        project: appName,
        variables,
    };

    return await client.post<{ message: string }>('/v1/projects/update-envs', request);
}

/**
 * Helper to set a single environment variable
 */
export async function setEnvVar(
    client: LiaraClient,
    appName: string,
    key: string,
    value: string
): Promise<{ message: string }> {
    return await updateEnvVars(client, appName, [{ key, value }]);
}

/**
 * Get all environment variables for an app
 */
export async function getEnvVars(
    client: LiaraClient,
    appName: string
): Promise<EnvironmentVariable[]> {
    validateAppName(appName);
    const project = await client.get<any>(`/v1/projects/${appName}`);
    // API returns 'envs' array in project object
    const envs = project.envs || project.envVars || project.project?.envs || [];
    // Map to EnvironmentVariable format (extract key and value)
    return envs.map((env: any) => ({
        key: env.key || env.name,
        value: env.value || '',
    }));
}

/**
 * Delete/unset environment variables
 */
export async function deleteEnvVars(
    client: LiaraClient,
    appName: string,
    keys: string[]
): Promise<{ message: string }> {
    validateAppName(appName);
    validateRequired(keys, 'Environment variable keys');
    
    if (keys.length === 0) {
        throw new Error('At least one environment variable key is required');
    }

    // Get current env vars
    const currentVars = await getEnvVars(client, appName);
    
    // Filter out the keys to delete
    const updatedVars = currentVars.filter(v => !keys.includes(v.key));
    
    // Update with remaining vars
    const request: UpdateEnvsRequest = {
        project: appName,
        variables: updatedVars,
    };

    return await client.post<{ message: string }>('/v1/projects/update-envs', request);
}

/**
 * Delete/unset a single environment variable
 */
export async function deleteEnvVar(
    client: LiaraClient,
    appName: string,
    key: string
): Promise<{ message: string }> {
    return await deleteEnvVars(client, appName, [key]);
}
