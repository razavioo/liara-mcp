/**
 * Deployment tool handlers
 */
import * as deployService from '../services/deployment.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleDeploymentTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_upload_source': {
            const result = await deployService.uploadSource(
                client,
                args!.appName as string,
                args!.filePath as string
            );
            return successResponse(`Source uploaded successfully. Source ID: ${result.sourceID}`);
        }

        case 'liara_deploy_release': {
            const result = await deployService.deployRelease(
                client,
                args!.appName as string,
                {
                    sourceID: args!.sourceID as string,
                    envVars: args!.envVars as any,
                }
            );
            return successResponse(`Deployment initiated. Release ID: ${result.releaseID}`);
        }

        case 'liara_list_releases': {
            const releases = await deployService.listReleases(
                client,
                args!.appName as string,
                extractPagination(args)
            );
            return jsonResponse(releases);
        }

        case 'liara_get_release': {
            const release = await deployService.getRelease(
                client,
                args!.appName as string,
                args!.releaseID as string
            );
            return jsonResponse(release);
        }

        case 'liara_rollback_release': {
            const result = await deployService.rollbackRelease(
                client,
                args!.appName as string,
                args!.releaseID as string
            );
            return successResponse(result.message || `Rolled back to release "${args!.releaseID}" successfully.`);
        }

        case 'liara_list_sources': {
            const sources = await deployService.listSources(
                client,
                args!.appName as string,
                extractPagination(args)
            );
            return jsonResponse(sources);
        }

        case 'liara_delete_source': {
            await deployService.deleteSource(
                client,
                args!.appName as string,
                args!.sourceID as string
            );
            return successResponse(`Source "${args!.sourceID}" deleted successfully.`);
        }

        default:
            return null;
    }
}
