import { describe, it, expect } from 'vitest';
import { paginationToParams, PaginationOptions } from '../../api/types.js';

describe('Pagination Utilities', () => {
    describe('paginationToParams', () => {
        it('should return empty object when no pagination provided', () => {
            expect(paginationToParams(undefined)).toEqual({});
            expect(paginationToParams({})).toEqual({});
        });

        it('should convert page/perPage to params', () => {
            const options: PaginationOptions = {
                page: 2,
                perPage: 20,
            };
            expect(paginationToParams(options)).toEqual({
                page: 2,
                perPage: 20,
            });
        });

        it('should convert offset/limit to params', () => {
            const options: PaginationOptions = {
                offset: 10,
                limit: 50,
            };
            expect(paginationToParams(options)).toEqual({
                offset: 10,
                limit: 50,
            });
        });

        it('should prefer page over offset', () => {
            const options: PaginationOptions = {
                page: 1,
                offset: 10,
            };
            expect(paginationToParams(options)).toEqual({
                page: 1,
            });
        });

        it('should prefer perPage over limit', () => {
            const options: PaginationOptions = {
                perPage: 20,
                limit: 50,
            };
            expect(paginationToParams(options)).toEqual({
                perPage: 20,
            });
        });

        it('should handle mixed combinations', () => {
            expect(paginationToParams({ page: 1, limit: 10 })).toEqual({
                page: 1,
                limit: 10,
            });
            expect(paginationToParams({ offset: 5, perPage: 25 })).toEqual({
                offset: 5,
                perPage: 25,
            });
        });
    });
});
