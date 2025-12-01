# Test Suite

This directory contains comprehensive tests for the Liara MCP server.

## Test Structure

```
src/__tests__/
├── api/
│   └── client.test.ts          # API client tests
├── services/
│   ├── apps.test.ts             # App service tests
│   ├── databases.test.ts       # Database service tests
│   ├── deployment.test.ts       # Deployment service tests
│   ├── disks.test.ts            # Disk service tests
│   ├── dns.test.ts              # DNS service tests
│   ├── domains.test.ts          # Domain service tests
│   ├── environment.test.ts      # Environment variable tests
│   ├── iaas.test.ts             # IaaS/VM service tests
│   ├── mail.test.ts             # Mail service tests
│   ├── network.test.ts          # Network service tests
│   ├── observability.test.ts    # Observability tests
│   ├── plans.test.ts            # Plans service tests
│   └── storage.test.ts          # Storage service tests
├── utils/
│   └── errors.test.ts           # Validation utility tests
├── edge-cases/
│   ├── error-handling.test.ts   # Error handling edge cases
│   ├── pagination-edge-cases.test.ts  # Pagination edge cases
│   └── validation.test.ts       # Validation edge cases
└── integration/
    ├── mcp-server.test.ts       # MCP server integration tests
    └── pagination.test.ts       # Pagination integration tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

- **Unit Tests**: Test individual service functions with mocked clients
- **Integration Tests**: Test pagination and type conversions
- **Edge Cases**: Test boundary conditions and error scenarios
- **Validation Tests**: Test input validation functions

## Mocking

Tests use Vitest's mocking capabilities to:
- Mock API client responses
- Test error handling scenarios
- Verify function calls and parameters
- Test pagination and filtering logic

## Adding New Tests

When adding new features:
1. Add unit tests for new service functions
2. Add edge case tests for validation
3. Update integration tests if needed
4. Ensure all tests pass before committing
