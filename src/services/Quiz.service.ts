import { QuizModel, IQuiz } from '../models/quiz/Quiz.model';
import { ProgressModel } from '../models/Progress.model';
import { Types } from 'mongoose';

// Placeholder for Quiz service functions
export const QuizService = {
    /**
     * Creates a new quiz.
     */
    async createQuiz(quizData: Partial<IQuiz>, userId: string): Promise<IQuiz> {
        const totalPoints = quizData.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
        
        const newQuiz = new QuizModel({
            ...quizData,
            totalPoints,
            createdBy: new Types.ObjectId(userId)
        });
        
        await newQuiz.save();
        return newQuiz;
    },

    /**
     * Fetches all quizzes with optional filtering.
     */
    async getAllQuizzes(filter: any = {}): Promise<IQuiz[]> {
        return QuizModel.find({ ...filter, isDeleted: false });
    },

    /**
     * Fetches a single quiz by ID.
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
     * Updates an existing quiz.
     */
    async updateQuiz(quizId: string | Types.ObjectId, updateData: Partial<IQuiz>): Promise<IQuiz | null> {
        if (updateData.questions) {
            updateData.totalPoints = updateData.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        }
        
        return QuizModel.findOneAndUpdate(
            { _id: quizId, isDeleted: false },
            { $set: updateData },
            { new: true, runValidators: true }
        );
    },

    /**
     * Deletes a quiz (soft delete).
     */
    async deleteQuiz(quizId: string | Types.ObjectId): Promise<IQuiz | null> {
        return QuizModel.findOneAndUpdate(
            { _id: quizId, isDeleted: false },
            { $set: { isDeleted: true, isActive: false } },
            { new: true }
        );
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

    /**
     * Aggregates quiz analytics for teachers.
     */
    async getQuizAnalytics(quizId: string) {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        const progressRecords = await ProgressModel.find({
            'quizAttempts.quizId': new Types.ObjectId(quizId)
        }).lean();

        const allAttempts = progressRecords.flatMap(record => 
            record.quizAttempts
                .filter(attempt => attempt.quizId.toString() === quizId)
                .map(attempt => ({ ...attempt, userId: record.userId }))
        );

        if (allAttempts.length === 0) {
            return {
                quizId,
                totalAttempts: 0,
                uniqueStudents: 0,
                averageScore: 0,
                passRate: 0,
                questionStats: quiz.questions.map(q => ({
                    questionId: q._id,
                    correctCount: 0,
                    attemptCount: 0,
                    correctPercentage: 0
                }))
            };
        }

        const totalAttempts = allAttempts.length;
        const uniqueStudents = new Set(allAttempts.map(a => a.userId.toString())).size;
        const sumScores = allAttempts.reduce((sum, a) => sum + a.percentage, 0);
        const passCount = allAttempts.filter(a => a.passed).length;

        const questionStats = quiz.questions.map(question => {
            const questionAttempts = allAttempts.flatMap(a => a.answers).filter(ans => ans.questionId.toString() === question._id.toString());
            const correctCount = questionAttempts.filter(ans => ans.isCorrect).length;
            const attemptCount = questionAttempts.length;

            return {
                questionId: question._id,
                correctCount,
                attemptCount,
                correctPercentage: attemptCount > 0 ? (correctCount / attemptCount) * 100 : 0
            };
        });

        return {
            quizId,
            totalAttempts,
            uniqueStudents,
            averageScore: sumScores / totalAttempts,
            passRate: (passCount / totalAttempts) * 100,
            questionStats
        };
    },
};
