# Liara MCP Server - Comprehensive Improvement Plan

## 🎯 Priority Improvements

### 1. **Type Safety Improvements** (High Priority)

**Current Issues:**
- Multiple `any` types throughout codebase (17 instances found)
- Weak typing in error handling (`error: any`)
- Generic `params: any` in API client methods

**Improvements:**
```typescript
// Instead of:
private extractPagination(args: any): PaginationOptions | undefined

// Use:
private extractPagination(args: Record<string, unknown> | undefined): PaginationOptions | undefined

// Instead of:
async get<T>(url: string, params?: any): Promise<T>

// Use:
async get<T>(url: string, params?: Record<string, string | number | boolean>): Promise<T>
```

**Benefits:**
- Better IDE autocomplete
- Catch type errors at compile time
- Improved code maintainability

---

### 2. **Enhanced Error Handling** (High Priority)

**Current Issues:**
- Generic error messages
- Limited error context
- No error recovery suggestions

**Improvements:**
```typescript
// Add error context
export class LiaraMcpError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: any,
        public suggestions?: string[]  // NEW: Add suggestions
    ) {
        super(message);
        this.name = 'LiaraMcpError';
    }
}

// Better error messages with context
if (error.response?.status === 404) {
    throw new LiaraMcpError(
        `App "${appName}" not found`,
        'APP_NOT_FOUND',
        { appName },
        [
            'Check if the app name is correct',
            'List all apps: liara_list_apps',
            'Verify you have access to this app'
        ]
    );
}
```

**Benefits:**
- Users get actionable error messages
- Easier debugging
- Better user experience

---

### 3. **WebSocket Support for Command Execution** (High Priority)

**Current Status:**
- `ws` package is in dependencies but unused
- `exec_command` only tries HTTP endpoint
- Falls back to CLI suggestion

**Implementation:**
```typescript
import WebSocket from 'ws';

export async function execCommandWebSocket(
    client: LiaraClient,
    appName: string,
    command: string,
    workingDir?: string
): Promise<{ output: string; exitCode: number }> {
    // Get WebSocket URL from API
    const wsUrl = await getWebSocketUrl(client, appName);
    
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl, {
            headers: {
                'Authorization': `Bearer ${client.apiToken}`
            }
        });
        
        let output = '';
        let exitCode = 0;
        
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === 'output') {
                output += message.data;
            } else if (message.type === 'exit') {
                exitCode = message.code;
                ws.close();
                resolve({ output, exitCode });
            }
        });
        
        ws.on('open', () => {
            ws.send(JSON.stringify({
                command,
                workingDir: workingDir || '/app'
            }));
        });
        
        ws.on('error', reject);
    });
}
```

**Benefits:**
- Real command execution support
- Interactive commands possible
- Full automation capability

---

### 4. **Better Tool Descriptions** (Medium Priority)

**Current Issues:**
- Some tool descriptions are brief
- Missing examples
- No parameter validation hints

**Improvements:**
```typescript
{
    name: 'liara_create_app',
    description: `Create a new app on Liara platform.
    
    Examples:
    - Create a Node.js app: {name: "my-api", platform: "node", planID: "free"}
    - Create a Docker app with network: {name: "my-app", platform: "docker", planID: "small-g2", network: "network-id"}
    
    Note: The 'network' parameter is optional but may be required by the API in some cases.
    If you get a "network_is_required" error, use liara_list_networks to find available networks.`,
    inputSchema: {
        // ... existing schema
    }
}
```

**Benefits:**
- AI assistants can use tools more effectively
- Better context for tool selection
- Reduced user errors

---

### 5. **Input Validation Enhancements** (Medium Priority)

**Current Issues:**
- Basic validation only
- No format hints in error messages
- Missing edge case validation

**Improvements:**
```typescript
// Enhanced validation with better messages
export function validateAppName(name: string): void {
    validateRequired(name, 'App name');
    
    if (name.length < 3) {
        throw new LiaraMcpError(
            `App name must be at least 3 characters (got ${name.length})`,
            'INVALID_APP_NAME',
            { name, length: name.length },
            ['Use a name like "my-app" or "api-service"']
        );
    }
    
    if (name.length > 32) {
        throw new LiaraMcpError(
            `App name must be at most 32 characters (got ${name.length})`,
            'INVALID_APP_NAME',
            { name, length: name.length }
        );
    }
    
    if (!/^[a-z0-9-]+$/.test(name)) {
        const invalidChars = name.match(/[^a-z0-9-]/g);
        throw new LiaraMcpError(
            `App name contains invalid characters: ${invalidChars?.join(', ')}`,
            'INVALID_APP_NAME',
            { name, invalidChars },
            ['Use only lowercase letters, numbers, and hyphens']
        );
    }
    
    // ... rest of validation
}
```

**Benefits:**
- Clearer error messages
- Faster debugging
- Better user experience

---

### 6. **Database Connection String Improvements** (Medium Priority)

**Current Issues:**
- Uses `any` type for database details
- May miss some connection string formats
- No validation of connection string

**Improvements:**
```typescript
interface DatabaseDetails {
    hostname?: string;
    host?: string;
    internalHostname?: string;
    port?: number;
    username?: string;
    user?: string;
    password?: string;
    rootPassword?: string;
    database?: string;
    name?: string;
    type: string;
}

export async function getDatabaseConnection(
    client: LiaraClient,
    databaseName: string
): Promise<DatabaseConnectionInfo> {
    validateRequired(databaseName, 'Database name');
    
    const dbDetails = await client.get<DatabaseDetails>(`/v1/databases/${databaseName}`);
    
    // Validate we have minimum required fields
    const host = dbDetails.hostname || dbDetails.host || dbDetails.internalHostname;
    if (!host) {
        throw new LiaraMcpError(
            'Database connection info missing host',
            'INCOMPLETE_CONNECTION_INFO',
            { databaseName, dbDetails }
        );
    }
    
    // ... rest of implementation with proper types
}
```

**Benefits:**
- Type safety
- Better error handling
- More reliable connection strings

---

### 7. **Response Format Standardization** (Low Priority)

**Current Issues:**
- Inconsistent response formats
- Some tools return JSON strings, others return objects
- Mixed success/error formats

**Improvements:**
```typescript
// Standardize all responses
interface ToolResponse {
    success: boolean;
    data?: any;
    message?: string;
    error?: {
        code: string;
        message: string;
        suggestions?: string[];
    };
}

// Use consistent format
return {
    content: [{
        type: 'text',
        text: JSON.stringify({
            success: true,
            data: app,
            message: `App "${app.name}" created successfully`
        }, null, 2)
    }]
};
```

**Benefits:**
- Consistent API
- Easier to parse
- Better error handling

---

### 8. **Documentation Improvements** (Low Priority)

**Current Issues:**
- README mentions removed tools (`liara_set_env_var`, `liara_delete_env_var`)
- Missing examples for new tools
- No migration guide

**Improvements:**
- Update README to reflect current tool set
- Add examples for all critical tools
- Create migration guide from v0.2.x to v0.3.0
- Add troubleshooting section

---

### 9. **Performance Optimizations** (Low Priority)

**Current Status:**
- Good retry logic already implemented
- Exponential backoff in place

**Potential Improvements:**
- Add request caching for read operations (with TTL)
- Batch operations where API supports it
- Connection pooling (if needed)

---

### 10. **Testing Enhancements** (Low Priority)

**Current Status:**
- Good test coverage exists
- Edge cases are tested

**Potential Improvements:**
- Add integration tests for WebSocket (when implemented)
- Add performance benchmarks
- Add load testing

---

## 🚀 Implementation Priority

### Phase 1 (Immediate - Next Release)
1. ✅ Type safety improvements (reduce `any` usage)
2. ✅ Enhanced error handling with suggestions
3. ✅ Update README documentation

### Phase 2 (Short Term)
4. ⚠️ WebSocket support for command execution
5. ⚠️ Better tool descriptions with examples
6. ⚠️ Input validation enhancements

### Phase 3 (Long Term)
7. ⚠️ Response format standardization
8. ⚠️ Performance optimizations
9. ⚠️ Testing enhancements

---

## 📊 Impact Analysis

| Improvement | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Type Safety | High | Medium | High |
| Error Handling | High | Low | High |
| WebSocket Support | High | High | High |
| Tool Descriptions | Medium | Low | Medium |
| Input Validation | Medium | Medium | Medium |
| DB Connection Types | Medium | Low | Medium |
| Response Format | Low | Medium | Low |
| Documentation | Low | Low | Low |
| Performance | Low | Medium | Low |
| Testing | Low | High | Low |

---

## 🎯 Quick Wins (Can be done immediately)

1. **Update README** - Remove references to deprecated tools
2. **Add error suggestions** - Quick addition to error messages
3. **Improve tool descriptions** - Add examples to critical tools
4. **Type improvements** - Replace obvious `any` types

---

## 💡 Additional Ideas

1. **Health Check Tool** - Check if app is responding
2. **Wait for Status Tool** - Wait until app reaches desired status
3. **Bulk Operations** - Create/delete multiple resources at once
4. **Configuration Templates** - Pre-defined configs for common setups
5. **Deployment Status Polling** - Automatic status checking with callbacks

---

## 📝 Notes

- All improvements should maintain backward compatibility
- Consider breaking changes only in major version updates
- Prioritize user experience improvements
- Keep tool count under 100 limit
- Maintain test coverage above 80%

