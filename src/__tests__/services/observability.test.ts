import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as observabilityService from '../../services/observability.js';
import { MetricsSummary, LogEntry } from '../../api/types.js';

describe('Observability Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
        } as any;
    });

    describe('getAppMetrics', () => {
        it('should get app metrics', async () => {
            const mockMetrics: MetricsSummary = {
                period: '1h',
                metrics: {
                    cpu: 50,
                    memory: 256,
                    disk: 5,
                    network: {
                        in: 1024,
                        out: 2048,
                    },
                    requests: 1000,
                },
            };
            (mockClient.get as any).mockResolvedValue(mockMetrics);

            const result = await observabilityService.getAppMetrics(mockClient, 'my-app');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects/my-app/metrics/summary', {});
            expect(result).toEqual(mockMetrics);
        });

        it('should get app metrics with period', async () => {
            const mockMetrics: MetricsSummary = {
                period: '24h',
                metrics: {
                    cpu: 50,
                    memory: 256,
                    disk: 5,
                    network: {
                        in: 1024,
                        out: 2048,
                    },
                },
            };
            (mockClient.get as any).mockResolvedValue(mockMetrics);

            const result = await observabilityService.getAppMetrics(
                mockClient,
                'my-app',
                '24h'
            );

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects/my-app/metrics/summary', {
                period: '24h',
            });
            expect(result).toEqual(mockMetrics);
        });
    });

    describe('getAppLogs', () => {
        it('should get app logs with default options', async () => {
            const mockLogs: LogEntry[] = [
                {
                    timestamp: '2024-01-01T00:00:00Z',
                    message: 'App started',
                    level: 'info',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockLogs);

            const result = await observabilityService.getAppLogs(mockClient, 'my-app');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects/my-app/logs', {});
            expect(result).toEqual(mockLogs);
        });

        it('should get app logs with all options', async () => {
            const mockLogs: LogEntry[] = [];
            (mockClient.get as any).mockResolvedValue(mockLogs);

            await observabilityService.getAppLogs(mockClient, 'my-app', {
                limit: 100,
                since: '2024-01-01T00:00:00Z',
                until: '2024-01-01T23:59:59Z',
            });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/projects/my-app/logs', {
                limit: 100,
                since: '2024-01-01T00:00:00Z',
                until: '2024-01-01T23:59:59Z',
            });
        });
    });
});

