/**
 * Custom error class for Liara MCP operations
 */
export class LiaraMcpError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: any,
        public suggestions?: string[]
    ) {
        super(message);
        this.name = 'LiaraMcpError';
    }

    /**
     * Format error message with suggestions
     */
    formatMessage(): string {
        let msg = this.message;
        if (this.suggestions && this.suggestions.length > 0) {
            msg += '\n\nSuggestions:';
            this.suggestions.forEach((suggestion, index) => {
                msg += `\n${index + 1}. ${suggestion}`;
            });
        }
        return msg;
    }
}

/**
 * Format error for MCP response
 * Returns just the base message without suggestions (for structured responses)
 */
export function formatErrorForMcp(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/**
 * Format error message with suggestions (for plain text responses)
 */
export function formatErrorWithSuggestions(error: unknown): string {
    if (error instanceof LiaraMcpError) {
        return error.formatMessage();
    }
    return formatErrorForMcp(error);
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

    if (name.length < 3) {
        throw new LiaraMcpError(
            `App name "${name}" is too short (minimum 3 characters, got ${name.length})`,
            'INVALID_APP_NAME',
            { name, length: name.length },
            ['Use a name like "my-app" or "api-service"']
        );
    }

    if (name.length > 32) {
        throw new LiaraMcpError(
            `App name "${name}" is too long (maximum 32 characters, got ${name.length})`,
            'INVALID_APP_NAME',
            { name, length: name.length },
            ['Shorten the name to 32 characters or less']
        );
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
        const invalidChars = name.match(/[^a-z0-9-]/g);
        throw new LiaraMcpError(
            `App name contains invalid characters: ${invalidChars?.join(', ') || 'unknown'}`,
            'INVALID_APP_NAME',
            { name, invalidChars },
            ['Use only lowercase letters, numbers, and hyphens', 'Example: "my-app" or "api-service"']
        );
    }

    if (name.startsWith('-') || name.endsWith('-')) {
        throw new LiaraMcpError(
            `App name cannot start or end with a hyphen: "${name}"`,
            'INVALID_APP_NAME',
            { name },
            ['Remove leading/trailing hyphens', 'Example: "my-app" instead of "-my-app"']
        );
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

/**
 * Unwrap API response data
 * Handles various response formats (direct array, wrapped in data/items/etc.)
 */
export function unwrapApiResponse<T>(response: any, expectedArrayKeys?: string[]): T {
    if (!response) return response;
    
    // If it's already the expected type (array or primitive), return as-is
    if (Array.isArray(response)) {
        return response as T;
    }
    
    // Common wrapper keys that APIs use
    const arrayKeys = expectedArrayKeys || ['data', 'items', 'results', 'projects', 'databases', 'buckets', 'zones', 'records', 'backups', 'releases', 'domains', 'vms', 'plans'];
    
    // Try to unwrap from common wrapper keys
    for (const key of arrayKeys) {
        if (response[key] !== undefined) {
            return response[key] as T;
        }
    }
    
    // Return as-is if no wrapper found
    return response as T;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}
