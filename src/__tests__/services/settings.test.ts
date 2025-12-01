import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as settingsService from '../../services/settings.js';

describe('Settings Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            post: vi.fn(),
        } as any;
    });

    describe('setZeroDowntime', () => {
        it('should enable zero-downtime deployment', async () => {
            (mockClient.post as any).mockResolvedValue({ message: 'Enabled' });

            const result = await settingsService.setZeroDowntime(mockClient, 'my-app', true);

            expect(mockClient.post).toHaveBeenCalledWith(
                '/v1/projects/my-app/zero-downtime/enable'
            );
            expect(result.message).toBe('Enabled');
        });

        it('should disable zero-downtime deployment', async () => {
            (mockClient.post as any).mockResolvedValue({ message: 'Disabled' });

            const result = await settingsService.setZeroDowntime(mockClient, 'my-app', false);

            expect(mockClient.post).toHaveBeenCalledWith(
                '/v1/projects/my-app/zero-downtime/disable'
            );
            expect(result.message).toBe('Disabled');
        });
    });

    describe('setFixedIP', () => {
        it('should enable static IP and return IP address', async () => {
            (mockClient.post as any).mockResolvedValue({
                message: 'Enabled',
                IP: '192.168.1.100',
            });

            const result = await settingsService.setFixedIP(mockClient, 'my-app', true);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/fixed-ip/enable');
            expect(result.IP).toBe('192.168.1.100');
        });
    });

    describe('setReadOnly', () => {
        it('should enable read-only mode', async () => {
            (mockClient.post as any).mockResolvedValue({ message: 'Enabled' });

            const result = await settingsService.setReadOnly(mockClient, 'my-app', true);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/projects/my-app/read-only/enable');
            expect(result.message).toBe('Enabled');
        });
    });
});
