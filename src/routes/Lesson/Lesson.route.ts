/**
 * Lessons Routes
 *
 * Defines all routes for Lesson CRUD operations.
 * Maps HTTP methods and paths to specific controller functions and validation middleware.
 *
 * Routes:
 * - GET    /lessons       - Get all lessons (paginated, filterable by subject/grade)
 * - GET    /lessons/:id   - Get single lesson by ID (Mongo ID or custom lessonId)
 * - POST   /lessons       - Create new lesson
 * - PUT    /lessons/:id   - Update existing lesson
 * - DELETE /lessons/:id   - Delete lesson
 */

import { Router } from 'express';
import {
    getAllLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
} from '../../controller/Lesson.controller'; // Adjust path based on your folder structure
import { validate } from '../../middleware/validation.middleware';
import {
    createLessonSchema,
    updateLessonSchema,
    paginationQuerySchema,
    idParamSchema
} from '../../validation'; // Imports from the index.ts barrel file we created

const router = Router();

/**
 * @route   GET /api/v1/lessons
 * @desc    Get all lessons with optional filters
 * @query   page, limit, subject, grade, instructor
 * @access  Public
 */
router.get(
    '/',
    validate(paginationQuerySchema, 'query'),
    getAllLessons
);

/**
 * @route   GET /api/v1/lessons/:id
 * @desc    Get a single lesson by ID
 * @param   id - MongoDB ObjectId OR Custom lessonId (e.g., 'lesson-001')
 * @access  Public
 */
router.get(
    '/:id',
    validate(idParamSchema, 'params'),
    getLessonById
);

/**
 * @route   POST /api/v1/lessons
 * @desc    Create a new lesson
 * @body    CreateLessonDTO
 * @access  Public (will be protected later)
 */
router.post(
    '/',
    validate(createLessonSchema),
    createLesson
);

/**
 * @route   PUT /api/v1/lessons/:id
 * @desc    Update an existing lesson
 * @param   id - MongoDB ObjectId OR Custom lessonId
 * @body    UpdateLessonDTO (partial update)
 * @access  Public (will be protected later)
 */
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateLessonSchema),
    updateLesson
);

/**
 * @route   DELETE /api/v1/lessons/:id
 * @desc    Delete a lesson
 * @param   id - MongoDB ObjectId OR Custom lessonId
 * @access  Public (will be protected later)
 */
router.delete(
    '/:id',
    validate(idParamSchema, 'params'),
    deleteLesson
);

export default router;