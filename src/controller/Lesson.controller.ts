/**
 * Lessons Controller
 *
 * This controller handles all CRUD (Create, Read, Update, Delete) operations
 * for the educational lessons. It connects HTTP requests to the LessonModel
 * database operations.
 *
 * @module controllers/lessons.controller
 */

import { Request, Response } from 'express';
import { LessonModel, ILesson } from '../models/lesson/Lesson.model'; // Adjust path as needed
import {
    sendSuccess,
    sendError,
    getPaginationMeta,
    parsePaginationParams
} from '../utils/response.utils'; // Adjust path as needed

/**
 * Get all lessons with pagination and filters.
 *
 * @route GET /api/v1/lessons
 *
 * @param req.query.page - Page number (default: 1)
 * @param req.query.limit - Items per page (default: 10, max: 100)
 * @param req.query.subject - Filter by subject name (case-insensitive)
 * @param req.query.grade - Filter by specific grade level
 * @param req.query.instructor - Filter by instructor name (partial match)
 *
 * @example
 * // Get all Mathematics lessons for Grade 10
 * GET /api/v1/lessons?subject=Mathematics&grade=10
 */
export async function getAllLessons(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { page, limit } = parsePaginationParams(
            req.query.page as string,
            req.query.limit as string
        );

        // Extract filter parameters
        const subject = req.query.subject as string | undefined;
        const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
        const instructor = req.query.instructor as string | undefined;

        // Build MongoDB query filter
        const filter: Record<string, unknown> = {};

        if (subject) {
            // Case-insensitive regex match (e.g., "math" matches "Mathematics")
            filter.subject = new RegExp(`^${subject}`, 'i');
        }

        if (grade) {
            filter.grade = grade;
        }

        if (instructor) {
            // Partial match (e.g., "Sharma" matches "Dr. Sharma")
            filter.instructor = new RegExp(instructor, 'i');
        }

        // Execute queries in parallel for performance
        const [lessons, totalResults] = await Promise.all([
            LessonModel.find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 }), // Newest first
            LessonModel.countDocuments(filter)
        ]);

        sendSuccess(res, {
            lessons,
            pagination: getPaginationMeta(page, limit, totalResults)
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        sendError(res, 'Failed to fetch lessons', 500);
    }
}

/**
 * Get a single lesson by ID.
 * * Supports searching by either the MongoDB _id OR the custom lessonId field.
 * This allows flexible querying (e.g., /lessons/lesson-001 or /lessons/507f1f...).
 *
 * @route GET /api/v1/lessons/:id
 * @param req.params.id - MongoDB ObjectId OR custom lessonId
 */
export async function getLessonById(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        let lesson;

        // Check if the ID provided looks like a valid MongoDB ObjectId (24 hex chars)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        if (isValidObjectId) {
            lesson = await LessonModel.findById(id);
        } else {
            // If not an ObjectId, try finding by custom lessonId
            lesson = await LessonModel.findOne({ lessonId: id });
        }

        if (!lesson) {
            sendError(res, 'Lesson not found', 404);
            return;
        }

        sendSuccess(res, lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        sendError(res, 'Failed to fetch lesson', 500);
    }
}

/**
 * Create a new lesson.
 *
 * @route POST /api/v1/lessons
 * @param req.body - Lesson data
 */
export async function createLesson(
    req: Request,
    res: Response
): Promise<void> {
    try {
        // req.body should contain fields like lessonId, title, subject, etc.
        const input: Partial<ILesson> = req.body;

        const newLesson = new LessonModel(input);

        // Save to database (triggers Mongoose validation)
        await newLesson.save();

        sendSuccess(res, newLesson, 201, 'Lesson created successfully');
    } catch (error: unknown) {
        console.error('Error creating lesson:', error);

        // Handle Duplicate Key Error (e.g., trying to create "lesson-001" twice)
        if (error instanceof Error && (error as any).code === 11000) {
            sendError(res, 'Duplicate lessonId. This ID already exists.', 409);
            return;
        }

        // Handle Mongoose Validation Errors
        if (error instanceof Error && error.name === 'ValidationError') {
            const mongooseError = error as unknown as {
                errors: Record<string, { message: string }>;
            };
            const validationErrors = Object.keys(mongooseError.errors).map(
                (field) => ({
                    field,
                    message: mongooseError.errors[field].message
                })
            );
            sendError(res, 'Validation failed', 400, validationErrors);
            return;
        }

        sendError(res, 'Failed to create lesson', 500);
    }
}

/**
 * Update an existing lesson.
 *
 * @route PUT /api/v1/lessons/:id
 * @param req.params.id - MongoDB ObjectId OR custom lessonId
 * @param req.body - Fields to update
 */
export async function updateLesson(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const updates: Partial<ILesson> = req.body;

        // Determine query based on ID format (ObjectId vs lessonId)
        const query = /^[0-9a-fA-F]{24}$/.test(id)
            ? { _id: id }
            : { lessonId: id };

        const updatedLesson = await LessonModel.findOneAndUpdate(
            query,
            { $set: updates },
            { new: true, runValidators: true } // Return new doc, run schema validators
        );

        if (!updatedLesson) {
            sendError(res, 'Lesson not found', 404);
            return;
        }

        sendSuccess(res, updatedLesson, 200, 'Lesson updated successfully');
    } catch (error: unknown) {
        console.error('Error updating lesson:', error);

        // Reuse validation error logic
        if (error instanceof Error && error.name === 'ValidationError') {
            const mongooseError = error as unknown as {
                errors: Record<string, { message: string }>;
            };
            const validationErrors = Object.keys(mongooseError.errors).map(
                (field) => ({
                    field,
                    message: mongooseError.errors[field].message
                })
            );
            sendError(res, 'Validation failed', 400, validationErrors);
            return;
        }

        sendError(res, 'Failed to update lesson', 500);
    }
}

/**
 * Delete a lesson.
 *
 * @route DELETE /api/v1/lessons/:id
 * @param req.params.id - MongoDB ObjectId OR custom lessonId
 */
export async function deleteLesson(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;

        // Determine query based on ID format
        const query = /^[0-9a-fA-F]{24}$/.test(id)
            ? { _id: id }
            : { lessonId: id };

        const deletedLesson = await LessonModel.findOneAndDelete(query);

        if (!deletedLesson) {
            sendError(res, 'Lesson not found', 404);
            return;
        }

        sendSuccess(res, null, 200, 'Lesson deleted successfully');
    } catch (error) {
        console.error('Error deleting lesson:', error);
        sendError(res, 'Failed to delete lesson', 500);
    }
}