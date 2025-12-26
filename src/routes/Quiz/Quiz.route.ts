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
 * @route   GET /api/v1/quizzes
 */
router.get(
    '/',
    authenticate,
    // validate(paginationQuerySchema, 'query'), // Will be added later with pagination
    getAllQuizzes
);

/**
 * @route   GET /api/v1/quizzes/:id
 */
router.get(
    '/:id',
    authenticate,
    validate(idParamSchema, 'params'),
    getQuizById
);

/**
 * @route   POST /api/v1/quizzes
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
 * @route   PATCH /api/v1/quizzes/:id
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
 * @route   DELETE /api/v1/quizzes/:id
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
 * @route   POST /api/v1/quizzes/:id/attempt
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
 * @route   GET /api/v1/quizzes/:id/analytics
 */
router.get(
    '/:id/analytics',
    authenticate,
    authorize(['teacher', 'admin']),
    validate(idParamSchema, 'params'),
    getQuizAnalytics
);

export default router;
