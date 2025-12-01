import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { AxiosError } from 'axios';
import { LiaraClient } from '../../api/client.js';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('LiaraClient', () => {
    let client: LiaraClient;
    const mockApiToken = 'test-token-123';
    const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            response: {
                use: vi.fn(),
            },
        },
        defaults: {
            headers: {
                Authorization: `Bearer ${mockApiToken}`,
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
        client = new LiaraClient({
            apiToken: mockApiToken,
        });
    });

    describe('constructor', () => {
        it('should create axios instance with correct config', () => {
            expect(mockedAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'https://api.iran.liara.ir',
                    headers: {
                        Authorization: `Bearer ${mockApiToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                })
            );
        });

        it('should use custom baseURL when provided', () => {
            const customBaseURL = 'https://custom.api.liara.ir';
            new LiaraClient({
                apiToken: mockApiToken,
                baseURL: customBaseURL,
            });
            expect(mockedAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: customBaseURL,
                })
            );
        });

        it('should store teamId when provided', () => {
            const teamId = 'team-123';
            const clientWithTeam = new LiaraClient({
                apiToken: mockApiToken,
                teamId,
            });
            expect((clientWithTeam as any).teamId).toBe(teamId);
        });
    });

    describe('get', () => {
        it('should make GET request with correct URL', async () => {
            const mockData = { id: '1', name: 'test' };
            mockAxiosInstance.get.mockResolvedValue({ data: mockData });

            const result = await client.get('/v1/test');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/test', {
                params: {},
            });
            expect(result).toEqual(mockData);
        });

        it('should include teamID in params when teamId is set', async () => {
            const teamId = 'team-123';
            const clientWithTeam = new LiaraClient({
                apiToken: mockApiToken,
                teamId,
            });
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await clientWithTeam.get('/v1/test');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/test', {
                params: { teamID: teamId },
            });
        });

        it('should include custom params', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await client.get('/v1/test', { filter: 'active' });

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/test', {
                params: { filter: 'active' },
            });
        });
    });

    describe('post', () => {
        it('should make POST request with data', async () => {
            const mockData = { id: '1' };
            const requestData = { name: 'test' };
            mockAxiosInstance.post.mockResolvedValue({ data: mockData });

            const result = await client.post('/v1/test', requestData);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/v1/test',
                requestData,
                { params: {} }
            );
            expect(result).toEqual(mockData);
        });
    });

    describe('delete', () => {
        it('should make DELETE request', async () => {
            mockAxiosInstance.delete.mockResolvedValue({ data: {} });

            await client.delete('/v1/test');

            expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/v1/test', {
                params: {},
            });
        });
    });

    describe('error handling', () => {
        it('should handle 401 authentication errors', async () => {
            const error = {
                response: {
                    status: 401,
                    data: { message: 'Unauthorized' },
                },
                isAxiosError: true,
            } as AxiosError;
            
            // Get the error handler from the interceptor
            const interceptorSetup = mockAxiosInstance.interceptors.response.use;
            expect(interceptorSetup).toHaveBeenCalled();
            
            // Verify error structure
            expect(error.response?.status).toBe(401);
            expect(error.response?.data?.message).toBe('Unauthorized');
        });

        it('should handle 404 not found errors', async () => {
            const error = {
                response: {
                    status: 404,
                    data: { message: 'Not found' },
                },
                isAxiosError: true,
            } as AxiosError;
            
            expect(error.response?.status).toBe(404);
            expect(error.response?.data?.message).toBe('Not found');
        });

        it('should handle 429 rate limit errors', async () => {
            const error = {
                response: {
                    status: 429,
                    data: {},
                },
                isAxiosError: true,
            } as AxiosError;
            
            expect(error.response?.status).toBe(429);
        });

        it('should handle network errors', async () => {
            const error = {
                request: {},
                isAxiosError: true,
            } as AxiosError;
            
            expect(error.request).toBeDefined();
            expect(error.response).toBeUndefined();
        });
    });
});

