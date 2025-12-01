import { describe, it, expect } from 'vitest';
import { paginationToParams, PaginationOptions } from '../../api/types.js';

describe('Pagination Integration Tests', () => {
    describe('Real-world pagination scenarios', () => {
        it('should handle first page request', () => {
            const params = paginationToParams({ page: 1, perPage: 20 });
            expect(params).toEqual({ page: 1, perPage: 20 });
        });

        it('should handle second page request', () => {
            const params = paginationToParams({ page: 2, perPage: 20 });
            expect(params).toEqual({ page: 2, perPage: 20 });
        });

        it('should handle offset-based pagination', () => {
            const params = paginationToParams({ offset: 40, limit: 20 });
            expect(params).toEqual({ offset: 40, limit: 20 });
        });

        it('should handle large page numbers', () => {
            const params = paginationToParams({ page: 100, perPage: 10 });
            expect(params).toEqual({ page: 100, perPage: 10 });
        });

        it('should handle large perPage values', () => {
            const params = paginationToParams({ page: 1, perPage: 1000 });
            expect(params).toEqual({ page: 1, perPage: 1000 });
        });
    });

    describe('Pagination parameter combinations', () => {
        it('should handle page without perPage', () => {
            const params = paginationToParams({ page: 2 });
            expect(params).toEqual({ page: 2 });
        });

        it('should handle perPage without page', () => {
            const params = paginationToParams({ perPage: 50 });
            expect(params).toEqual({ perPage: 50 });
        });

        it('should handle limit without offset', () => {
            const params = paginationToParams({ limit: 100 });
            expect(params).toEqual({ limit: 100 });
        });

        it('should handle offset without limit', () => {
            const params = paginationToParams({ offset: 50 });
            expect(params).toEqual({ offset: 50 });
        });
    });
});
