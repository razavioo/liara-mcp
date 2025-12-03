import { LiaraClient } from '../api/client.js';
import {
    MailServer,
    SendEmailRequest,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateRequired, unwrapApiResponse } from '../utils/errors.js';

/**
 * List all mail servers
 */
export async function listMailServers(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<MailServer[]> {
    const params = paginationToParams(pagination);
    const response = await client.get<any>('/v1/mails', params);
    return unwrapApiResponse<MailServer[]>(response, ['mails', 'mailServers', 'data', 'items']);
}

/**
 * Get details of a specific mail server
 */
export async function getMailServer(
    client: LiaraClient,
    mailId: string
): Promise<MailServer> {
    validateRequired(mailId, 'Mail server ID');
    return await client.get<MailServer>(`/v1/mails/${mailId}`);
}

/**
 * Create a new mail server
 */
export async function createMailServer(
    client: LiaraClient,
    name: string,
    mode?: 'smtp' | 'api'
): Promise<MailServer> {
    validateRequired(name, 'Mail server name');
    const requestBody: { name: string; mode?: 'smtp' | 'api' } = { name };
    if (mode) {
        requestBody.mode = mode;
    } else {
        // Default to 'api' if mode is not provided
        requestBody.mode = 'api';
    }
    const response = await client.post<any>('/v1/mails', requestBody);
    return unwrapApiResponse<MailServer>(response, ['mail', 'mailServer', 'data']);
}

/**
 * Delete a mail server
 */
export async function deleteMailServer(
    client: LiaraClient,
    mailId: string
): Promise<void> {
    validateRequired(mailId, 'Mail server ID');
    await client.delete(`/v1/mails/${mailId}`);
}

/**
 * Send an email
 */
export async function sendEmail(
    client: LiaraClient,
    mailId: string,
    request: SendEmailRequest
): Promise<{ message: string; messageId?: string }> {
    validateRequired(mailId, 'Mail server ID');
    validateRequired(request.from, 'From address');
    validateRequired(request.to, 'To address');
    validateRequired(request.subject, 'Subject');

    if (!request.html && !request.text) {
        throw new Error('Either html or text content is required');
    }

    return await client.post<{ message: string; messageId?: string }>(
        `/v1/mails/${mailId}/send`,
        request
    );
}

/**
 * Start a mail server
 */
export async function startMailServer(
    client: LiaraClient,
    mailId: string
): Promise<void> {
    validateRequired(mailId, 'Mail server ID');
    await client.post(`/v1/mails/${mailId}/actions/start`);
}

/**
 * Stop a mail server
 */
export async function stopMailServer(
    client: LiaraClient,
    mailId: string
): Promise<void> {
    validateRequired(mailId, 'Mail server ID');
    await client.post(`/v1/mails/${mailId}/actions/stop`);
}

/**
 * Restart a mail server
 */
export async function restartMailServer(
    client: LiaraClient,
    mailId: string
): Promise<void> {
    validateRequired(mailId, 'Mail server ID');
    await client.post(`/v1/mails/${mailId}/actions/restart`);
}

