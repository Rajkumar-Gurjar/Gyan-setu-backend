import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import School from '../models/School.model';
import User, { IUser } from '../models/User.model';
import AuditLog from '../models/AuditLog.model';
import { RegisterBody, LoginBody } from '../types/auth.types';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_SECONDS = 30;

class AuthService {
  /**
   * Hashes a password using bcrypt.
   * @param password The password to hash.
   * @returns A promise that resolves to the hashed password.
   */
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Validates a school code.
   * @param schoolCode The school code to validate.
   * @returns A promise that resolves to true if the school code is valid, false otherwise.
   */
  public async validateSchoolCode(schoolCode: string): Promise<boolean> {
    const school = await School.findOne({ schoolCode });
    return !!school;
  }

  /**
   * Registers a new user.
   * @param data The registration data.
   * @returns The newly created user.
   */
  public async register(data: RegisterBody) {
    const { email, password, firstName, lastName, schoolCode } = data;

    const isSchoolCodeValid = await this.validateSchoolCode(schoolCode);
    if (!isSchoolCodeValid) {
      throw new Error('Invalid school code');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    
    const school = await School.findOne({ schoolCode });

    const newUser = new User({
      email,
      password: hashedPassword,
      profile: {
        firstName,
        lastName,
      },
      studentInfo: {
        schoolId: school?._id,
      }
    });

    await newUser.save();

    const auditLog = new AuditLog({
      userId: newUser._id,
      action: 'REGISTER',
    });
    await auditLog.save();

    return newUser;
  }

  /**
   * Generates JWT access and refresh tokens.
   * @param user The user to generate tokens for.
   * @returns Access and refresh tokens.
   */
  private generateTokens(user: IUser) {
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret', {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  /**
   * Logs in a user.
   * @param data The login data.
   * @returns Access and refresh tokens.
   */
  public async login(data: LoginBody) {
    const { email, password } = data;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new Error(`Account locked. Try again after ${Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000)} seconds.`);
    }

    const isMatch = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= LOCKOUT_THRESHOLD) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_SECONDS * 1000);
        const auditLog = new AuditLog({ userId: user._id, action: 'LOCKOUT' });
        await auditLog.save();
      }
      await user.save();
      
      const auditLog = new AuditLog({ userId: user._id, action: 'LOGIN_FAILURE' });
      await auditLog.save();

      throw new Error('Invalid credentials');
    }

    user.loginAttempts = 0;
    user.lastLogin = new Date();
    
    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken; // For single-session enforcement
    await user.save();

    const auditLog = new AuditLog({ userId: user._id, action: 'LOGIN_SUCCESS' });
    await auditLog.save();

    return tokens;
  }
}

export default new AuthService();
