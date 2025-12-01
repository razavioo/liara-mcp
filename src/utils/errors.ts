/**
 * Custom error class for Liara MCP operations
 */
export class LiaraMcpError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'LiaraMcpError';
    }
}

/**
 * Format error for MCP response
 */
export function formatErrorForMcp(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/**
 * Validate that a value is not empty
 */
export function validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
        throw new LiaraMcpError(`${fieldName} is required`);
    }
}

/**
 * Validate app name format
 * Must be lowercase alphanumeric with hyphens, 3-32 characters
 */
export function validateAppName(name: string): void {
    validateRequired(name, 'App name');

    if (!/^[a-z0-9-]{3,32}$/.test(name)) {
        throw new LiaraMcpError(
            'App name must be 3-32 characters long and contain only lowercase letters, numbers, and hyphens'
        );
    }

    if (name.startsWith('-') || name.endsWith('-')) {
        throw new LiaraMcpError('App name cannot start or end with a hyphen');
    }
}

/**
 * Validate domain name format
 */
export function validateDomainName(domain: string): void {
    validateRequired(domain, 'Domain name');

    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
        throw new LiaraMcpError('Invalid domain name format');
    }
}

/**
 * Validate environment variable key
 */
export function validateEnvKey(key: string): void {
    validateRequired(key, 'Environment variable key');

    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
        throw new LiaraMcpError(
            'Environment variable key must start with a letter or underscore and contain only uppercase letters, numbers, and underscores'
        );
    }
}
