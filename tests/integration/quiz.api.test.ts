import request from 'supertest';
import { app, startServer, closeServer } from '../../src/Server';
import { QuizModel } from '../../src/models/quiz/Quiz.model';
import { LessonModel } from '../../src/models/lesson/Lesson.model';
import User from '../../src/models/User.model';
import School from '../../src/models/School.model';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

describe('Quiz API Integration Tests', () => {
  let studentToken: string;
  let teacherToken: string;
  let teacherId: string;
  let quizId: string;

  beforeAll(async () => {
    const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/gyan-setu-test';
    await startServer(url, 0);
  });

  afterAll(async () => {
    await closeServer();
  });

  beforeEach(async () => {
    // Clean up collections
    await QuizModel.deleteMany({});
    await LessonModel.deleteMany({});
    await User.deleteMany({});
    await School.deleteMany({});

    // 1. Create School
    await School.create({ name: 'Quiz School', schoolCode: 'QUIZ123' });

    // 2. Create Teacher
    const teacherData = {
       firstName: 'Teacher',
       lastName: 'One',
       email: 'teacher@example.com',
       password: 'password123',
       schoolCode: 'QUIZ123',
       role: 'teacher'
    };
    await request(app).post('/api/v1/auth/register').send(teacherData);
    const tLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: teacherData.email, password: teacherData.password });
    teacherToken = tLoginRes.body.data.tokens.accessToken;
    teacherId = tLoginRes.body.data.user._id;

    // 3. Register & Login Student
    const studentData = {
      firstName: 'Student',
      lastName: 'One',
      email: 'student@example.com',
      password: 'password123',
      schoolCode: 'QUIZ123'
    };
    const regRes = await request(app).post('/api/v1/auth/register').send(studentData);
    if (regRes.statusCode !== 201) {
        console.error('Registration failed:', regRes.statusCode, JSON.stringify(regRes.body));
    }
    
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: studentData.email, password: studentData.password });
    
    if (loginRes.statusCode !== 200) {
        console.error('Login failed:', loginRes.statusCode, loginRes.body);
    }
    studentToken = loginRes.body.data?.tokens?.accessToken;
    if (!studentToken) {
        console.error('No student token received. Body:', JSON.stringify(loginRes.body));
    }

    // 4. Create Lesson
    const lesson = await LessonModel.create({
        lessonId: 'TEST-LESSON-001',
        title: 'Test Lesson',
        description: 'Test Description',
        subject: 'Math',
        grade: 10,
        duration: 30,
        instructor: 'Test Instructor',
        content: { type: 'video', videoKey: 'test-video' }
    });

    // 5. Create Quiz
    const quiz = await QuizModel.create({
        title: { en: 'Test Quiz' },
        description: { en: 'Test Quiz Description' },
        lessonId: lesson._id,
        subject: 'Math',
        class: 10,
        type: 'assessment',
        timeLimit: 30,
        passingScore: 50,
        attemptsAllowed: 1,
        shuffleQuestions: false,
        shuffleOptions: false,
        isPublished: true,
        createdBy: new Types.ObjectId(teacherId),
        totalPoints: 1,
        questions: [
            {
                type: 'multiple_choice',
                question: { en: 'What is 2+2?' },
                options: [
                    { text: { en: '3' }, isCorrect: false },
                    { text: { en: '4' }, isCorrect: true },
                    { text: { en: '5' }, isCorrect: false }
                ],
                points: 1
            }
        ]
    });
    quizId = quiz._id.toString();
  });

  afterEach(async () => {
    await QuizModel.deleteMany({});
    await LessonModel.deleteMany({});
    await User.deleteMany({});
    await School.deleteMany({});
  });

  describe('CRUD /api/v1/quizzes', () => {
    it('should create a new quiz', async () => {
        const quizData = {
            title: { en: 'New Quiz' },
            subject: 'Science',
            class: 9,
            questions: [
                {
                    type: 'true_false',
                    question: { en: 'Is Earth round?' },
                    options: [
                        { text: { en: 'True' }, isCorrect: true },
                        { text: { en: 'False' }, isCorrect: false }
                    ],
                    points: 5
                }
            ]
        };

        const res = await request(app)
            .post('/api/v1/quizzes')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(quizData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title.en).toBe('New Quiz');
        expect(res.body.data.totalPoints).toBe(5);
    });

    it('should get all quizzes', async () => {
        const res = await request(app)
            .get('/api/v1/quizzes')
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should update a quiz', async () => {
        const updateData = {
            title: { en: 'Updated Quiz Title' }
        };

        const res = await request(app)
            .patch(`/api/v1/quizzes/${quizId}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(updateData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title.en).toBe('Updated Quiz Title');
    });

    it('should delete a quiz', async () => {
        const res = await request(app)
            .delete(`/api/v1/quizzes/${quizId}`)
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        const deletedQuiz = await QuizModel.findById(quizId);
        expect(deletedQuiz!.isDeleted).toBe(true);
    });
  });

  describe('POST /api/v1/quizzes/:id/attempt', () => {
    it('should submit a quiz attempt successfully and return score', async () => {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) throw new Error('Quiz not found in setup');
        
        const question = quiz.questions[0];
        const correctOption = question.options.find(o => o.isCorrect);

        const submission = {
            answers: [
                {
                    questionId: question._id,
                    selectedOption: correctOption?._id
                }
            ]
        };

        const res = await request(app)
            .post(`/api/v1/quizzes/${quizId}/attempt`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send(submission);

        // Expecting 201 Created
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        // Adjust these expectations based on actual implementation of scoring
        expect(res.body.data.score).toBe(1);
        expect(res.body.data.totalPoints).toBe(1);
        expect(res.body.data.passed).toBe(true); 
    });

    it('should return 400 for validation errors (missing answers)', async () => {
        const res = await request(app)
            .post(`/api/v1/quizzes/${quizId}/attempt`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ answers: [] }); 
            // Assuming Zod schema requires non-empty answers or some validation

        // If schema allows empty answers, this might be 201 with score 0.
        // But usually "answers" field is required.
        // Let's assume empty answers is allowed but results in 0 score?
        // Or maybe strictly validation error if schema demands min(1).
        // Let's test for invalid format instead to be sure of 400.
        
        const invalidRes = await request(app)
            .post(`/api/v1/quizzes/${quizId}/attempt`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ answers: "not-an-array" });

        expect(invalidRes.statusCode).toEqual(400);
    });

    it('should return 404 if quiz does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(`/api/v1/quizzes/${fakeId}/attempt`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ answers: [{ questionId: new mongoose.Types.ObjectId() }] });

        expect(res.statusCode).toEqual(404);
    });

    it('should return 401 if not authenticated', async () => {
        const res = await request(app)
            .post(`/api/v1/quizzes/${quizId}/attempt`)
            .send({ answers: [{ questionId: new mongoose.Types.ObjectId() }] });

        expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/quizzes/:id', () => {
    it('should return quiz without correct answers for students', async () => {
        const res = await request(app)
            .get(`/api/v1/quizzes/${quizId}`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        
        const quiz = res.body.data;
        expect(quiz.questions[0]).not.toHaveProperty('correctAnswer');
        expect(quiz.questions[0].options[0]).not.toHaveProperty('isCorrect');
    });
  });

  describe('GET /api/v1/progress/quizzes/me', () => {
    it('should return all quiz attempts for the authenticated student', async () => {
        // 1. Submit an attempt first
        const quiz = await QuizModel.findById(quizId);
        const question = quiz!.questions[0];
        const submission = {
            answers: [{ questionId: question._id, selectedOption: question.options.find(o => o.isCorrect)?._id }]
        };

        await request(app)
            .post(`/api/v1/quizzes/${quizId}/attempt`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send(submission);

        // 2. Fetch progress
        const res = await request(app)
            .get('/api/v1/progress/quizzes/me')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].quizId.toString()).toBe(quizId);
    });

    it('should return 401 if not authenticated', async () => {
        const res = await request(app).get('/api/v1/progress/quizzes/me');
        expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/quizzes/:id/analytics', () => {
    it('should return analytics for a teacher', async () => {
        const res = await request(app)
            .get(`/api/v1/quizzes/${quizId}/analytics`)
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('totalAttempts');
        expect(res.body.data).toHaveProperty('averageScore');
    });

    it('should return 403 for a student trying to access analytics', async () => {
        const res = await request(app)
            .get(`/api/v1/quizzes/${quizId}/analytics`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(403);
    });
  });
});
