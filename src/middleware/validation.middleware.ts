/**
 * Validation Middleware
 *
 * This middleware validates incoming request data using Zod schemas.
 * It acts as a gatekeeper: it runs BEFORE your controller, ensuring that
 * your business logic only ever receives valid, clean data.
 *
 * @module middleware/validation.middleware
 *
 * @example
 * // Usage in Lesson Routes:
 * import { validate } from '../middleware/validation.middleware';
 * import { createLessonSchema } from '../schemas/lesson.schema';
 *
 * router.post('/', validate(createLessonSchema), createLesson);
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.utils'; // Adjust path if needed

/**
 * Which part of the request to validate.
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates a validation middleware for request data.
 *
 * This function returns the actual middleware that Express uses.
 * It automates the process of:
 * 1. Extracting data (from body, query, or params)
 * 2. parsing it with Zod
 * 3. Handling errors automatically
 *
 * @param schema - The Zod schema to validate against
 * @param target - 'body', 'query', or 'params' (default: 'body')
 */
export function validate(
    schema: ZodSchema,
    target: ValidationTarget = 'body'
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // 1. Extract data based on target
            const data = req[target];

            // 2. Validate & Transform
            // .parse() throws an error if invalid, or returns cleaned data if valid
            const validated = schema.parse(data);

            // 3. Replace request data with validated data
            // This ensures controllers get numbers instead of strings for query params like ?page=1
            if (target === 'body') {
                req.body = validated;
            } else if (target === 'query') {
                // req.query is technically a ParsedQs object, so we use Object.assign
                Object.assign(req.query, validated);
            } else if (target === 'params') {
                Object.assign(req.params, validated);
            }

            // 4. Success! Move to the controller
            next();

        } catch (error) {
            // 5. Handle Validation Errors
            if (error instanceof ZodError) {
                // Format Zod errors into a clean API response
                const validationErrors = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));

                // Send 400 Bad Request and STOP the request here.
                // The controller will never run.
                sendError(res, 'Validation failed', 400, validationErrors);
                return;
            }

            // If it's a code error (not a validation error), pass to global error handler
            next(error);
        }
    };
}

/**
 * Validates multiple parts of the request at once.
 * Useful when a route needs to validate both URL params (ID) AND Body (Data).
 *
 * @example
 * router.put('/:id',
 * validateMultiple({
 * params: idParamSchema,
 * body: updateLessonSchema
 * }),
 * updateLesson
 * );
 */
export function validateMultiple(
    schemas: Partial<Record<ValidationTarget, ZodSchema>>
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const allErrors: Array<{ field: string; message: string }> = [];

        // Iterate over all provided schemas (body, params, query)
        for (const [target, schema] of Object.entries(schemas)) {
            if (!schema) continue;

            try {
                const data = req[target as ValidationTarget];
                const validated = schema.parse(data);

                // Update request object with validated data
                if (target === 'body') req.body = validated;
                else if (target === 'query') Object.assign(req.query, validated);
                else if (target === 'params') Object.assign(req.params, validated);

            } catch (error) {
                if (error instanceof ZodError) {
                    // Prefix field names so we know where the error came from (e.g., "body.title")
                    const errors = error.issues.map((issue) => ({
                        field: `${target}.${issue.path.join('.')}`,
                        message: issue.message
                    }));
                    allErrors.push(...errors);
                } else {
                    next(error);
                    return;
                }
            }
        }

        // If we found ANY errors in ANY part of the request, fail now.
        if (allErrors.length > 0) {
            sendError(res, 'Validation failed', 400, allErrors);
            return;
        }

        next();
    };
}

// ============================================================================
// Security & Sanitization Utilities
// ============================================================================

/**
 * Sanitizes a string to prevent XSS (Cross-Site Scripting) attacks.
 * Converts characters like <, >, " into safe HTML entities.
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Recursively sanitizes all string values in an object.
 * Useful for cleaning the entire req.body before processing.
 */
export function sanitizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
        return sanitizeString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item)) as unknown as T;
    }

    if (obj && typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized as T;
    }

    return obj;
}