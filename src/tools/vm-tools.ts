/**
 * VM (IaaS) tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getVmTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_vms',
            description: 'List all virtual machines',
            inputSchema: {
                type: 'object',
                properties: getPaginationProperties(),
            },
        },
        {
            name: 'liara_get_vm',
            description: 'Get details of a virtual machine',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                },
                required: ['vmId'],
            },
        },
        {
            name: 'liara_create_vm',
            description: 'Create a new virtual machine',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'VM name',
                    },
                    planID: {
                        type: 'string',
                        description: 'Plan ID for the VM',
                    },
                    os: {
                        type: 'string',
                        description: 'Operating system',
                    },
                    sshKey: {
                        type: 'string',
                        description: 'SSH public key (optional)',
                    },
                    network: {
                        type: 'string',
                        description: 'Network ID (required by the API)',
                    },
                },
                required: ['name', 'planID', 'os', 'network'],
            },
        },
        {
            name: 'liara_start_vm',
            description: 'Start a virtual machine',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                },
                required: ['vmId'],
            },
        },
        {
            name: 'liara_stop_vm',
            description: 'Stop a virtual machine',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                },
                required: ['vmId'],
            },
        },
        {
            name: 'liara_restart_vm',
            description: 'Restart a virtual machine',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                },
                required: ['vmId'],
            },
        },
        {
            name: 'liara_delete_vm',
            description: 'Delete a virtual machine',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID to delete',
                    },
                },
                required: ['vmId'],
            },
        },
        {
            name: 'liara_resize_vm',
            description: 'Resize a virtual machine (change plan)',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                    planID: {
                        type: 'string',
                        description: 'New plan ID',
                    },
                },
                required: ['vmId', 'planID'],
            },
        },
        {
            name: 'liara_create_snapshot',
            description: 'Create a VM snapshot',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                    name: {
                        type: 'string',
                        description: 'Snapshot name (optional)',
                    },
                },
                required: ['vmId'],
            },
        },
        {
            name: 'liara_list_snapshots',
            description: 'List VM snapshots',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                    ...getPaginationProperties(),
                },
                required: ['vmId'],
            },
        },
        {
            name: 'liara_restore_snapshot',
            description: 'Restore a VM from a snapshot',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                    snapshotId: {
                        type: 'string',
                        description: 'The snapshot ID',
                    },
                },
                required: ['vmId', 'snapshotId'],
            },
        },
        {
            name: 'liara_delete_snapshot',
            description: 'Delete a VM snapshot',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                    snapshotId: {
                        type: 'string',
                        description: 'The snapshot ID to delete',
                    },
                },
                required: ['vmId', 'snapshotId'],
            },
        },
        {
            name: 'liara_attach_network',
            description: 'Attach a network to a VM',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                    networkId: {
                        type: 'string',
                        description: 'The network ID',
                    },
                },
                required: ['vmId', 'networkId'],
            },
        },
        {
            name: 'liara_detach_network',
            description: 'Detach a network from a VM',
            inputSchema: {
                type: 'object',
                properties: {
                    vmId: {
                        type: 'string',
                        description: 'The VM ID',
                    },
                    networkId: {
                        type: 'string',
                        description: 'The network ID',
                    },
                },
                required: ['vmId', 'networkId'],
            },
        },
    ];
}
