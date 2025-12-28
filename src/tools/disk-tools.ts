/**
 * Disk tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getDiskTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_disks',
            description: 'List disks for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    ...getPaginationProperties(),
                },
                required: ['appName'],
            },
        },
        {
            name: 'liara_create_disk',
            description: 'Create a new disk for an app',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    name: {
                        type: 'string',
                        description: 'Disk name',
                    },
                    size: {
                        type: 'number',
                        description: 'Disk size in GB',
                    },
                    mountPath: {
                        type: 'string',
                        description: 'Mount path for the disk',
                    },
                },
                required: ['appName', 'name', 'size', 'mountPath'],
            },
        },
        {
            name: 'liara_delete_disk',
            description: 'Delete a disk',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    diskName: {
                        type: 'string',
                        description: 'The name of the disk to delete',
                    },
                },
                required: ['appName', 'diskName'],
            },
        },
        {
            name: 'liara_get_disk',
            description: 'Get details of a specific disk',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    diskName: {
                        type: 'string',
                        description: 'The name of the disk',
                    },
                },
                required: ['appName', 'diskName'],
            },
        },
        {
            name: 'liara_resize_disk',
            description: 'Resize a disk',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    diskName: {
                        type: 'string',
                        description: 'The name of the disk',
                    },
                    size: {
                        type: 'number',
                        description: 'New disk size in GB',
                    },
                },
                required: ['appName', 'diskName', 'size'],
            },
        },
        {
            name: 'liara_create_ftp_access',
            description: 'Create FTP access for a disk',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    diskName: {
                        type: 'string',
                        description: 'The name of the disk',
                    },
                },
                required: ['appName', 'diskName'],
            },
        },
        {
            name: 'liara_list_ftp_accesses',
            description: 'List FTP accesses for a disk',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    diskName: {
                        type: 'string',
                        description: 'The name of the disk',
                    },
                    ...getPaginationProperties(),
                },
                required: ['appName', 'diskName'],
            },
        },
        {
            name: 'liara_delete_ftp_access',
            description: 'Delete/revoke FTP access for a disk',
            inputSchema: {
                type: 'object',
                properties: {
                    appName: {
                        type: 'string',
                        description: 'The name of the app',
                    },
                    diskName: {
                        type: 'string',
                        description: 'The name of the disk',
                    },
                    ftpId: {
                        type: 'string',
                        description: 'The FTP access ID to delete',
                    },
                },
                required: ['appName', 'diskName', 'ftpId'],
            },
        },
    ];
}
