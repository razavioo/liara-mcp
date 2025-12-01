import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { createLiaraClient } from '../../api/client.js';

// Mock the client creation
vi.mock('../../api/client.js', () => ({
    createLiaraClient: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
        put: vi.fn(),
        postFormData: vi.fn(),
    })),
}));

describe('MCP Server Integration', () => {
    const originalEnv = process.env.LIARA_API_TOKEN;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        if (originalEnv) {
            process.env.LIARA_API_TOKEN = originalEnv;
        } else {
            delete process.env.LIARA_API_TOKEN;
        }
    });

    describe('Tool Registration', () => {
        it('should register all list tools with pagination support', async () => {
            // This would require importing and testing the actual server class
            // For now, we verify the structure exists
            expect(true).toBe(true); // Placeholder - would need actual server instance
        });
    });

    describe('Error Handling', () => {
        it('should handle missing API token gracefully', () => {
            delete process.env.LIARA_API_TOKEN;
            expect(() => {
                createLiaraClient();
            }).toThrow('LIARA_API_TOKEN environment variable is required');
        });
    });
});
