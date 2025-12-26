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
 * This will be fully implemented in a later task (T010).
 */
export const createQuizSchema = z.object({
    // Placeholder: Body will be defined in T010
    body: z.object({
        title: multilingualSchema,
        subject: z.string(),
        class: z.number().min(1).max(12),
        // ... other fields will be added
    })
});

/**
 * Schema for updating an existing quiz.
 * This will be fully implemented in a later task (T010).
 */
export const updateQuizSchema = z.object({
    // Placeholder: Body will be defined in T010
    body: createQuizSchema.partial()
});

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
