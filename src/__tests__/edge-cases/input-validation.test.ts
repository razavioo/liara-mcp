import { describe, it, expect } from 'vitest';
import {
    validateAppName,
    validateDomainName,
    validateEnvKey,
    validateRequired,
} from '../../utils/errors.js';

describe('Input Validation Edge Cases', () => {
    describe('App Name Validation', () => {
        it('should handle minimum length (3 chars)', () => {
            expect(() => validateAppName('abc')).not.toThrow();
        });

        it('should handle maximum length (32 chars)', () => {
            expect(() => validateAppName('a'.repeat(32))).not.toThrow();
        });

        it('should reject exactly 2 characters', () => {
            expect(() => validateAppName('ab')).toThrow();
        });

        it('should reject exactly 33 characters', () => {
            expect(() => validateAppName('a'.repeat(33))).toThrow();
        });

        it('should accept names with numbers', () => {
            expect(() => validateAppName('app123')).not.toThrow();
            expect(() => validateAppName('123app')).not.toThrow();
            expect(() => validateAppName('app-123-test')).not.toThrow();
        });

        it('should accept names with multiple hyphens', () => {
            expect(() => validateAppName('my-app-name')).not.toThrow();
            expect(() => validateAppName('app-name-test-123')).not.toThrow();
        });
    });

    describe('Domain Name Validation', () => {
        it('should accept root domains', () => {
            expect(() => validateDomainName('example.com')).not.toThrow();
            expect(() => validateDomainName('test.co.uk')).not.toThrow();
        });

        it('should accept subdomains', () => {
            expect(() => validateDomainName('www.example.com')).not.toThrow();
            expect(() => validateDomainName('api.v1.example.com')).not.toThrow();
        });

        it('should reject invalid TLDs', () => {
            expect(() => validateDomainName('example.c')).toThrow();
            expect(() => validateDomainName('example.')).toThrow();
        });

        it('should reject domains without TLD', () => {
            expect(() => validateDomainName('example')).toThrow();
            expect(() => validateDomainName('localhost')).toThrow();
        });
    });

    describe('Environment Variable Key Validation', () => {
        it('should accept standard environment variable names', () => {
            expect(() => validateEnvKey('NODE_ENV')).not.toThrow();
            expect(() => validateEnvKey('DATABASE_URL')).not.toThrow();
            expect(() => validateEnvKey('API_KEY')).not.toThrow();
        });

        it('should accept keys with numbers', () => {
            expect(() => validateEnvKey('API_KEY_123')).not.toThrow();
            expect(() => validateEnvKey('VERSION_2')).not.toThrow();
        });

        it('should accept keys starting with underscore', () => {
            expect(() => validateEnvKey('_PRIVATE_KEY')).not.toThrow();
            expect(() => validateEnvKey('_INTERNAL')).not.toThrow();
        });

        it('should reject keys starting with numbers', () => {
            expect(() => validateEnvKey('123KEY')).toThrow();
            expect(() => validateEnvKey('0API_KEY')).toThrow();
        });

        it('should reject mixed case keys', () => {
            expect(() => validateEnvKey('Api_Key')).toThrow();
            expect(() => validateEnvKey('API_key')).toThrow();
        });
    });

    describe('Required Field Validation', () => {
        it('should accept truthy values', () => {
            expect(() => validateRequired('value', 'Field')).not.toThrow();
            expect(() => validateRequired(123, 'Field')).not.toThrow();
            expect(() => validateRequired(true, 'Field')).not.toThrow();
            expect(() => validateRequired(false, 'Field')).not.toThrow();
            expect(() => validateRequired(0, 'Field')).not.toThrow();
            expect(() => validateRequired([], 'Field')).not.toThrow();
            expect(() => validateRequired({}, 'Field')).not.toThrow();
        });

        it('should reject falsy values that are considered empty', () => {
            expect(() => validateRequired(undefined, 'Field')).toThrow();
            expect(() => validateRequired(null, 'Field')).toThrow();
            expect(() => validateRequired('', 'Field')).toThrow();
        });
    });
});
