import { QuizService } from '../../src/services/Quiz.service';
import { QuizModel } from '../../src/models/quiz/Quiz.model';
import mongoose from 'mongoose';

jest.mock('../../src/models/quiz/Quiz.model');

describe('QuizService Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('submitQuizAttempt', () => {
        const mockQuizId = new mongoose.Types.ObjectId().toString();
        const mockUserId = new mongoose.Types.ObjectId().toString();
        const mockQuestionId1 = new mongoose.Types.ObjectId();
        const mockOptionId1 = new mongoose.Types.ObjectId();
        const mockOptionId2 = new mongoose.Types.ObjectId();

        const mockQuiz = {
            _id: mockQuizId,
            questions: [
                {
                    _id: mockQuestionId1,
                    type: 'multiple_choice',
                    points: 10,
                    options: [
                        { _id: mockOptionId1, isCorrect: true },
                        { _id: mockOptionId2, isCorrect: false }
                    ]
                }
            ],
            totalPoints: 10,
            passingScore: 60,
            save: jest.fn().mockResolvedValue(true)
        };

        it('should calculate correct score for correct answers', async () => {
            (QuizModel.findById as jest.Mock).mockResolvedValue(mockQuiz);

            const submissionData = {
                answers: [
                    {
                        questionId: mockQuestionId1.toString(),
                        selectedOption: mockOptionId1.toString()
                    }
                ]
            };

            const result = await QuizService.submitQuizAttempt(mockQuizId, mockUserId, submissionData);

            expect(result.score).toBe(10);
            expect(result.totalPoints).toBe(10);
            expect(result.percentage).toBe(100);
            expect(result.passed).toBe(true);
            expect(result.results[0].isCorrect).toBe(true);
        });

        it('should calculate zero score for incorrect answers', async () => {
            (QuizModel.findById as jest.Mock).mockResolvedValue(mockQuiz);

            const submissionData = {
                answers: [
                    {
                        questionId: mockQuestionId1.toString(),
                        selectedOption: mockOptionId2.toString()
                    }
                ]
            };

            const result = await QuizService.submitQuizAttempt(mockQuizId, mockUserId, submissionData);

            expect(result.score).toBe(0);
            expect(result.percentage).toBe(0);
            expect(result.passed).toBe(false);
            expect(result.results[0].isCorrect).toBe(false);
        });

        it('should throw error if quiz is not found', async () => {
            (QuizModel.findById as jest.Mock).mockResolvedValue(null);

            const submissionData = { answers: [] };

            await expect(QuizService.submitQuizAttempt(mockQuizId, mockUserId, submissionData))
                .rejects.toThrow('Quiz not found');
        });
    });
});
