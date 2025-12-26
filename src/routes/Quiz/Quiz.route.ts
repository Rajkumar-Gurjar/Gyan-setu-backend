import { Router } from 'express';
import {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz
} from '../../controller/Quiz.controller';
import { validate } from '../../middleware/validation.middleware';
import {
    createQuizSchema,
    updateQuizSchema
} from '../../validation/schemas/Quiz.schema';
import { idParamSchema } from '../../validation/schemas/common.schema';


const router = Router();

/**
 * @route   GET /api/v1/quizzes
 */
router.get(
    '/',
    // validate(paginationQuerySchema, 'query'), // Will be added later with pagination
    getAllQuizzes
);

/**
 * @route   GET /api/v1/quizzes/:id
 */
router.get(
    '/:id',
    validate(idParamSchema, 'params'),
    getQuizById
);

/**
 * @route   POST /api/v1/quizzes
 */
router.post(
    '/',
    validate(createQuizSchema, 'body'),
    createQuiz
);

/**
 * @route   PATCH /api/v1/quizzes/:id
 */
router.patch(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateQuizSchema, 'body'),
    updateQuiz
);

/**
 * @route   DELETE /api/v1/quizzes/:id
 */
router.delete(
    '/:id',
    validate(idParamSchema, 'params'),
    deleteQuiz
);

export default router;
