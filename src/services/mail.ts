import { LiaraClient } from '../api/client.js';
import {
    MailServer,
    SendEmailRequest,
    PaginationOptions,
    paginationToParams,
} from '../api/types.js';
import { validateRequired, unwrapApiResponse } from '../utils/errors.js';

/**
 * Create a specialized Mail service client with the Mail API base URL
 */
function createMailClient(client: LiaraClient): LiaraClient {
    // Access the internal client to get the API token
    const internalClient = (client as any).client;
    const apiToken = internalClient?.defaults?.headers?.Authorization?.replace('Bearer ', '') || 
                     process.env.LIARA_API_TOKEN;
    const teamId = (client as any).teamId || process.env.LIARA_TEAM_ID;

    if (!apiToken) {
        throw new Error('API token is required for Mail operations');
    }

    // Create new client with Mail service base URL
    return new LiaraClient({
        apiToken,
        teamId,
        baseURL: 'https://mail-service.liara.ir/api',
    });
}

/**
 * List all mail servers
 */
export async function listMailServers(
    client: LiaraClient,
    pagination?: PaginationOptions
): Promise<MailServer[]> {
    const mailClient = createMailClient(client);
    const params = paginationToParams(pagination);
    const response = await mailClient.get<any>('/v1/mails', params);
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
    const mailClient = createMailClient(client);
    return await mailClient.get<MailServer>(`/v1/mails/${mailId}`);
}

/**
 * Create a new mail server
 */
export async function createMailServer(
    client: LiaraClient,
    name: string,
    mode?: 'DEV' | 'LIVE',
    planID?: string,
    domain?: string
): Promise<MailServer> {
    validateRequired(name, 'Mail server name');
    validateRequired(planID, 'Plan ID');
    validateRequired(domain, 'Domain');
    const requestBody: { name: string; mode?: 'DEV' | 'LIVE'; plan?: string; planID?: string; domain?: string } = { 
        name,
        domain: domain!,
    };
    if (mode) {
        requestBody.mode = mode;
    } else {
        // Default to 'DEV' if mode is not provided
        requestBody.mode = 'DEV';
    }
    if (planID) {
        requestBody.plan = planID;
        requestBody.planID = planID;
    }
    const mailClient = createMailClient(client);
    const response = await mailClient.post<any>('/v1/mails', requestBody);
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
    const mailClient = createMailClient(client);
    await mailClient.delete(`/v1/mails/${mailId}`);
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

    const mailClient = createMailClient(client);
    return await mailClient.post<{ message: string; messageId?: string }>(
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
    const mailClient = createMailClient(client);
    await mailClient.post(`/v1/mails/${mailId}/actions/start`);
}

/**
 * Stop a mail server
 */
export async function stopMailServer(
    client: LiaraClient,
    mailId: string
): Promise<void> {
    validateRequired(mailId, 'Mail server ID');
    const mailClient = createMailClient(client);
    await mailClient.post(`/v1/mails/${mailId}/actions/stop`);
}

/**
 * Restart a mail server
 */
export async function restartMailServer(
    client: LiaraClient,
    mailId: string
): Promise<void> {
    validateRequired(mailId, 'Mail server ID');
    const mailClient = createMailClient(client);
    await mailClient.post(`/v1/mails/${mailId}/actions/restart`);
}

