import { LiaraClient } from '../api/client.js';

/**
 * User information response from API
 */
export interface UserInfoResponse {
    user: {
        _id: string;
        email: string;
        fullname?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        nationalCode?: string;
        joined_at?: string;
        freeCreditTime?: number;
        remainingFreeCredit?: number;
        hasPassword?: boolean;
        emailVerifiedAt?: string;
        phoneVerifiedAt?: string;
        isVerified?: boolean;
        storage?: {
            namespace: string;
            status: string;
        };
        avatar?: string;
        twoFA?: boolean;
        isEmailChangeDeadline?: boolean;
        isPhoneChangeDeadline?: boolean;
        isTeam?: boolean;
        hasFreeVM?: boolean;
        accountType?: string;
        minCreditAmount?: number;
        isManualMinCredit?: boolean;
        legacyNetworkFeature?: boolean;
        hasSucceedPayment?: boolean;
        privateNetworkFeature?: boolean;
        legacyObjectStorageFeature?: boolean;
        legacyDomainsFeature?: boolean;
        currentSubscriptionPlan?: any;
        gitProviderIntegrations?: any[];
        gitRepositoryIntegrations?: any[];
    };
    databaseVersions?: {
        mysql?: Array<{ label: string; value: string }>;
        mariadb?: Array<{ label: string; value: string }>;
        postgres?: Array<{ label: string; value: string; postgisValue?: string; pgvectorValue?: string }>;
        mssql?: Array<{ label: string; value: string }>;
        mongodb?: Array<{ label: string; value: string }>;
        redis?: Array<{ label: string; value: string }>;
        elasticsearch?: Array<{ label: string; value: string }>;
        rabbitmq?: Array<{ label: string; value: string }>;
    };
    defaultDatabaseVersions?: {
        mysql?: string;
        mariadb?: string;
        postgres?: string;
        mssql?: string;
        mongodb?: string;
        redis?: string;
        elasticsearch?: string;
        rabbitmq?: string;
    };
    plans?: {
        mail?: any;
        projects?: any;
    };
}

/**
 * User information (simplified for backward compatibility)
 */
export interface UserInfo {
    _id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    fullname?: string;
    phone?: string;
    plans?: {
        app?: any[];
        database?: any[];
        vm?: any[];
        mail?: any;
        projects?: any;
    };
    teams?: Array<{
        _id: string;
        name: string;
    }>;
    createdAt?: string;
    joined_at?: string;
    databaseVersions?: any;
    defaultDatabaseVersions?: any;
    [key: string]: any; // Allow additional fields
}

/**
 * Get comprehensive user information
 * This endpoint returns user account details, available plans, and database versions
 */
export async function getUserInfo(client: LiaraClient): Promise<UserInfo> {
    const response = await client.get<UserInfoResponse>('/v1/me');
    
    // Transform the API response to match the expected format
    const userInfo: UserInfo = {
        // Core user fields
        ...response.user,
        // Override with specific mappings
        createdAt: response.user.joined_at,
        // Add plans and database versions
        plans: {
            mail: response.plans?.mail,
            projects: response.plans?.projects,
        },
        databaseVersions: response.databaseVersions,
        defaultDatabaseVersions: response.defaultDatabaseVersions,
    };
    
    return userInfo;
}

/**
 * List user accounts (for multi-account support)
 */
export async function listAccounts(client: LiaraClient): Promise<UserInfo[]> {
    // This might be a different endpoint, but for now we return the current user
    const userInfo = await getUserInfo(client);
    return [userInfo];
}






