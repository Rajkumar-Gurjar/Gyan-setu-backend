import { Router, Request, Response } from 'express';
import lessonRouter from './Lesson/Lesson.route';
import quizRouter from './Quiz/Quiz.route'; // Import QuizRouter
import authRouter from './Auth/Auth.route'; // Import AuthRouter
import progressRouter from './Progress/Progress.route';

const router = Router();

// ============================================================================
// Health Check
// ============================================================================
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Check API health
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'GyaanSetu API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================================================
// Mount Entity Routers
// ============================================================================

// Lesson Routes
router.use('/lessons', lessonRouter);

// Quiz Routes
router.use('/quizzes', quizRouter); // Mount QuizRouter

// Auth Routes
router.use('/auth', authRouter); // Mount AuthRouter

// Progress Routes
router.use('/progress', progressRouter);

export default router;