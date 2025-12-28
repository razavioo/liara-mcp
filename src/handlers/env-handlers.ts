/**
 * Environment variable tool handlers
 */
import * as envService from '../services/environment.js';
import { LiaraClient, ToolResult, successResponse, jsonResponse } from './types.js';

export async function handleEnvTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_set_env_vars': {
            const result = await envService.updateEnvVars(
                client,
                args!.appName as string,
                args!.variables as any[]
            );
            return successResponse(result.message || 'Environment variables updated successfully.');
        }

        case 'liara_set_env_var': {
            const result = await envService.setEnvVar(
                client,
                args!.appName as string,
                args!.key as string,
                args!.value as string
            );
            return successResponse(result.message || `Environment variable ${args!.key} set successfully.`);
        }

        case 'liara_get_env_vars': {
            const envVars = await envService.getEnvVars(client, args!.appName as string);
            return jsonResponse(envVars);
        }

        case 'liara_delete_env_var': {
            const result = await envService.deleteEnvVar(
                client,
                args!.appName as string,
                args!.key as string
            );
            return successResponse(result.message || `Environment variable ${args!.key} deleted successfully.`);
        }

        case 'liara_delete_env_vars': {
            const result = await envService.deleteEnvVars(
                client,
                args!.appName as string,
                args!.keys as string[]
            );
            return successResponse(result.message || 'Environment variables deleted successfully.');
        }

        default:
            return null;
    }
}
