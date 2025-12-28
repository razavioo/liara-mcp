/**
 * Storage (Bucket) tool handlers
 */
import * as storageService from '../services/storage.js';
import { LiaraClient, ToolResult, extractPagination, successResponse, jsonResponse } from './types.js';

export async function handleStorageTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_buckets': {
            const buckets = await storageService.listBuckets(client, extractPagination(args));
            return jsonResponse(buckets);
        }

        case 'liara_get_bucket': {
            const bucket = await storageService.getBucket(client, args!.name as string);
            return jsonResponse(bucket);
        }

        case 'liara_create_bucket': {
            const bucket = await storageService.createBucket(client, args as any);
            return successResponse(`Bucket "${bucket.name}" created successfully.\n${JSON.stringify(bucket, null, 2)}`);
        }

        case 'liara_delete_bucket': {
            await storageService.deleteBucket(client, args!.name as string);
            return successResponse(`Bucket "${args!.name}" deleted successfully.`);
        }

        case 'liara_get_bucket_credentials': {
            const credentials = await storageService.getBucketCredentials(client, args!.name as string);
            return jsonResponse(credentials);
        }

        case 'liara_list_objects': {
            const objects = await storageService.listObjects(
                client,
                args!.bucketName as string,
                args?.prefix as string | undefined,
                args?.maxKeys as number | undefined
            );
            return jsonResponse(objects);
        }

        case 'liara_upload_object': {
            const result = await storageService.uploadObject(
                client,
                args!.bucketName as string,
                args!.objectKey as string,
                args!.filePath as string
            );
            return successResponse(result.message || `Object "${args!.objectKey}" uploaded successfully.`);
        }

        case 'liara_get_object_download_url': {
            const result = await storageService.getObjectDownloadUrl(
                client,
                args!.bucketName as string,
                args!.objectKey as string,
                args?.expiresIn as number | undefined
            );
            return jsonResponse(result);
        }

        case 'liara_delete_object': {
            await storageService.deleteObject(
                client,
                args!.bucketName as string,
                args!.objectKey as string
            );
            return successResponse(`Object "${args!.objectKey}" deleted successfully.`);
        }

        default:
            return null;
    }
}
