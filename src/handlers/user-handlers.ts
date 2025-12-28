/**
 * User tool handlers
 */
import * as userService from '../services/user.js';
import { LiaraClient, ToolResult, jsonResponse } from './types.js';

export async function handleUserTools(
    client: LiaraClient,
    name: string,
    _args: any
): Promise<ToolResult | null> {
    switch (name) {
        case 'liara_get_user': {
            const userInfo = await userService.getUserInfo(client);
            return jsonResponse(userInfo);
        }

        default:
            return null;
    }
}
