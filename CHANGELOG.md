# Changelog

## [0.3.2] - 2024-12-XX

### Completed All Improvements

#### ✅ Response Format Standardization
- All tools now return consistent JSON format:
  - Success: `{success: true, data: ..., message: ...}`
  - Error: `{success: false, error: {code, message, suggestions}}`
- Easier to parse and handle programmatically
- Better error context with suggestions

#### ✅ Enhanced Error Formatting
- `formatErrorForMcp()` now uses `formatMessage()` for LiaraMcpError
- Error messages automatically include suggestions when available
- Consistent error format across all tools

---

## [0.3.1] - 2024-12-XX

### Comprehensive Improvements

#### ✅ Type Safety Improvements
- Replaced 17 instances of `any` with proper types
- API client methods now use `Record<string, string | number | boolean>`
- Error handling uses `unknown` with proper type guards
- Better IDE autocomplete and compile-time error detection

#### ✅ Enhanced Error Handling
- Added `suggestions` field to `LiaraMcpError` class
- Added `formatMessage()` method for formatted error output
- All errors now provide actionable suggestions:
  - App not found → suggests checking name, listing apps
  - Validation errors → shows specific issues with examples
  - Command execution errors → suggests CLI alternatives

#### ✅ Improved Tool Descriptions
- Added examples to critical tools:
  - `liara_create_app` - Basic and advanced examples
  - `liara_set_env_vars` - Single and multiple variable examples
  - `liara_scale_app` - Scale up/down examples
  - `liara_exec_command` - Migration and initialization examples
  - `liara_get_database_connection` - Usage examples

#### ✅ Enhanced Validation Messages
- App name validation now shows:
  - Character count when too short/long
  - Invalid characters listed
  - Specific suggestions for correct format
- All validation errors include helpful guidance

#### ✅ Database Connection Type Safety
- Created `DatabaseDetails` interface
- Replaced `any` with proper types
- Added validation for missing host
- Better error messages with suggestions

#### ✅ Documentation Updates
- Fixed README to remove deprecated tools
- Updated environment variables section
- All documentation now reflects current tool set

---

## [0.3.0] - 2024-12-XX

### Critical Automation Tools

#### ✅ Added Tools
- `liara_scale_app` - Scale app to specific replica count
- `liara_exec_command` - Execute commands in containers

#### ✅ Tool Consolidation
- Removed duplicate `liara_delete_vm` entry
- Consolidated `liara_set_env_var` → `liara_set_env_vars` (handles single or multiple)
- Consolidated `liara_delete_env_var` → `liara_delete_env_vars` (handles single or multiple)

#### ✅ Parameter Additions
- Added `bundlePlanID` parameter to `liara_create_app`
- `network` parameter already working from v0.2.8

---

## Summary of All Improvements

### Type Safety
- ✅ 17 `any` types replaced with proper types
- ✅ Better type guards for error handling
- ✅ Proper interfaces for database details

### Error Handling
- ✅ Suggestions in all error messages
- ✅ Context-aware error messages
- ✅ Standardized error format

### User Experience
- ✅ Better tool descriptions with examples
- ✅ Enhanced validation messages
- ✅ Actionable error suggestions

### Code Quality
- ✅ Consistent response formats
- ✅ Better documentation
- ✅ Improved maintainability

### Tool Count
- ✅ 99/100 tools (under limit)
- ✅ All critical automation tools implemented
- ✅ Ready for full deployment automation

---

## Migration Guide

### From v0.2.x to v0.3.2

#### Environment Variables
**Before:**
```javascript
// Separate tools for single vs multiple
liara_set_env_var({appName: "app", key: "KEY", value: "value"})
liara_set_env_vars({appName: "app", variables: [...]})
```

**After:**
```javascript
// Single tool handles both
liara_set_env_vars({appName: "app", variables: [{key: "KEY", value: "value"}]})  // Single
liara_set_env_vars({appName: "app", variables: [{key: "KEY1", value: "v1"}, ...]})  // Multiple
```

#### Response Format
**Before:**
```javascript
// Mixed formats
"App created successfully"
JSON.stringify(app)
```

**After:**
```javascript
// Consistent format
{
  "success": true,
  "data": {...},
  "message": "App created successfully"
}
```

#### Error Handling
**Before:**
```javascript
// Generic errors
"App not found"
```

**After:**
```javascript
// Errors with suggestions
{
  "success": false,
  "error": {
    "code": "APP_NOT_FOUND",
    "message": "App 'my-app' not found",
    "suggestions": [
      "Check if the app name is correct",
      "Use liara_list_apps to see all available apps"
    ]
  }
}
```

---

## Next Steps

1. **Update**: `npm install -g liara-mcp@0.3.2`
2. **Restart** your MCP client
3. **Enjoy** improved error messages and consistent responses!

