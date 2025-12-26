/**
 * Quiz Controller
 *
 * This controller will handle all CRUD operations for Quizzes.
 */

import { Request, Response } from 'express';
import { sendSuccess, sendError, sendNotFound } from '../utils/response.utils';
import { QuizService } from '../services/Quiz.service';

/**
 * Creates a new quiz.
 * @route POST /api/v1/quizzes
 */
export async function createQuiz(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        const newQuiz = await QuizService.createQuiz(req.body, userId);
        sendSuccess(res, newQuiz, 201, 'Quiz created successfully');
    } catch (error: any) {
        console.error('Error in createQuiz:', error);
        sendError(res, error.message || 'Failed to create quiz', 500);
    }
}

/**
 * Retrieves all quizzes.
 * @route GET /api/v1/quizzes
 */
export async function getAllQuizzes(req: Request, res: Response): Promise<void> {
    try {
        const quizzes = await QuizService.getAllQuizzes(req.query);
        sendSuccess(res, quizzes, 200, 'Quizzes retrieved successfully');
    } catch (error: any) {
        console.error('Error in getAllQuizzes:', error);
        sendError(res, 'Failed to fetch quizzes', 500);
    }
}

/**
 * Retrieves a single quiz by ID.
 * @route GET /api/v1/quizzes/:id
 */
export async function getQuizById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const userRole = (req as any).user?.role || 'student';
        
        const quiz = await QuizService.getQuizById(id, userRole);
        
        if (!quiz) {
            return sendNotFound(res, 'Quiz');
        }

        sendSuccess(res, quiz);
    } catch (error) {
        console.error('Error in getQuizById:', error);
        sendError(res, 'Failed to fetch quiz', 500);
    }
}

/**
 * Updates an existing quiz.
 * @route PATCH /api/v1/quizzes/:id
 */
export async function updateQuiz(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updatedQuiz = await QuizService.updateQuiz(id, req.body);
        
        if (!updatedQuiz) {
            return sendNotFound(res, 'Quiz');
        }

        sendSuccess(res, updatedQuiz, 200, 'Quiz updated successfully');
    } catch (error: any) {
        console.error('Error in updateQuiz:', error);
        sendError(res, error.message || 'Failed to update quiz', 500);
    }
}

/**
 * Deletes a quiz.
 * @route DELETE /api/v1/quizzes/:id
 */
export async function deleteQuiz(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const deletedQuiz = await QuizService.deleteQuiz(id);
        
        if (!deletedQuiz) {
            return sendNotFound(res, 'Quiz');
        }

        sendSuccess(res, null, 200, 'Quiz deleted successfully');
    } catch (error: any) {
        console.error('Error in deleteQuiz:', error);
        sendError(res, 'Failed to delete quiz', 500);
    }
}

/**
 * Placeholder for submitting a quiz attempt.
 * @route POST /api/v1/quizzes/:id/attempt
 */
export async function submitQuizAttempt(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return sendError(res, 'Authentication required', 401);
        }
        
        const result = await QuizService.submitQuizAttempt(id, userId, req.body);
        
        sendSuccess(res, result, 201, 'Quiz attempt submitted successfully');
    } catch (error: any) {
        if (error.message === 'Quiz not found') {
            return sendNotFound(res, 'Quiz');
        }
        console.error('Error in submitQuizAttempt:', error);
        sendError(res, 'Failed to submit quiz attempt', 500);
    }
}

/**
 * Retrieves the current user's quiz attempts.
 * @route GET /api/v1/progress/quizzes/me
 */
export async function getMyQuizAttempts(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return sendError(res, 'Authentication required', 401);
        }

        const attempts = await QuizService.getUserQuizAttempts(userId);
        sendSuccess(res, attempts, 200, 'Quiz attempts retrieved successfully');
    } catch (error: any) {
        console.error('Error in getMyQuizAttempts:', error);
        sendError(res, 'Failed to fetch quiz attempts', 500);
    }
}

/**
 * Retrieves analytics for a specific quiz.
 * @route GET /api/v1/quizzes/:id/analytics
 */
export async function getQuizAnalytics(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const analytics = await QuizService.getQuizAnalytics(id);
        sendSuccess(res, analytics, 200, 'Quiz analytics retrieved successfully');
    } catch (error: any) {
        if (error.message === 'Quiz not found') {
            return sendNotFound(res, 'Quiz');
        }
        console.error('Error in getQuizAnalytics:', error);
        sendError(res, 'Failed to fetch quiz analytics', 500);
    }
}
