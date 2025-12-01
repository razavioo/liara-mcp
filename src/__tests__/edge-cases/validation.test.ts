import { describe, it, expect } from 'vitest';
import {
    validateAppName,
    validateDomainName,
    validateEnvKey,
    validateRequired,
} from '../../utils/errors.js';

describe('Validation Edge Cases', () => {
    describe('validateAppName edge cases', () => {
        it('should accept app names with consecutive hyphens (API may handle)', () => {
            // Note: Current validation allows consecutive hyphens, API will validate
            expect(() => validateAppName('app--name')).not.toThrow();
        });

        it('should accept app names with single hyphens', () => {
            expect(() => validateAppName('app-name')).not.toThrow();
        });

        it('should accept app names with only numbers (API may handle)', () => {
            // Note: Current validation allows numbers only, API will validate
            expect(() => validateAppName('123456')).not.toThrow();
        });

        it('should accept app names with numbers and letters', () => {
            expect(() => validateAppName('app123')).not.toThrow();
        });

        it('should handle exactly 3 characters', () => {
            expect(() => validateAppName('abc')).not.toThrow();
        });

        it('should handle exactly 32 characters', () => {
            expect(() => validateAppName('a'.repeat(32))).not.toThrow();
        });
    });

    describe('validateDomainName edge cases', () => {
        it('should accept subdomains', () => {
            expect(() => validateDomainName('sub.example.com')).not.toThrow();
            expect(() => validateDomainName('www.sub.example.com')).not.toThrow();
        });

        it('should reject domains without TLD', () => {
            expect(() => validateDomainName('example')).toThrow();
        });

        it('should accept international domains', () => {
            expect(() => validateDomainName('example.co.uk')).not.toThrow();
        });
    });

    describe('validateEnvKey edge cases', () => {
        it('should accept keys starting with underscore', () => {
            expect(() => validateEnvKey('_PRIVATE_KEY')).not.toThrow();
        });

        it('should accept keys with only underscores (API may handle)', () => {
            // Note: Current validation allows underscores only, API will validate
            expect(() => validateEnvKey('___')).not.toThrow();
        });

        it('should accept keys with numbers after first character', () => {
            expect(() => validateEnvKey('API_KEY_123')).not.toThrow();
        });
    });

    describe('validateRequired edge cases', () => {
        it('should accept zero as valid value', () => {
            expect(() => validateRequired(0, 'Number')).not.toThrow();
        });

        it('should accept false as valid value', () => {
            expect(() => validateRequired(false, 'Boolean')).not.toThrow();
        });

        it('should accept empty array as valid value', () => {
            expect(() => validateRequired([], 'Array')).not.toThrow();
        });

        it('should accept empty object as valid value', () => {
            expect(() => validateRequired({}, 'Object')).not.toThrow();
        });
    });
});

