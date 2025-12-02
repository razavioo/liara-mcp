import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as userService from '../../services/user.js';
import { UserInfo } from '../../services/user.js';

describe('User Service', () => {
    let mockClient: LiaraClient;

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
        } as any;
    });

    describe('getUserInfo', () => {
        it('should get user information', async () => {
            const mockApiResponse = {
                user: {
                    _id: 'user1',
                    email: 'user@example.com',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: 'User',
                    joined_at: '2024-01-01',
                    fullname: 'Test User',
                },
                plans: {
                    mail: {},
                    projects: {},
                },
                databaseVersions: {},
            };
            (mockClient.get as any).mockResolvedValue(mockApiResponse);

            const result = await userService.getUserInfo(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/me');
            expect(result._id).toBe('user1');
            expect(result.email).toBe('user@example.com');
            expect(result.createdAt).toBe('2024-01-01');
            expect(result.plans).toBeDefined();
        });
    });

    describe('listAccounts', () => {
        it('should list accounts (returns current user)', async () => {
            const mockApiResponse = {
                user: {
                    _id: 'user1',
                    email: 'user@example.com',
                    joined_at: '2024-01-01',
                },
                plans: {},
                databaseVersions: {},
            };
            (mockClient.get as any).mockResolvedValue(mockApiResponse);

            const result = await userService.listAccounts(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/me');
            expect(result).toHaveLength(1);
            expect(result[0]._id).toBe('user1');
            expect(result[0].email).toBe('user@example.com');
        });
    });
});
