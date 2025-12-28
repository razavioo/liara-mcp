/**
 * Mail tool definitions
 */
import { ToolDefinition, getPaginationProperties } from './types.js';

export function getMailTools(): ToolDefinition[] {
    return [
        {
            name: 'liara_list_mail_servers',
            description: 'List all mail servers',
            inputSchema: {
                type: 'object',
                properties: getPaginationProperties(),
            },
        },
        {
            name: 'liara_get_mail_server',
            description: 'Get details of a mail server',
            inputSchema: {
                type: 'object',
                properties: {
                    mailId: {
                        type: 'string',
                        description: 'The mail server ID',
                    },
                },
                required: ['mailId'],
            },
        },
        {
            name: 'liara_create_mail_server',
            description: 'Create a new mail server',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Mail server name',
                    },
                    mode: {
                        type: 'string',
                        description: 'Mail server mode',
                        enum: ['DEV', 'LIVE'],
                    },
                    planID: {
                        type: 'string',
                        description: 'Plan ID for the mail server (required)',
                    },
                    domain: {
                        type: 'string',
                        description: 'Domain name for the mail server (required)',
                    },
                },
                required: ['planID', 'domain'],
            },
        },
        {
            name: 'liara_delete_mail_server',
            description: 'Delete a mail server',
            inputSchema: {
                type: 'object',
                properties: {
                    mailId: {
                        type: 'string',
                        description: 'The mail server ID to delete',
                    },
                },
                required: ['mailId'],
            },
        },
        {
            name: 'liara_send_email',
            description: 'Send an email via a mail server',
            inputSchema: {
                type: 'object',
                properties: {
                    mailId: {
                        type: 'string',
                        description: 'The mail server ID',
                    },
                    from: {
                        type: 'string',
                        description: 'From email address',
                    },
                    to: {
                        type: 'string',
                        description: 'To email address(es) - comma-separated for multiple',
                    },
                    subject: {
                        type: 'string',
                        description: 'Email subject',
                    },
                    html: {
                        type: 'string',
                        description: 'HTML email content (optional)',
                    },
                    text: {
                        type: 'string',
                        description: 'Plain text email content (optional)',
                    },
                },
                required: ['mailId', 'from', 'to', 'subject'],
            },
        },
        {
            name: 'liara_start_mail_server',
            description: 'Start a mail server',
            inputSchema: {
                type: 'object',
                properties: {
                    mailId: {
                        type: 'string',
                        description: 'The mail server ID',
                    },
                },
                required: ['mailId'],
            },
        },
        {
            name: 'liara_stop_mail_server',
            description: 'Stop a mail server',
            inputSchema: {
                type: 'object',
                properties: {
                    mailId: {
                        type: 'string',
                        description: 'The mail server ID',
                    },
                },
                required: ['mailId'],
            },
        },
        {
            name: 'liara_restart_mail_server',
            description: 'Restart a mail server',
            inputSchema: {
                type: 'object',
                properties: {
                    mailId: {
                        type: 'string',
                        description: 'The mail server ID',
                    },
                },
                required: ['mailId'],
            },
        },
    ];
}
