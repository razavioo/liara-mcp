import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as planService from '../../services/plans.js';
import { Plan } from '../../api/types.js';

describe('Plans Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
        } as any;
    });

    describe('listPlans', () => {
        it('should list all plans', async () => {
            const mockPlans: Plan[] = [
                {
                    _id: '1',
                    name: 'Starter',
                    cpu: 1,
                    memory: 512,
                    disk: 10,
                    price: 10,
                    type: 'app',
                },
            ];
            (mockClient.get as any).mockResolvedValue(mockPlans);

            const result = await planService.listPlans(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/plans', {});
            expect(result).toEqual(mockPlans);
        });

        it('should filter plans by type', async () => {
            const mockPlans: Plan[] = [];
            (mockClient.get as any).mockResolvedValue(mockPlans);

            await planService.listPlans(mockClient, 'app');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/plans', { type: 'app' });
        });

        it('should support pagination with type filter', async () => {
            const mockPlans: Plan[] = [];
            (mockClient.get as any).mockResolvedValue(mockPlans);

            await planService.listPlans(mockClient, 'database', { page: 2, perPage: 20 });

            expect(mockClient.get).toHaveBeenCalledWith('/v1/plans', {
                type: 'database',
                page: 2,
                perPage: 20,
            });
        });
    });

    describe('getPlan', () => {
        it('should get plan details', async () => {
            const mockPlan: Plan = {
                _id: 'plan1',
                name: 'Starter',
                cpu: 1,
                memory: 512,
                disk: 10,
                price: 10,
                type: 'app',
            };
            (mockClient.get as any).mockResolvedValue(mockPlan);

            const result = await planService.getPlan(mockClient, 'plan1');

            expect(mockClient.get).toHaveBeenCalledWith('/v1/plans/plan1');
            expect(result).toEqual(mockPlan);
        });
    });
});

