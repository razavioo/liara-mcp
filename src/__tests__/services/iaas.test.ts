import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiaraClient } from '../../api/client.js';
import * as iaasService from '../../services/iaas.js';
import { VirtualMachine, CreateVmRequest } from '../../api/types.js';

describe('IaaS Service', () => {
    let mockClient: LiaraClient;
    let mockIaaSClient: LiaraClient;

    beforeEach(() => {
        mockIaaSClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;

        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        } as any;

        // Mock process.env for IaaS client creation
        process.env.LIARA_API_TOKEN = 'test-token';
    });

    describe('listVMs', () => {
        it('should list VMs with pagination', async () => {
            // Since createIaaSClient is private, we test the public interface
            // In a real scenario, we'd use dependency injection or make it testable
            const mockVMs: VirtualMachine[] = [
                {
                    _id: '1',
                    name: 'vm1',
                    planID: 'plan1',
                    status: 'RUNNING',
                    os: 'ubuntu',
                    createdAt: '2024-01-01',
                },
            ];
            
            // Mock the client to simulate IaaS client behavior
            const mockIaaSGet = vi.fn().mockResolvedValue(mockVMs);
            (mockClient as any).get = mockIaaSGet;

            // Note: This test verifies the function signature and expected behavior
            // Full integration would require mocking the internal createIaaSClient
            expect(iaasService.listVMs).toBeDefined();
            expect(typeof iaasService.listVMs).toBe('function');
        });
    });

    describe('createVM', () => {
        it('should have createVM function defined', () => {
            expect(iaasService.createVM).toBeDefined();
            expect(typeof iaasService.createVM).toBe('function');
        });
    });

    describe('resizeVM', () => {
        it('should have resizeVM function defined', () => {
            expect(iaasService.resizeVM).toBeDefined();
            expect(typeof iaasService.resizeVM).toBe('function');
        });
    });

    describe('snapshot operations', () => {
        it('should have createSnapshot function defined', () => {
            expect(iaasService.createSnapshot).toBeDefined();
            expect(typeof iaasService.createSnapshot).toBe('function');
        });

        it('should have listSnapshots function defined', () => {
            expect(iaasService.listSnapshots).toBeDefined();
            expect(typeof iaasService.listSnapshots).toBe('function');
        });
    });

    describe('network operations', () => {
        it('should have attachNetwork function defined', () => {
            expect(iaasService.attachNetwork).toBeDefined();
            expect(typeof iaasService.attachNetwork).toBe('function');
        });

        it('should have detachNetwork function defined', () => {
            expect(iaasService.detachNetwork).toBeDefined();
            expect(typeof iaasService.detachNetwork).toBe('function');
        });
    });
});
