import { describe, it, expect } from 'vitest';
import { paginationToParams, PaginationOptions } from '../../api/types.js';

describe('Pagination Edge Cases', () => {
    describe('conflicting parameters', () => {
        it('should prefer page over offset when both provided', () => {
            const options: PaginationOptions = {
                page: 2,
                offset: 10,
                perPage: 20,
                limit: 50,
            };
            const result = paginationToParams(options);
            expect(result).toEqual({
                page: 2,
                perPage: 20,
            });
            expect(result.offset).toBeUndefined();
            expect(result.limit).toBeUndefined();
        });

        it('should prefer perPage over limit when both provided', () => {
            const options: PaginationOptions = {
                page: 1,
                perPage: 25,
                limit: 100,
            };
            const result = paginationToParams(options);
            expect(result).toEqual({
                page: 1,
                perPage: 25,
            });
            expect(result.limit).toBeUndefined();
        });
    });

    describe('boundary values', () => {
        it('should handle page 1 (first page)', () => {
            expect(paginationToParams({ page: 1, perPage: 10 })).toEqual({
                page: 1,
                perPage: 10,
            });
        });

        it('should handle very large page numbers', () => {
            expect(paginationToParams({ page: 999999, perPage: 10 })).toEqual({
                page: 999999,
                perPage: 10,
            });
        });

        it('should handle very large perPage values', () => {
            expect(paginationToParams({ page: 1, perPage: 1000000 })).toEqual({
                page: 1,
                perPage: 1000000,
            });
        });
    });

    describe('zero and negative values', () => {
        it('should allow zero offset', () => {
            expect(paginationToParams({ offset: 0, limit: 10 })).toEqual({
                offset: 0,
                limit: 10,
            });
        });

        it('should allow negative values (API will handle validation)', () => {
            expect(paginationToParams({ page: -1, perPage: -10 })).toEqual({
                page: -1,
                perPage: -10,
            });
        });
    });
});
