import AuthService from '../../src/services/Auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import School from '../../src/models/School.model';
import User from '../../src/models/User.model';
import AuditLog from '../../src/models/AuditLog.model';
import { RegisterBody, LoginBody } from '../../src/types/auth.types';

jest.mock('../../src/models/School.model');
jest.mock('../../src/models/User.model');
jest.mock('../../src/models/AuditLog.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('somesalt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const password = 'password123';
      const hashedPassword = await AuthService.hashPassword(password);
      
      expect(hashedPassword).toBe('hashedPassword');
    });
  });

  describe('validateSchoolCode', () => {
    it('should return true for a valid school code', async () => {
      (School.findOne as jest.Mock).mockResolvedValue({ _id: 'schoolId' });
      const result = await AuthService.validateSchoolCode('VALIDCODE');
      expect(result).toBe(true);
    });

    it('should return false for an invalid school code', async () => {
      (School.findOne as jest.Mock).mockResolvedValue(null);
      const result = await AuthService.validateSchoolCode('INVALIDCODE');
      expect(result).toBe(false);
    });
  });

  describe('register', () => {
    const registerData: RegisterBody = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      schoolCode: 'VALIDCODE',
    };

    it('should register a new user successfully', async () => {
      jest.spyOn(AuthService, 'validateSchoolCode').mockResolvedValue(true);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      jest.spyOn(AuthService, 'hashPassword').mockResolvedValue('hashedPassword');
      (School.findOne as jest.Mock).mockResolvedValue({ _id: 'schoolId' });
      const saveUserSpy = jest.spyOn(User.prototype, 'save').mockResolvedValue({} as any);
      const saveAuditLogSpy = jest.spyOn(AuditLog.prototype, 'save').mockResolvedValue({} as any);

      await AuthService.register(registerData);

      expect(saveUserSpy).toHaveBeenCalled();
      expect(saveAuditLogSpy).toHaveBeenCalled();
    });

    it('should throw an error for an invalid school code', async () => {
      jest.spyOn(AuthService, 'validateSchoolCode').mockResolvedValue(false);

      await expect(AuthService.register(registerData)).rejects.toThrow('Invalid school code');
    });

    it('should throw an error if the user already exists', async () => {
      jest.spyOn(AuthService, 'validateSchoolCode').mockResolvedValue(true);
      (User.findOne as jest.Mock).mockResolvedValue({ email: registerData.email });

      await expect(AuthService.register(registerData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    const loginData: LoginBody = {
      email: 'test@example.com',
      password: 'password123',
    };
    
    const mockUser: {
      _id: string;
      email: string;
      password: string;
      loginAttempts: number;
      lockUntil: Date | null;
      save: jest.Mock;
    } = {
      _id: 'userId',
      email: loginData.email,
      password: 'hashedPassword',
      loginAttempts: 0,
      lockUntil: null,
      save: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
        (User.findOne as jest.Mock).mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
        });
        mockUser.loginAttempts = 0;
        mockUser.lockUntil = null;
    });

    it('should return tokens for a valid login', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('sometoken');

      const tokens = await AuthService.login(loginData);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw an error for an unregistered user', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error for a wrong password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should increment login attempts on a failed login', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await AuthService.login(loginData).catch(() => {});
      expect(mockUser.loginAttempts).toBe(1);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should lock the user account after 5 failed attempts', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUser.loginAttempts = 4;
      
      await AuthService.login(loginData).catch(() => {});

      expect(mockUser.loginAttempts).toBe(5);
      expect(mockUser.lockUntil).not.toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw an error if the user is locked', async () => {
      mockUser.lockUntil = new Date(Date.now() + 30000);
      await expect(AuthService.login(loginData)).rejects.toThrow(/Account locked/);
    });

    it('should reset login attempts on a successful login', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUser.loginAttempts = 4;
      await AuthService.login(loginData);
      expect(mockUser.loginAttempts).toBe(0);
    });
  });
});

