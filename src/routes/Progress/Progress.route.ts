import { Router } from 'express';
import { getMyQuizAttempts } from '../../controller/Quiz.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/progress/quizzes/me
 */
router.get('/quizzes/me', authenticate, getMyQuizAttempts);

export default router;
