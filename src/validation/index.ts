/**
 * Schema Exports
 *
 * This file acts as a central hub (barrel file) for all validation schemas.
 * It allows you to import multiple schemas from a single path.
 *
 * Usage:
 * import { createLessonSchema, PaginationQuery } from '../schemas';
 */

// Common schemas (Shared validation logic)
export {
    mongoIdSchema,
    routeParamIdSchema,
    paginationQuerySchema,
    idParamSchema,
    type PaginationQuery,
    type RouteParams
} from './schemas/common.schema';

// Lesson schemas (Domain specific validation)
export {
    CreateLessonBodySchema,
    UpdateLessonBodySchema,
    lessonQuerySchema,
    type CreateLessonDTO,
    type UpdateLessonDTO
} from './schemas/Lesson.schema';