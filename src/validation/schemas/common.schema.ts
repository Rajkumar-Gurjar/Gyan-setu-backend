/**
 * Common Zod Schemas
 *
 * Shared validation patterns used across multiple entities.
 * @module schemas/common.schema
 */

import { z } from 'zod';

/**
 * MongoDB ObjectId validation pattern.
 * Use this when a field MUST be a MongoDB ID (like 'createdBy' user reference).
 */
export const mongoIdSchema = z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ID format');

/**
 * General ID schema for route parameters.
 * * UPDATED: This allows both MongoDB IDs (24 hex chars) AND
 * custom IDs like "lesson-001".
 */
export const routeParamIdSchema = z.string().min(1, 'ID is required');

/**
 * Pagination query parameters schema.
 * Handles parsing strings to numbers and setting defaults.
 */
export const paginationQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => {
            const parsed = parseInt(val || '1', 10);
            return isNaN(parsed) || parsed < 1 ? 1 : parsed;
        }),
    limit: z
        .string()
        .optional()
        .transform((val) => {
            const parsed = parseInt(val || '10', 10);
            if (isNaN(parsed) || parsed < 1) return 10;
            return Math.min(parsed, 100); // Max 100 items per page
        }),

    // Added common filters for Lessons
    subject: z.string().optional(),
    grade: z.string().transform(val => parseInt(val, 10)).optional(),
    instructor: z.string().optional()
});

/**
 * ID parameter schema for routes like GET /lessons/:id
 */
export const idParamSchema = z.object({
    id: routeParamIdSchema
});

// Type inference for use in controllers
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type RouteParams = z.infer<typeof idParamSchema>;