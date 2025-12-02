import { LiaraClient } from '../api/client.js';
import { DeployReleaseResponse, DeployReleaseRequest, DeploySourceResponse, PaginationOptions, paginationToParams } from '../api/types.js';
import { validateAppName, validateRequired, unwrapApiResponse } from '../utils/errors.js';
import { createReadStream } from 'fs';
import FormData from 'form-data';

/**
 * Upload source code for deployment
 * @param filePath - Path to the .tar.gz file to upload
 */
export async function uploadSource(
    client: LiaraClient,
    appName: string,
    filePath: string
): Promise<DeploySourceResponse> {
    validateAppName(appName);
    validateRequired(filePath, 'File path');

    // Create FormData with file stream
    const formData = new FormData();
    const fileName = filePath.split('/').pop() || 'source.tar.gz';
    formData.append('source', createReadStream(filePath), {
        filename: fileName,
        contentType: 'application/gzip',
    });

    return await client.postFormData<DeploySourceResponse>(
        `/v2/projects/${appName}/sources`,
        formData
    );
}

/**
 * Deploy release
 * Note: Source upload requires binary file handling which is handled separately
 */
export async function deployRelease(
    client: LiaraClient,
    appName: string,
    request: DeployReleaseRequest
): Promise<DeployReleaseResponse> {
    validateAppName(appName);
    validateRequired(request.sourceID, 'Source ID');

    return await client.post<DeployReleaseResponse>(
        `/v2/projects/${appName}/releases`,
        request
    );
}

/**
 * List releases for an app
 */
export async function listReleases(
    client: LiaraClient,
    appName: string,
    pagination?: PaginationOptions
): Promise<Array<{
    _id: string;
    releaseID: string;
    sourceID: string;
    status: string;
    createdAt: string;
}>> {
    validateAppName(appName);
    const params = paginationToParams(pagination);
    const response = await client.get<any>(`/v2/projects/${appName}/releases`, params);
    return unwrapApiResponse<Array<{
        _id: string;
        releaseID: string;
        sourceID: string;
        status: string;
        createdAt: string;
    }>>(response, ['releases', 'data', 'items']);
}

/**
 * Get details of a specific release
 */
export async function getRelease(
    client: LiaraClient,
    appName: string,
    releaseID: string
): Promise<{
    _id: string;
    releaseID: string;
    sourceID: string;
    status: string;
    createdAt: string;
    envVars?: Array<{ key: string; value: string }>;
}> {
    validateAppName(appName);
    validateRequired(releaseID, 'Release ID');
    return await client.get<{
        _id: string;
        releaseID: string;
        sourceID: string;
        status: string;
        createdAt: string;
        envVars?: Array<{ key: string; value: string }>;
    }>(`/v2/projects/${appName}/releases/${releaseID}`);
}

/**
 * Rollback to a previous release
 */
export async function rollbackRelease(
    client: LiaraClient,
    appName: string,
    releaseID: string
): Promise<{ message: string }> {
    validateAppName(appName);
    validateRequired(releaseID, 'Release ID');
    return await client.post<{ message: string }>(
        `/v2/projects/${appName}/releases/${releaseID}/rollback`
    );
}

/**
 * List sources for an app
 */
export async function listSources(
    client: LiaraClient,
    appName: string,
    pagination?: PaginationOptions
): Promise<Array<{
    _id: string;
    sourceID: string;
    status: string;
    createdAt: string;
    size?: number;
}>> {
    validateAppName(appName);
    const params = paginationToParams(pagination);
    const response = await client.get<any>(`/v2/projects/${appName}/sources`, params);
    return unwrapApiResponse<Array<{
        _id: string;
        sourceID: string;
        status: string;
        createdAt: string;
        size?: number;
    }>>(response, ['sources', 'data', 'items']);
}

/**
 * Delete a source
 */
export async function deleteSource(
    client: LiaraClient,
    appName: string,
    sourceID: string
): Promise<void> {
    validateAppName(appName);
    validateRequired(sourceID, 'Source ID');
    await client.delete(`/v2/projects/${appName}/sources/${sourceID}`);
}
