/**
 * Storage (Bucket) tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getStorageTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_buckets',
            description: 'List all storage buckets',
            inputSchema: {
                type: 'object',
                properties: getPaginationProperties(),
            },
        },
        {
            name: 'liara_get_bucket',
            description: 'Get details of a specific bucket',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the bucket',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_create_bucket',
            description: 'Create a new storage bucket',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Bucket name',
                    },
                    region: {
                        type: 'string',
                        description: 'Region (optional)',
                    },
                    permission: {
                        type: 'string',
                        description: 'Permission level',
                        enum: ['private', 'public-read'],
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_delete_bucket',
            description: 'Delete a storage bucket',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the bucket to delete',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_get_bucket_credentials',
            description: 'Get S3-compatible credentials for a bucket',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the bucket',
                    },
                },
                required: ['name'],
            },
        },
        {
            name: 'liara_list_objects',
            description: 'List objects in a bucket',
            inputSchema: {
                type: 'object',
                properties: {
                    bucketName: {
                        type: 'string',
                        description: 'The name of the bucket',
                    },
                    prefix: {
                        type: 'string',
                        description: 'Prefix to filter objects (optional)',
                    },
                    maxKeys: {
                        type: 'number',
                        description: 'Maximum number of objects to return (optional)',
                    },
                },
                required: ['bucketName'],
            },
        },
        {
            name: 'liara_upload_object',
            description: 'Upload an object to a bucket',
            inputSchema: {
                type: 'object',
                properties: {
                    bucketName: {
                        type: 'string',
                        description: 'The name of the bucket',
                    },
                    objectKey: {
                        type: 'string',
                        description: 'The object key (path)',
                    },
                    filePath: {
                        type: 'string',
                        description: 'Path to the file to upload',
                    },
                },
                required: ['bucketName', 'objectKey', 'filePath'],
            },
        },
        {
            name: 'liara_get_object_download_url',
            description: 'Get download URL for an object',
            inputSchema: {
                type: 'object',
                properties: {
                    bucketName: {
                        type: 'string',
                        description: 'The name of the bucket',
                    },
                    objectKey: {
                        type: 'string',
                        description: 'The object key',
                    },
                    expiresIn: {
                        type: 'number',
                        description: 'URL expiration time in seconds (optional)',
                    },
                },
                required: ['bucketName', 'objectKey'],
            },
        },
        {
            name: 'liara_delete_object',
            description: 'Delete an object from a bucket',
            inputSchema: {
                type: 'object',
                properties: {
                    bucketName: {
                        type: 'string',
                        description: 'The name of the bucket',
                    },
                    objectKey: {
                        type: 'string',
                        description: 'The object key to delete',
                    },
                },
                required: ['bucketName', 'objectKey'],
            },
        },
    ];
}
