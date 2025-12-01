import { LiaraClient } from '../api/client.js';

/**
 * User information response
 */
export interface UserInfo {
    _id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    plans?: {
        app?: any[];
        database?: any[];
        vm?: any[];
    };
    teams?: Array<{
        _id: string;
        name: string;
    }>;
    createdAt: string;
}

/**
 * Get comprehensive user information
 * This endpoint returns user account details, available plans, and database versions
 */
export async function getUserInfo(client: LiaraClient): Promise<UserInfo> {
    return await client.get<UserInfo>('/v1/me');
}

/**
 * List user accounts (for multi-account support)
 */
export async function listAccounts(client: LiaraClient): Promise<UserInfo[]> {
    // This might be a different endpoint, but for now we return the current user
    const userInfo = await getUserInfo(client);
    return [userInfo];
}

