import AuthService from '../../src/services/Auth.service';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashedPassword = await AuthService.hashPassword(password);
      
      expect(hashedPassword).not.toEqual(password);
      
      const isMatch = await bcrypt.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });
  });

  describe('register', () => {
    it.todo('should register a new user');
  });
});
