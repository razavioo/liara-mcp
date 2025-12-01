import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as mailService from '../../services/mail.js';
import { MailServer, SendEmailRequest } from '../../api/types.js';

describe('Mail Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;
    });

    describe('listMailServers', () => {
        it('should list mail servers with pagination', async () => {
            const mockServers: MailServer[] = [
                {
                    _id: '1',
                    name: 'mail1',
                    mode: 'api',
                    status: 'ACTIVE',
                    createdAt: '2024-01-01',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockServers);

            const result = await mailService.listMailServers(mockClient, { page: 1, perPage: 10 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/mails', {
                page: 1,
                perPage: 10,
            });
            expect(result).toEqual(mockServers);
        });
    });

    describe('createMailServer', () => {
        it('should create a mail server with default mode', async () => {
            const mockServer: MailServer = {
                _id: '1',
                name: 'my-mail',
                mode: 'api',
                status: 'ACTIVE',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockServer);

            const result = await mailService.createMailServer(mockClient, 'my-mail');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/mails', {
                name: 'my-mail',
                mode: 'api',
            });
            expect(result).toEqual(mockServer);
        });

        it('should create a mail server with specified mode', async () => {
            const mockServer: MailServer = {
                _id: '1',
                name: 'my-mail',
                mode: 'smtp',
                status: 'ACTIVE',
                createdAt: '2024-01-01',
            };
            (mockClient.post as any).mockResolvedValue(mockServer);

            const result = await mailService.createMailServer(mockClient, 'my-mail', 'smtp');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/mails', {
                name: 'my-mail',
                mode: 'smtp',
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
            (mockClient.post as any).mockResolvedValue({ message: 'Sent', messageId: 'msg-123' });

            const result = await mailService.sendEmail(mockClient, 'mail1', request);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/mails/mail1/send', request);
            expect(result.message).toBe('Sent');
        });

        it('should send email with text content', async () => {
            const request: SendEmailRequest = {
                from: 'sender@example.com',
                to: 'recipient@example.com',
                subject: 'Test',
                text: 'Hello',
            };
            (mockClient.post as any).mockResolvedValue({ message: 'Sent' });

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
            (mockClient.post as any).mockResolvedValue(undefined);

            await mailService.startMailServer(mockClient, 'mail1');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/mails/mail1/actions/start');
        });

        it('should stop mail server', async () => {
            (mockClient.post as any).mockResolvedValue(undefined);

            await mailService.stopMailServer(mockClient, 'mail1');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/mails/mail1/actions/stop');
        });

        it('should restart mail server', async () => {
            (mockClient.post as any).mockResolvedValue(undefined);

            await mailService.restartMailServer(mockClient, 'mail1');

            expect(mockClient.post).toHaveBeenCalledWith('/v1/mails/mail1/actions/restart');
        });
    });
});

