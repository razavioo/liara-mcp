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
            const mockUser: UserInfo = {
                _id: 'user1',
                email: 'user@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                createdAt: '2024-01-01',
                plans: {
                    app: [],
                    database: [],
                    vm: [],
                },
                teams: [],
            };
            (mockClient.get as any).mockResolvedValue(mockUser);

            const result = await userService.getUserInfo(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/me');
            expect(result).toEqual(mockUser);
        });
    });

    describe('listAccounts', () => {
        it('should list accounts (returns current user)', async () => {
            const mockUser: UserInfo = {
                _id: 'user1',
                email: 'user@example.com',
                createdAt: '2024-01-01',
            };
            (mockClient.get as any).mockResolvedValue(mockUser);

            const result = await userService.listAccounts(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/me');
            expect(result).toEqual([mockUser]);
        });
    });
});
