import { z } from 'zod';
import { paginationQuerySchema, mongoIdSchema, routeParamIdSchema } from './common.schema';

/**
 * Schema for the content of a lesson
 */
const contentSchema = z.object({
    type: z.string().min(1, "Content type is required"),
    videoKey: z.string().optional(),
    videoDuration: z.number().optional(),
    body: z.record(z.string()).optional()
});

/**
 * Schema for creating a new lesson's request body
 */
export const CreateLessonBodySchema = z.object({
    lessonId: z.string().min(3, "Lesson ID must be at least 3 characters"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    subject: z.string().min(1, "Subject is required"),
    grade: z.number().min(1, "Grade must be at least 1").max(12, "Grade must be at most 12"),
    duration: z.number().positive("Duration must be positive"),
    description: z.string().optional(),
    instructor: z.string().min(1, "Instructor is required"),
    content: contentSchema.optional(),
    tags: z.array(z.string()).optional(),
    createdBy: mongoIdSchema.optional()
});

/**
 * Schema for updating a lesson's request body
 */
export const UpdateLessonBodySchema = CreateLessonBodySchema.partial();

/**
 * Schema for querying lessons
 */
export const lessonQuerySchema = paginationQuerySchema.extend({
    subject: z.string().optional(),
    grade: z.string().transform(val => parseInt(val, 10)).optional(),
    instructor: z.string().optional()
});

// Type Definitions
export type CreateLessonDTO = z.infer<typeof CreateLessonBodySchema>;
export type UpdateLessonDTO = z.infer<typeof UpdateLessonBodySchema>;
export type LessonQueryDTO = z.infer<typeof lessonQuerySchema>;
