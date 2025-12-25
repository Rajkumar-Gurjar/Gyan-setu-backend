/**
 * Lessons Routes
 */

import { Router } from 'express';
import {
    getAllLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
} from '../../controller/Lesson.controller';
import { validate } from '../../middleware/validation.middleware';
import {
    CreateLessonBodySchema,
    UpdateLessonBodySchema,
    paginationQuerySchema,
    idParamSchema
} from '../../validation';

const router = Router();

/**
 * @route   GET /api/v1/lessons
 */
router.get(
    '/',
    validate(paginationQuerySchema, 'query'),
    getAllLessons
);

/**
 * @route   GET /api/v1/lessons/:id
 */
router.get(
    '/:id',
    validate(idParamSchema, 'params'),
    getLessonById
);

/**
 * @route   POST /api/v1/lessons
 */
router.post(
    '/',
    validate(CreateLessonBodySchema, 'body'),
    createLesson
);

/**
 * @route   PUT /api/v1/lessons/:id
 */
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(UpdateLessonBodySchema, 'body'),
    updateLesson
);

/**
 * @route   DELETE /api/v1/lessons/:id
 */
router.delete(
    '/:id',
    validate(idParamSchema, 'params'),
    deleteLesson
);

export default router;
