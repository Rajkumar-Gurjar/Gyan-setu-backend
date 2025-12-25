/**
 * Main Router
 *
 * Aggregates all route modules and exports a single router
 * to be mounted on the Express application.
 *
 * API Base: /api/v1
 *
 * Available endpoints:
 * - /api/v1/health     - Health check
 * - /api/v1/lessons    - Lesson CRUD
 */

import { Router, Request, Response } from 'express';
import lessonRouter from './Lesson/Lesson.route';
// Future imports:
// import authRouter from './auth.routes';
// import quizRouter from './quiz.routes';

const router = Router();

// ============================================================================
// Health Check
// ============================================================================
/**
 * @route   GET /api/v1/health
 * @desc    Check if API is running
 * @access  Public
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

// Future Mounts:
// router.use('/auth', authRouter);
// router.use('/quizzes', quizRouter);

export default router;