import { describe, it, expect } from 'vitest';
import {
    validateRequired,
    validateAppName,
    validateDomainName,
    validateEnvKey,
    LiaraMcpError,
} from '../../utils/errors.js';

describe('Error Utilities', () => {
    describe('validateRequired', () => {
        it('should throw error for undefined value', () => {
            expect(() => validateRequired(undefined, 'Field')).toThrow(LiaraMcpError);
            expect(() => validateRequired(undefined, 'Field')).toThrow('Field is required');
        });

        it('should throw error for null value', () => {
            expect(() => validateRequired(null, 'Field')).toThrow('Field is required');
        });

        it('should throw error for empty string', () => {
            expect(() => validateRequired('', 'Field')).toThrow('Field is required');
        });

        it('should not throw for valid values', () => {
            expect(() => validateRequired('value', 'Field')).not.toThrow();
            expect(() => validateRequired(0, 'Field')).not.toThrow();
            expect(() => validateRequired(false, 'Field')).not.toThrow();
            expect(() => validateRequired([], 'Field')).not.toThrow();
        });
    });

    describe('validateAppName', () => {
        it('should accept valid app names', () => {
            expect(() => validateAppName('my-app')).not.toThrow();
            expect(() => validateAppName('myapp123')).not.toThrow();
            expect(() => validateAppName('app-123-test')).not.toThrow();
            expect(() => validateAppName('a'.repeat(32))).not.toThrow();
            expect(() => validateAppName('a'.repeat(3))).not.toThrow();
        });

        it('should reject app names that are too short', () => {
            expect(() => validateAppName('ab')).toThrow();
            expect(() => validateAppName('a')).toThrow();
        });

        it('should reject app names that are too long', () => {
            expect(() => validateAppName('a'.repeat(33))).toThrow();
        });

        it('should reject app names with uppercase letters', () => {
            expect(() => validateAppName('MyApp')).toThrow();
        });

        it('should reject app names with special characters', () => {
            expect(() => validateAppName('my_app')).toThrow();
            expect(() => validateAppName('my.app')).toThrow();
            expect(() => validateAppName('my app')).toThrow();
        });

        it('should reject app names starting with hyphen', () => {
            expect(() => validateAppName('-myapp')).toThrow();
        });

        it('should reject app names ending with hyphen', () => {
            expect(() => validateAppName('myapp-')).toThrow();
        });

        it('should reject empty or undefined app names', () => {
            expect(() => validateAppName('')).toThrow();
            expect(() => validateAppName(undefined as any)).toThrow();
        });
    });

    describe('validateDomainName', () => {
        it('should accept valid domain names', () => {
            expect(() => validateDomainName('example.com')).not.toThrow();
            expect(() => validateDomainName('sub.example.com')).not.toThrow();
            expect(() => validateDomainName('test-domain.co.uk')).not.toThrow();
        });

        it('should reject invalid domain names', () => {
            expect(() => validateDomainName('invalid')).toThrow();
            expect(() => validateDomainName('invalid.')).toThrow();
            expect(() => validateDomainName('.invalid.com')).toThrow();
            expect(() => validateDomainName('')).toThrow();
        });
    });

    describe('validateEnvKey', () => {
        it('should accept valid environment variable keys', () => {
            expect(() => validateEnvKey('API_KEY')).not.toThrow();
            expect(() => validateEnvKey('DATABASE_URL')).not.toThrow();
            expect(() => validateEnvKey('NODE_ENV')).not.toThrow();
            expect(() => validateEnvKey('_PRIVATE_KEY')).not.toThrow();
            expect(() => validateEnvKey('KEY123')).not.toThrow();
        });

        it('should reject keys starting with numbers', () => {
            expect(() => validateEnvKey('123KEY')).toThrow();
        });

        it('should reject keys with lowercase letters', () => {
            expect(() => validateEnvKey('api_key')).toThrow();
            expect(() => validateEnvKey('API_Key')).toThrow();
        });

        it('should reject keys with special characters', () => {
            expect(() => validateEnvKey('API-KEY')).toThrow();
            expect(() => validateEnvKey('API.KEY')).toThrow();
            expect(() => validateEnvKey('API KEY')).toThrow();
        });

        it('should reject empty or undefined keys', () => {
            expect(() => validateEnvKey('')).toThrow();
            expect(() => validateEnvKey(undefined as any)).toThrow();
        });
    });
});
