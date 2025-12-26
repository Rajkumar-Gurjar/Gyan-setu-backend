import { Router } from 'express';
import {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getQuizAnalytics
} from '../../controller/Quiz.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { rateLimiter } from '../../middleware/rateLimit.middleware';
import {
    createQuizSchema,
    updateQuizSchema,
    submitQuizAttemptSchema
} from '../../validation/schemas/Quiz.schema';
import { idParamSchema } from '../../validation/schemas/common.schema';


const router = Router();

// Apply global rate limiting to all quiz routes as a baseline
router.use(rateLimiter(false));

/**
 * @openapi
 * /quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of quizzes
 */
router.get(
    '/',
    authenticate,
    // validate(paginationQuerySchema, 'query'), // Will be added later with pagination
    getAllQuizzes
);

/**
 * @openapi
 * /quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz details
 */
router.get(
    '/:id',
    authenticate,
    validate(idParamSchema, 'params'),
    getQuizById
);

/**
 * @openapi
 * /quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quiz'
 *     responses:
 *       201:
 *         description: Quiz created
 */
router.post(
    '/',
    authenticate,
    authorize(['teacher', 'admin']),
    rateLimiter(true), // User-specific limit for creation
    validate(createQuizSchema, 'body'),
    createQuiz
);

/**
 * @openapi
 * /quizzes/{id}:
 *   patch:
 *     summary: Update an existing quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/Quiz'
 *     responses:
 *       200:
 *         description: Quiz updated
 */
router.patch(
    '/:id',
    authenticate,
    authorize(['teacher', 'admin']),
    rateLimiter(true), // User-specific limit for updates
    validate(idParamSchema, 'params'),
    validate(updateQuizSchema, 'body'),
    updateQuiz
);

/**
 * @openapi
 * /quizzes/{id}:
 *   delete:
 *     summary: Soft-delete a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Quiz deleted
 */
router.delete(
    '/:id',
    authenticate,
    authorize(['teacher', 'admin']),
    rateLimiter(true), // User-specific limit for deletion
    validate(idParamSchema, 'params'),
    deleteQuiz
);

/**
 * @openapi
 * /quizzes/{id}/attempt:
 *   post:
 *     summary: Submit a quiz attempt
 *     tags: [Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Quiz attempt submitted
 */
router.post(
    '/:id/attempt',
    authenticate,
    rateLimiter(true), // User-specific limit for attempts
    validate(idParamSchema, 'params'),
    validate(submitQuizAttemptSchema, 'body'),
    submitQuizAttempt
);

/**
 * @openapi
 * /quizzes/{id}/analytics:
 *   get:
 *     summary: Get quiz analytics
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz analytics data
 */
router.get(
    '/:id/analytics',
    authenticate,
    authorize(['teacher', 'admin']),
    validate(idParamSchema, 'params'),
    getQuizAnalytics
);

export default router;
