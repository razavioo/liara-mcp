/**
 * Tool definitions index - exports all tool definitions
 */
export { ToolDefinition, getPaginationProperties } from './types.js';
export { getAppTools } from './app-tools.js';
export { getEnvTools } from './env-tools.js';
export { getSettingsTools } from './settings-tools.js';
export { getDeploymentTools } from './deployment-tools.js';
export { getDatabaseTools } from './database-tools.js';
export { getStorageTools } from './storage-tools.js';
export { getPlanTools } from './plan-tools.js';
export { getDnsTools } from './dns-tools.js';
export { getDomainTools } from './domain-tools.js';
export { getMailTools } from './mail-tools.js';
export { getVmTools } from './vm-tools.js';
export { getDiskTools } from './disk-tools.js';
export { getNetworkTools } from './network-tools.js';
export { getUserTools } from './user-tools.js';
export { getObservabilityTools } from './observability-tools.js';

import { ToolDefinition } from './types.js';
import { getAppTools } from './app-tools.js';
import { getEnvTools } from './env-tools.js';
import { getSettingsTools } from './settings-tools.js';
import { getDeploymentTools } from './deployment-tools.js';
import { getDatabaseTools } from './database-tools.js';
import { getStorageTools } from './storage-tools.js';
import { getPlanTools } from './plan-tools.js';
import { getDnsTools } from './dns-tools.js';
import { getDomainTools } from './domain-tools.js';
import { getMailTools } from './mail-tools.js';
import { getVmTools } from './vm-tools.js';
import { getDiskTools } from './disk-tools.js';
import { getNetworkTools } from './network-tools.js';
import { getUserTools } from './user-tools.js';
import { getObservabilityTools } from './observability-tools.js';

/**
 * Get all tool definitions
 */
export function getAllTools(): ToolDefinition[] {
    return [
        ...getAppTools(),
        ...getEnvTools(),
        ...getSettingsTools(),
        ...getDeploymentTools(),
        ...getDatabaseTools(),
        ...getStorageTools(),
        ...getPlanTools(),
        ...getDnsTools(),
        ...getDomainTools(),
        ...getMailTools(),
        ...getVmTools(),
        ...getDiskTools(),
        ...getNetworkTools(),
        ...getUserTools(),
        ...getObservabilityTools(),
    ];
}
