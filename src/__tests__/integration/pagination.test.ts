import { describe, it, expect } from 'vitest';
import { paginationToParams, PaginationOptions } from '../../api/types.js';

describe('Pagination Integration', () => {
    describe('paginationToParams edge cases', () => {
        it('should handle zero values correctly', () => {
            expect(paginationToParams({ page: 0, perPage: 0 })).toEqual({
                page: 0,
                perPage: 0,
            });
        });

        it('should handle negative values', () => {
            expect(paginationToParams({ page: -1, perPage: -10 })).toEqual({
                page: -1,
                perPage: -10,
            });
        });

        it('should handle large values', () => {
            expect(paginationToParams({ page: 1000, perPage: 10000 })).toEqual({
                page: 1000,
                perPage: 10000,
            });
        });

        it('should handle only page without perPage', () => {
            expect(paginationToParams({ page: 2 })).toEqual({ page: 2 });
        });

        it('should handle only perPage without page', () => {
            expect(paginationToParams({ perPage: 20 })).toEqual({ perPage: 20 });
        });

        it('should handle only offset without limit', () => {
            expect(paginationToParams({ offset: 10 })).toEqual({ offset: 10 });
        });

        it('should handle only limit without offset', () => {
            expect(paginationToParams({ limit: 50 })).toEqual({ limit: 50 });
        });
    });
});

