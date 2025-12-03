import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as mailService from '../../services/mail.js';
import { MailServer, SendEmailRequest } from '../../api/types.js';

// Mock LiaraClient
vi.mock('../../api/client.js', () => {
    const mockMailClient = {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    };

    return {
        LiaraClient: vi.fn().mockImplementation(() => mockMailClient),
        createLiaraClient: vi.fn(),
    };
});

describe('Mail Service', () => {
    let mockClient: LiaraClient;
    let mockMailClient: LiaraClient;

    beforeEach(() => {
        mockMailClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;

        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
            client: {
                defaults: {
                    headers: {
                        Authorization: 'Bearer test-token',
                    },
                },
            },
        } as any;

        // Mock process.env for Mail client creation
        process.env.LIARA_API_TOKEN = 'test-token';

        // Mock LiaraClient constructor to return our mock mail client
        (LiaraClient as any).mockImplementation(() => mockMailClient);
    });

    describe('listMailServers', () => {
        it('should list mail servers with pagination', async () => {
            const mockServers: MailServer[] = [
                {
                    _id: '1',
                    name: 'mail1',
                    mode: 'DEV',
                    status: 'ACTIVE',
                    createdAt: '2024-01-01',
                },
            ];
            (mockMailClient.get as any).mockResolvedValue(mockServers);

            const result = await mailService.listMailServers(mockClient, { page: 1, perPage: 10 });

            expect(mockMailClient.get).toHaveBeenCalledWith('/v1/mails', {
                page: 1,
                perPage: 10,
            });
            expect(result).toEqual(mockServers);
        });
    });

    describe('createMailServer', () => {
        it('should create a mail server with default mode, plan, and domain', async () => {
            const mockServer: MailServer = {
                _id: '1',
                name: 'my-mail',
                mode: 'DEV',
                status: 'ACTIVE',
                createdAt: '2024-01-01',
            };
            (mockMailClient.post as any).mockResolvedValue(mockServer);

            const result = await mailService.createMailServer(mockClient, 'my-mail', undefined, 'plan-123', 'example.com');

            expect(mockMailClient.post).toHaveBeenCalledWith('/v1/mails', {
                mode: 'DEV',
                plan: 'plan-123',
                planID: 'plan-123',
                domain: 'example.com',
            });
            expect(result).toEqual(mockServer);
        });

        it('should create a mail server with specified mode, plan, and domain', async () => {
            const mockServer: MailServer = {
                _id: '1',
                name: 'my-mail',
                mode: 'LIVE',
                status: 'ACTIVE',
                createdAt: '2024-01-01',
            };
            (mockMailClient.post as any).mockResolvedValue(mockServer);

            const result = await mailService.createMailServer(mockClient, 'my-mail', 'LIVE', 'plan-456', 'test.com');

            expect(mockMailClient.post).toHaveBeenCalledWith('/v1/mails', {
                mode: 'LIVE',
                plan: 'plan-456',
                planID: 'plan-456',
                domain: 'test.com',
            });
            expect(result).toEqual(mockServer);
        });
    });

    describe('sendEmail', () => {
        it('should send email with HTML content', async () => {
            const request: SendEmailRequest = {
                from: 'sender@example.com',
                to: 'recipient@example.com',
                subject: 'Test',
                html: '<p>Hello</p>',
            };
            (mockMailClient.post as any).mockResolvedValue({ message: 'Sent', messageId: 'msg-123' });

            const result = await mailService.sendEmail(mockClient, 'mail1', request);

            expect(mockMailClient.post).toHaveBeenCalledWith('/v1/mails/mail1/send', request);
            expect(result.message).toBe('Sent');
        });

        it('should send email with text content', async () => {
            const request: SendEmailRequest = {
                from: 'sender@example.com',
                to: 'recipient@example.com',
                subject: 'Test',
                text: 'Hello',
            };
            (mockMailClient.post as any).mockResolvedValue({ message: 'Sent' });

            const result = await mailService.sendEmail(mockClient, 'mail1', request);

            expect(result.message).toBe('Sent');
        });

        it('should reject email without content', async () => {
            const request: SendEmailRequest = {
                from: 'sender@example.com',
                to: 'recipient@example.com',
                subject: 'Test',
            };

            await expect(
                mailService.sendEmail(mockClient, 'mail1', request)
            ).rejects.toThrow('Either html or text content is required');
        });
    });

    describe('lifecycle operations', () => {
        it('should start mail server', async () => {
            (mockMailClient.post as any).mockResolvedValue(undefined);

            await mailService.startMailServer(mockClient, 'mail1');

            expect(mockMailClient.post).toHaveBeenCalledWith('/v1/mails/mail1/actions/start');
        });

        it('should stop mail server', async () => {
            (mockMailClient.post as any).mockResolvedValue(undefined);

            await mailService.stopMailServer(mockClient, 'mail1');

            expect(mockMailClient.post).toHaveBeenCalledWith('/v1/mails/mail1/actions/stop');
        });

        it('should restart mail server', async () => {
            (mockMailClient.post as any).mockResolvedValue(undefined);

            await mailService.restartMailServer(mockClient, 'mail1');

            expect(mockMailClient.post).toHaveBeenCalledWith('/v1/mails/mail1/actions/restart');
        });
    });
});

