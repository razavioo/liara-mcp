import { LiaraClient } from '../api/client.js';
import { Plan, PaginationOptions, paginationToParams } from '../api/types.js';
import { unwrapApiResponse } from '../utils/errors.js';

/**
 * List available plans
 * @param planType - Optional filter by plan type ('app', 'database', 'vm')
 */
export async function listPlans(
    client: LiaraClient,
    planType?: 'app' | 'database' | 'vm',
    pagination?: PaginationOptions
): Promise<Plan[]> {
    const params: any = planType ? { type: planType } : {};
    Object.assign(params, paginationToParams(pagination));
    const response = await client.get<any>('/v1/plans', params);
    return unwrapApiResponse<Plan[]>(response, ['plans', 'data', 'items']);
}

/**
 * Get a specific plan by ID
 */
export async function getPlan(
    client: LiaraClient,
    planId: string
): Promise<Plan> {
    return await client.get<Plan>(`/v1/plans/${planId}`);
}
