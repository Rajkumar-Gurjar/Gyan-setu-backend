import { z } from 'zod';
import { paginationQuerySchema, mongoIdSchema, routeParamIdSchema } from './common.schema';

/**
 * Schema for creating a new lesson
 */
export const createLessonSchema = z.object({
    body: z.object({
        // Custom ID validation (e.g. "lesson-001")
        lessonId: z.string().min(3, "Lesson ID must be at least 3 characters"),

        title: z.string().min(3, "Title must be at least 3 characters"),
        subject: z.string().min(1, "Subject is required"),

        // Grade validation (1-12)
        grade: z.number()
            .min(1, "Grade must be at least 1")
            .max(12, "Grade must be at most 12"),

        duration: z.number().positive("Duration must be positive"),

        description: z.string().optional(),
        instructor: z.string().min(1, "Instructor is required"),

        // createdBy must be a valid Mongo ID because it links to a User model
        // We make it optional here because it's often added by middleware (req.user)
        // rather than sent in the request body directly.
        createdBy: mongoIdSchema.optional()
    })
});

/**
 * Schema for updating a lesson
 * - Params: Accepts custom ID or Mongo ID
 * - Body: All fields from create schema are optional
 */
export const updateLessonSchema = z.object({
    params: z.object({
        id: routeParamIdSchema
    }),
    body: createLessonSchema.shape.body.partial()
});

/**
 * Schema for querying lessons
 * Extends the common pagination schema with lesson-specific filters
 */
export const lessonQuerySchema = paginationQuerySchema.extend({
    subject: z.string().optional(),
    grade: z.string().transform(val => parseInt(val, 10)).optional(),
    instructor: z.string().optional()
});

// ==========================================
// Type Definitions (DTOs)
// ==========================================

// These types are automatically generated from the Zod schemas above.
// You don't need to write interfaces manually!

export type CreateLessonDTO = z.infer<typeof createLessonSchema>['body'];
export type UpdateLessonDTO = z.infer<typeof updateLessonSchema>['body'];
export type LessonQueryDTO = z.infer<typeof lessonQuerySchema>;