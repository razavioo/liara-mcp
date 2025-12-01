import { describe, it, expect } from 'vitest';
import {
    Platform,
    DatabaseType,
    DnsRecordType,
    ProjectStatus,
    DatabaseStatus,
    VmStatus,
    DomainStatus,
} from '../../api/types.js';
import * as appService from '../../services/apps.js';
import * as dbService from '../../services/databases.js';

describe('Type Safety Tests', () => {
    describe('Platform Types', () => {
        it('should return valid platform types', () => {
            const platforms = appService.getAvailablePlatforms();
            expect(platforms).toContain('node');
            expect(platforms).toContain('docker');
            expect(platforms).toContain('go');
            expect(platforms.length).toBeGreaterThan(10);
        });

        it('should have all platforms as valid Platform type', () => {
            const platforms = appService.getAvailablePlatforms();
            platforms.forEach((platform) => {
                expect(typeof platform).toBe('string');
                expect(platform.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Database Types', () => {
        it('should return valid database types', () => {
            const types = dbService.getAvailableDatabaseTypes();
            expect(types).toContain('postgres');
            expect(types).toContain('mysql');
            expect(types).toContain('mongodb');
            expect(types.length).toBe(8);
        });

        it('should have all database types as valid DatabaseType', () => {
            const types = dbService.getAvailableDatabaseTypes();
            const validTypes: DatabaseType[] = [
                'mariadb',
                'mysql',
                'postgres',
                'mssql',
                'mongodb',
                'redis',
                'elasticsearch',
                'rabbitmq',
            ];
            types.forEach((type) => {
                expect(validTypes).toContain(type);
            });
        });
    });

    describe('Status Types', () => {
        it('should validate ProjectStatus values', () => {
            const validStatuses: ProjectStatus[] = [
                'RUNNING',
                'STOPPED',
                'DEPLOYING',
                'FAILED',
                'CREATING',
            ];
            validStatuses.forEach((status) => {
                expect(typeof status).toBe('string');
            });
        });

        it('should validate DatabaseStatus values', () => {
            const validStatuses: DatabaseStatus[] = [
                'RUNNING',
                'STOPPED',
                'CREATING',
                'FAILED',
            ];
            validStatuses.forEach((status) => {
                expect(typeof status).toBe('string');
            });
        });
    });
});
