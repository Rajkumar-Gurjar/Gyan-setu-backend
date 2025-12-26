import { QuizModel, IQuiz } from '../models/quiz/Quiz.model';
import { ProgressModel } from '../models/Progress.model';
import { Types } from 'mongoose';

// Placeholder for Quiz service functions
export const QuizService = {
    /**
     * Placeholder for creating a new quiz.
     */
    async createQuiz(quizData: Partial<IQuiz>): Promise<IQuiz> {
        console.log('createQuiz placeholder called with:', quizData);
        // Implementation for T011 will go here
        const newQuiz = new QuizModel(quizData);
        await newQuiz.save();
        return newQuiz;
    },

    /**
     * Placeholder for fetching all quizzes.
     */
    async getAllQuizzes(): Promise<IQuiz[]> {
        console.log('getAllQuizzes placeholder called');
        // Implementation will be added later
        return [];
    },

    /**
     * Placeholder for fetching a single quiz by ID.
     */
    async getQuizById(quizId: string | Types.ObjectId, userRole: string = 'teacher'): Promise<IQuiz | null> {
        const quiz = await QuizModel.findById(quizId);
        
        if (!quiz || quiz.isDeleted) {
            return null;
        }

        // If student, filter out correct answers and internal fields
        if (userRole === 'student') {
            const quizObj = quiz.toObject();
            quizObj.questions = quizObj.questions.map((q: any) => {
                const { correctAnswer, explanation, ...rest } = q;
                if (q.options) {
                    rest.options = q.options.map((o: any) => {
                        const { isCorrect, ...optRest } = o;
                        return optRest;
                    });
                }
                return rest;
            });
            return quizObj as any;
        }

        return quiz;
    },

    /**
     * Placeholder for updating an existing quiz.
     */
    async updateQuiz(quizId: string | Types.ObjectId, updateData: Partial<IQuiz>): Promise<IQuiz | null> {
        console.log('updateQuiz placeholder called with:', quizId, updateData);
        // Implementation for T015 will go here
        return null;
    },

    /**
     * Placeholder for deleting a quiz.
     */
    async deleteQuiz(quizId: string | Types.ObjectId): Promise<IQuiz | null> {
        console.log('deleteQuiz placeholder called with:', quizId);
        // Implementation for T017 will go here
        return null;
    },

    /**
     * Processes a quiz submission, calculates score, and records the attempt.
     */
    async submitQuizAttempt(quizId: string, userId: string, submissionData: { 
        answers: Array<{ questionId: string, selectedOption?: string, answer?: string }>,
        startedAt?: string
    }) {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        let score = 0;
        const results = quiz.questions.map(question => {
            const userAnswer = submissionData.answers.find(a => a.questionId === question._id.toString());
            let isCorrect = false;
            let pointsEarned = 0;

            if (userAnswer) {
                if (question.type === 'multiple_choice' || question.type === 'true_false' || question.type === 'image_choice') {
                    const selectedOption = question.options.find(o => o._id.toString() === userAnswer.selectedOption);
                    if (selectedOption && selectedOption.isCorrect) {
                        isCorrect = true;
                        pointsEarned = question.points;
                    }
                } else if (question.type === 'fill_blank') {
                    // Simple case-insensitive match for fill-in-the-blank
                    if (userAnswer.answer?.trim().toLowerCase() === question.correctAnswer?.en.trim().toLowerCase()) {
                        isCorrect = true;
                        pointsEarned = question.points;
                    }
                }
            }

            if (isCorrect) {
                score += pointsEarned;
            }

            return {
                questionId: question._id,
                selectedOption: userAnswer?.selectedOption ? new Types.ObjectId(userAnswer.selectedOption) : undefined,
                answer: userAnswer?.answer,
                isCorrect,
                points: pointsEarned,
                explanation: question.explanation
            };
        });

        const totalPoints = quiz.totalPoints || quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        const passed = percentage >= quiz.passingScore;

        const submittedAt = new Date();
        const startedAt = submissionData.startedAt ? new Date(submissionData.startedAt) : undefined;
        const duration = startedAt ? Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000) : undefined;

        // Recording to Progress model
        if (quiz.lessonId) {
            let progress = await ProgressModel.findOne({ userId, lessonId: quiz.lessonId });
            
            if (!progress) {
                progress = new ProgressModel({
                    userId,
                    lessonId: quiz.lessonId,
                    quizAttempts: []
                });
            }

            const attemptNumber = progress.quizAttempts.filter(a => a.quizId.toString() === quizId).length + 1;

            const attempt = {
                quizId: new Types.ObjectId(quizId),
                attemptNumber,
                score,
                totalPoints,
                percentage,
                passed,
                answers: results.map(r => ({
                    questionId: r.questionId,
                    selectedOption: r.selectedOption,
                    answer: r.answer,
                    isCorrect: r.isCorrect,
                    points: r.points
                })),
                startedAt,
                submittedAt,
                duration
            };

            progress.quizAttempts.push(attempt);
            
            if (percentage > progress.bestQuizScore) {
                progress.bestQuizScore = percentage;
            }

            await progress.save();
        }

        return {
            quizId,
            userId,
            score,
            totalPoints,
            percentage,
            passed,
            results,
            submittedAt
        };
    },

    /**
     * Retrieves all quiz attempts for a specific user.
     */
    async getUserQuizAttempts(userId: string) {
        const progressRecords = await ProgressModel.find({ userId })
            .populate('lessonId', 'title subject class')
            .lean();
        
        const allAttempts = progressRecords.reduce((acc: any[], record) => {
            const attemptsWithLesson = record.quizAttempts.map(attempt => ({
                ...attempt,
                lesson: record.lessonId,
                status: record.status
            }));
            return [...acc, ...attemptsWithLesson];
        }, []);

        // Sort by submittedAt descending
        return allAttempts.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    },
};
