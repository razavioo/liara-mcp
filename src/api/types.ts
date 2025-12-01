/**
 * TypeScript type definitions based on Liara OpenAPI specification
 */

// Common types
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
}

/**
 * Pagination options for list operations
 */
export interface PaginationOptions {
    page?: number;
    perPage?: number;
    limit?: number; // Alternative to perPage
    offset?: number; // Alternative to page
}

/**
 * Helper to convert pagination options to query parameters
 */
export function paginationToParams(options?: PaginationOptions): Record<string, any> {
    if (!options) return {};
    
    const params: Record<string, any> = {};
    
    if (options.page !== undefined) {
        params.page = options.page;
    } else if (options.offset !== undefined) {
        params.offset = options.offset;
    }
    
    if (options.perPage !== undefined) {
        params.perPage = options.perPage;
    } else if (options.limit !== undefined) {
        params.limit = options.limit;
    }
    
    return params;
}

// App/Project types
export interface Project {
    _id: string;
    name: string;
    platform: Platform;
    planID: string;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
    domain?: string;
    subdomain?: string;
    region?: string;
}

export type Platform =
    | 'node'
    | 'nextjs'
    | 'laravel'
    | 'php'
    | 'django'
    | 'flask'
    | 'dotnet'
    | 'static'
    | 'react'
    | 'angular'
    | 'vue'
    | 'docker'
    | 'python'
    | 'go';

export type ProjectStatus = 'RUNNING' | 'STOPPED' | 'DEPLOYING' | 'FAILED' | 'CREATING';

export interface CreateProjectRequest {
    name: string;
    platform: Platform;
    planID: string;
    region?: string;
}

export interface ProjectDetails extends Project {
    envVars?: EnvironmentVariable[];
    disks?: Disk[];
    domains?: Domain[];
    settings?: ProjectSettings;
}

export interface ProjectSettings {
    zeroDowntime?: boolean;
    defaultSubdomain?: boolean;
    fixedIP?: boolean;
    staticIP?: string;
    readOnly?: boolean;
}

// Environment variables
export interface EnvironmentVariable {
    key: string;
    value: string;
}

export interface UpdateEnvsRequest {
    project: string;
    variables: EnvironmentVariable[];
}

// Deployment types
export interface DeploySourceResponse {
    sourceID: string;
}

export interface DeployReleaseRequest {
    sourceID: string;
    envVars?: EnvironmentVariable[];
}

export interface DeployReleaseResponse {
    releaseID: string;
}

// Database types
export interface Database {
    _id: string;
    name: string;
    type: DatabaseType;
    planID: string;
    status: DatabaseStatus;
    version?: string;
    createdAt: string;
    updatedAt: string;
}

export type DatabaseType =
    | 'mariadb'
    | 'mysql'
    | 'postgres'
    | 'mssql'
    | 'mongodb'
    | 'redis'
    | 'elasticsearch'
    | 'rabbitmq';

export type DatabaseStatus = 'RUNNING' | 'STOPPED' | 'CREATING' | 'FAILED';

export interface CreateDatabaseRequest {
    name: string;
    type: DatabaseType;
    planID: string;
    version?: string;
}

export interface DatabaseBackup {
    _id: string;
    databaseID: string;
    name: string;
    size: number;
    createdAt: string;
    status: 'CREATING' | 'READY' | 'FAILED';
}

// Storage types
export interface Bucket {
    _id: string;
    name: string;
    region: string;
    createdAt: string;
}

export interface BucketCredentials {
    accessKey: string;
    secretKey: string;
    endpoint: string;
    bucket: string;
}

export interface CreateBucketRequest {
    name: string;
    region?: string;
    permission?: 'private' | 'public-read';
}

// Domain types
export interface Domain {
    _id: string;
    name: string;
    projectID: string;
    status: DomainStatus;
    createdAt: string;
}

export type DomainStatus = 'ACTIVE' | 'PENDING' | 'FAILED';

export interface DomainCheck {
    domain: string;
    valid: boolean;
    dnsConfigured: boolean;
    message?: string;
}

// DNS types
export interface Zone {
    _id: string;
    name: string;
    status: 'ACTIVE' | 'PENDING';
    createdAt: string;
    nameservers?: string[];
}

export interface DnsRecord {
    _id: string;
    zoneID: string;
    type: DnsRecordType;
    name: string;
    value: string;
    ttl: number;
    priority?: number;
}

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';

export interface CreateDnsRecordRequest {
    type: DnsRecordType;
    name: string;
    value: string;
    ttl?: number;
    priority?: number;
}

// Disk types
export interface Disk {
    _id: string;
    name: string;
    projectID: string;
    size: number; // in GB
    mountPath: string;
    createdAt: string;
}

export interface CreateDiskRequest {
    name: string;
    size: number;
    mountPath: string;
}

export interface FtpAccess {
    _id?: string;
    hostname: string;
    port: number;
    username: string;
    password: string;
}

// VM types
export interface VirtualMachine {
    _id: string;
    name: string;
    planID: string;
    status: VmStatus;
    os: string;
    ip?: string;
    createdAt: string;
}

export type VmStatus = 'RUNNING' | 'STOPPED' | 'CREATING' | 'FAILED';

export interface CreateVmRequest {
    name: string;
    planID: string;
    os: string;
    sshKey?: string;
}

// Email types
export interface MailServer {
    _id: string;
    name: string;
    mode: 'smtp' | 'api';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

export interface SendEmailRequest {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
}

// Network types
export interface Network {
    _id: string;
    name: string;
    cidr: string;
    createdAt: string;
}

// Plan types
export interface Plan {
    _id: string;
    name: string;
    cpu: number;
    memory: number; // in MB
    disk: number; // in GB
    price: number;
    type: 'app' | 'database' | 'vm';
}

// Metrics types
export interface AppMetrics {
    cpu: number;
    memory: number;
    disk: number;
    network: {
        in: number;
        out: number;
    };
    requests?: number;
}

export interface MetricsSummary {
    period: string;
    metrics: AppMetrics;
}

// Log types
export interface LogEntry {
    timestamp: string;
    message: string;
    level?: 'info' | 'warn' | 'error' | 'debug';
    source?: string;
}

export interface LogsRequest {
    since?: string;
    until?: string;
    limit?: number;
    follow?: boolean;
}

// Error types
export interface LiaraApiError {
    statusCode: number;
    message: string;
    error?: string;
}
