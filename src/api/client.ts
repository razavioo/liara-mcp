import axios, { AxiosInstance, AxiosError } from 'axios';
import { LiaraApiError } from './types.js';

/**
 * Configuration for Liara API client
 */
export interface LiaraClientConfig {
    apiToken: string;
    teamId?: string;
    baseURL?: string;
}

/**
 * Liara API client for making authenticated requests
 */
export class LiaraClient {
    private client: AxiosInstance;
    private teamId?: string;

    constructor(config: LiaraClientConfig) {
        const baseURL = config.baseURL || process.env.LIARA_API_BASE_URL || 'https://api.iran.liara.ir';

        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
        });

        this.teamId = config.teamId;

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError<LiaraApiError>) => {
                return Promise.reject(this.handleError(error));
            }
        );
    }

    /**
     * Handle API errors and convert to user-friendly messages
     */
    private handleError(error: AxiosError<LiaraApiError>): Error {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            let message = data?.message || data?.error || 'Unknown API error';

            switch (status) {
                case 401:
                    message = 'Authentication failed. Please check your API token.';
                    break;
                case 403:
                    message = 'Access forbidden. You may not have permission for this operation.';
                    break;
                case 404:
                    message = data?.message || 'Resource not found.';
                    break;
                case 409:
                    message = data?.message || 'Conflict: Resource already exists or operation cannot be completed.';
                    break;
                case 429:
                    message = 'Rate limit exceeded. Please try again later.';
                    break;
                case 500:
                case 502:
                case 503:
                    message = 'Liara API is temporarily unavailable. Please try again later.';
                    break;
            }

            const apiError = new Error(message);
            (apiError as any).statusCode = status;
            (apiError as any).originalError = data;
            return apiError;
        } else if (error.request) {
            return new Error('Unable to connect to Liara API. Please check your internet connection.');
        } else {
            return new Error(error.message || 'An unexpected error occurred.');
        }
    }

    /**
     * Add team ID parameter to request if configured
     */
    private addTeamId(params: any = {}): any {
        if (this.teamId) {
            return { ...params, teamID: this.teamId };
        }
        return params;
    }

    /**
     * GET request
     */
    async get<T>(url: string, params?: any): Promise<T> {
        const response = await this.client.get<T>(url, {
            params: this.addTeamId(params)
        });
        return response.data;
    }

    /**
     * POST request
     */
    async post<T>(url: string, data?: any, params?: any): Promise<T> {
        const response = await this.client.post<T>(url, data, {
            params: this.addTeamId(params)
        });
        return response.data;
    }

    /**
     * PUT request
     */
    async put<T>(url: string, data?: any, params?: any): Promise<T> {
        const response = await this.client.put<T>(url, data, {
            params: this.addTeamId(params)
        });
        return response.data;
    }

    /**
     * DELETE request
     */
    async delete<T>(url: string, params?: any): Promise<T> {
        const response = await this.client.delete<T>(url, {
            params: this.addTeamId(params)
        });
        return response.data;
    }

    /**
     * POST multipart/form-data request
     */
    async postFormData<T>(url: string, formData: any, params?: any): Promise<T> {
        // form-data sets its own Content-Type with boundary, so we use its headers
        const headers = formData.getHeaders ? formData.getHeaders() : {
            'Content-Type': 'multipart/form-data',
        };
        
        const response = await this.client.post<T>(url, formData, {
            params: this.addTeamId(params),
            headers: {
                ...headers,
                'Authorization': this.client.defaults.headers['Authorization'],
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        return response.data;
    }
}

/**
 * Create a Liara API client from environment variables
 */
export function createLiaraClient(): LiaraClient {
    const apiToken = process.env.LIARA_API_TOKEN;

    if (!apiToken) {
        throw new Error('LIARA_API_TOKEN environment variable is required');
    }

    return new LiaraClient({
        apiToken,
        teamId: process.env.LIARA_TEAM_ID,
        baseURL: process.env.LIARA_API_BASE_URL,
    });
}
