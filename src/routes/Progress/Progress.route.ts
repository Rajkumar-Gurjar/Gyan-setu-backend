import { Router } from 'express';
import { getMyQuizAttempts } from '../../controller/Quiz.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @openapi
 * /progress/quizzes/me:
 *   get:
 *     summary: Get my quiz attempts
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of quiz attempts
 */
router.get('/quizzes/me', authenticate, getMyQuizAttempts);

export default router;
