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
 * @openapi
 * /lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *       - in: query
 *         name: instructor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 */
router.get(
    '/',
    validate(paginationQuerySchema, 'query'),
    getAllLessons
);

/**
 * @openapi
 * /lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 */
router.get(
    '/:id',
    validate(idParamSchema, 'params'),
    getLessonById
);

/**
 * @openapi
 * /lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lesson'
 *     responses:
 *       201:
 *         description: Lesson created
 */
router.post(
    '/',
    validate(CreateLessonBodySchema, 'body'),
    createLesson
);

/**
 * @openapi
 * /lessons/{id}:
 *   put:
 *     summary: Update an existing lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lesson'
 *     responses:
 *       200:
 *         description: Lesson updated
 */
router.put(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(UpdateLessonBodySchema, 'body'),
    updateLesson
);

/**
 * @openapi
 * /lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted
 */
router.delete(
    '/:id',
    validate(idParamSchema, 'params'),
    deleteLesson
);

export default router;
