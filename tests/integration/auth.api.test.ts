import request from 'supertest';
import { app, startServer, closeServer } from '../../src/Server';
import School from '../../src/models/School.model';
import User from '../../src/models/User.model';

describe('Auth API', () => {
  beforeAll(async () => {
    const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/gyan-setu-test';
    await startServer(url, 0); // Use a random available port
  });

  afterAll(async () => {
    await closeServer();
  });

  beforeEach(async () => {
    // Create a school for testing
    await School.create({ name: 'Test School', schoolCode: 'TEST123' });
  });

  afterEach(async () => {
    // Clean up collections
    await User.deleteMany({});
    await School.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      schoolCode: 'TEST123',
    };

    it('should register a new user and return 201', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(registrationData.email);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for an invalid school code', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...registrationData, schoolCode: 'INVALID' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid school code');
    });

    it('should return 409 if the user already exists', async () => {
      // First, register the user
      await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData);

      // Then, try to register again with the same email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User with this email already exists');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...registrationData, email: 'not-an-email' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors[0].field).toBe('email');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const registrationData = {
      firstName: 'Test',
      lastName: 'LoginUser',
      email: 'testlogin@example.com',
      password: 'password123',
      schoolCode: 'TEST123',
    };

    beforeEach(async () => {
      // Register a user before each test in this block
      await request(app).post('/api/v1/auth/register').send(registrationData);
    });

    it('should login a registered user and return 200', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: registrationData.email, password: registrationData.password });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for an unregistered user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'unregistered@example.com', password: 'password' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for a wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: registrationData.email, password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should lock the user account after 5 failed login attempts', async () => {
      const loginAttempt = (password: string) =>
        request(app).post('/api/v1/auth/login').send({ email: registrationData.email, password });

      for (let i = 0; i < 5; i++) {
        await loginAttempt('wrongpassword');
      }

      const res = await loginAttempt('wrongpassword');
      expect(res.statusCode).toEqual(423); // 423 Locked
      expect(res.body.message).toContain('Account locked');
    }, 10000); // Increase timeout for this test

    it('should return 423 if the user is locked', async () => {
      const user = await User.findOne({ email: registrationData.email });
      if (user) {
        user.lockUntil = new Date(Date.now() + 30000); // Lock for 30 seconds
        await user.save();
      }

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: registrationData.email, password: registrationData.password });

      expect(res.statusCode).toEqual(423);
    });
  });
});

