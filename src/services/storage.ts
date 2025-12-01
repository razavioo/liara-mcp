import { LiaraClient } from '../api/client.js';
import {
    Bucket,
    BucketCredentials,
    CreateBucketRequest,
} from '../api/types.js';
import { validateRequired } from '../utils/errors.js';
import { createReadStream } from 'fs';
import FormData from 'form-data';

/**
 * List all buckets
 */
export async function listBuckets(client: LiaraClient): Promise<Bucket[]> {
    return await client.get<Bucket[]>('/v1/buckets');
}

/**
 * Get details of a specific bucket
 */
export async function getBucket(
    client: LiaraClient,
    name: string
): Promise<Bucket> {
    validateRequired(name, 'Bucket name');
    return await client.get<Bucket>(`/v1/buckets/${name}`);
}

/**
 * Create a new bucket
 */
export async function createBucket(
    client: LiaraClient,
    request: CreateBucketRequest
): Promise<Bucket> {
    validateRequired(request.name, 'Bucket name');

    return await client.post<Bucket>('/v1/buckets', request);
}

/**
 * Delete a bucket
 */
export async function deleteBucket(
    client: LiaraClient,
    name: string
): Promise<void> {
    validateRequired(name, 'Bucket name');
    await client.delete(`/v1/buckets/${name}`);
}

/**
 * Get bucket credentials (S3-compatible access keys)
 */
export async function getBucketCredentials(
    client: LiaraClient,
    name: string
): Promise<BucketCredentials> {
    validateRequired(name, 'Bucket name');
    return await client.get<BucketCredentials>(`/v1/buckets/${name}/credentials`);
}

/**
 * List objects in a bucket
 */
export async function listObjects(
    client: LiaraClient,
    bucketName: string,
    prefix?: string,
    maxKeys?: number
): Promise<Array<{
    key: string;
    size: number;
    lastModified: string;
    etag?: string;
}>> {
    validateRequired(bucketName, 'Bucket name');
    const params: any = {};
    if (prefix) params.prefix = prefix;
    if (maxKeys) params.maxKeys = maxKeys;
    
    return await client.get<Array<{
        key: string;
        size: number;
        lastModified: string;
        etag?: string;
    }>>(`/v1/buckets/${bucketName}/objects`, params);
}

/**
 * Upload an object to a bucket
 */
export async function uploadObject(
    client: LiaraClient,
    bucketName: string,
    objectKey: string,
    filePath: string
): Promise<{ message: string; etag?: string }> {
    validateRequired(bucketName, 'Bucket name');
    validateRequired(objectKey, 'Object key');
    validateRequired(filePath, 'File path');
    
    // Note: This would typically use multipart/form-data or direct file upload
    // For now, we'll use a generic POST endpoint
    const formData = new FormData();
    const fileName = filePath.split('/').pop() || objectKey;
    formData.append('file', createReadStream(filePath), {
        filename: fileName,
    });
    formData.append('key', objectKey);
    
    return await client.postFormData<{ message: string; etag?: string }>(
        `/v1/buckets/${bucketName}/objects`,
        formData
    );
}

/**
 * Get download URL for an object
 */
export async function getObjectDownloadUrl(
    client: LiaraClient,
    bucketName: string,
    objectKey: string,
    expiresIn?: number
): Promise<{ url: string; expiresAt?: string }> {
    validateRequired(bucketName, 'Bucket name');
    validateRequired(objectKey, 'Object key');
    
    const params: any = {};
    if (expiresIn) params.expiresIn = expiresIn;
    
    return await client.get<{ url: string; expiresAt?: string }>(
        `/v1/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}/download`,
        params
    );
}

/**
 * Delete an object from a bucket
 */
export async function deleteObject(
    client: LiaraClient,
    bucketName: string,
    objectKey: string
): Promise<void> {
    validateRequired(bucketName, 'Bucket name');
    validateRequired(objectKey, 'Object key');
    
    await client.delete(`/v1/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`);
}

/**
 * Get object metadata
 */
export async function getObjectMetadata(
    client: LiaraClient,
    bucketName: string,
    objectKey: string
): Promise<{
    key: string;
    size: number;
    lastModified: string;
    contentType?: string;
    etag?: string;
}> {
    validateRequired(bucketName, 'Bucket name');
    validateRequired(objectKey, 'Object key');
    
    return await client.get<{
        key: string;
        size: number;
        lastModified: string;
        contentType?: string;
        etag?: string;
    }>(`/v1/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}/metadata`);
}
