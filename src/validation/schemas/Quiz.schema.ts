import { z } from 'zod';
import { mongoIdSchema } from './common.schema';

// Reusable schema for multilingual fields
const multilingualSchema = z.object({
    pa: z.string().optional(),
    hi: z.string().optional(),
    en: z.string({ required_error: "English text is required" }),
});

// Schema for quiz question options
const optionSchema = z.object({
    _id: mongoIdSchema.optional(),
    text: multilingualSchema,
    imageKey: z.string().optional(),
    isCorrect: z.boolean(),
});

// Schema for a single quiz question
const questionSchema = z.object({
    _id: mongoIdSchema.optional(),
    type: z.enum(['multiple_choice', 'true_false', 'fill_blank', 'image_choice']),
    question: multilingualSchema,
    imageKey: z.string().optional(),
    options: z.array(optionSchema).optional(),
    correctAnswer: multilingualSchema.optional(),
    explanation: multilingualSchema.optional(),
    points: z.number().default(1),
    order: z.number().optional(),
});

/**
 * Schema for creating a new quiz.
 */
export const createQuizSchema = z.object({
    title: multilingualSchema,
    description: multilingualSchema.optional(),
    lessonId: mongoIdSchema.optional(),
    subject: z.string(),
    class: z.number().min(1).max(12),
    type: z.enum(['practice', 'assessment', 'certification']).optional(),
    timeLimit: z.number().optional(),
    passingScore: z.number().min(0).max(100).optional(),
    attemptsAllowed: z.number().optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    showCorrectAnswers: z.boolean().optional(),
    showScoreImmediately: z.boolean().optional(),
    questions: z.array(questionSchema).min(1, "At least one question is required"),
    isPublished: z.boolean().optional(),
});

/**
 * Schema for updating an existing quiz.
 */
export const updateQuizSchema = createQuizSchema.partial();

/**
 * Schema for submitting a quiz attempt.
 */
export const submitQuizAttemptSchema = z.object({
    answers: z.array(z.object({
        questionId: mongoIdSchema,
        selectedOption: mongoIdSchema.optional(),
        answer: z.string().optional()
    })).min(1, "At least one answer is required")
});


// Placeholder Type Definitions
export type CreateQuizDTO = z.infer<typeof createQuizSchema>;
export type UpdateQuizDTO = z.infer<typeof updateQuizSchema>;
