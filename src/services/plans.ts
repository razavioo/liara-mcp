import { LiaraClient } from '../api/client.js';
import { Plan } from '../api/types.js';

/**
 * List available plans
 * @param planType - Optional filter by plan type ('app', 'database', 'vm')
 */
export async function listPlans(
    client: LiaraClient,
    planType?: 'app' | 'database' | 'vm'
): Promise<Plan[]> {
    const params = planType ? { type: planType } : {};
    return await client.get<Plan[]>('/v1/plans', params);
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
