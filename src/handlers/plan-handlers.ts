/**
 * Plan tool handlers
 */
import * as planService from '../services/plans.js';
import { LiaraClient, ToolResult, extractPagination, jsonResponse } from './types.js';

export async function handlePlanTools(
    client: LiaraClient,
    name: string,
    args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_list_plans': {
            const plans = await planService.listPlans(
                client,
                args?.planType as 'app' | 'database' | 'vm' | undefined,
                extractPagination(args)
            );
            return jsonResponse(plans);
        }

        case 'liara_get_plan': {
            const plan = await planService.getPlan(client, args!.planId as string);
            return jsonResponse(plan);
        }

        default:
            return null;
    }
}
