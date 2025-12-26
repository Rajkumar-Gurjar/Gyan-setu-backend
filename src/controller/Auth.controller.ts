import { Request, Response } from 'express';
import AuthService from '../services/Auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { RegisterBody, LoginBody } from '../types/auth.types';

class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await AuthService.register(req.body as RegisterBody);
      // Exclude password from the returned user object
      const userResponse = newUser.toObject();
      delete userResponse.password;
      
      sendSuccess(res, userResponse, 201, 'User registered successfully');
    } catch (error: any) {
      if (error.message === 'Invalid school code') {
        sendError(res, error.message, 400);
      } else if (error.message === 'User with this email already exists') {
        sendError(res, error.message, 409);
      } else {
        sendError(res, 'Failed to register user', 500);
      }
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const tokens = await AuthService.login(req.body as LoginBody);
      sendSuccess(res, tokens, 200, 'User logged in successfully');
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        sendError(res, error.message, 401);
      } else if (error.message.includes('Account locked')) {
        sendError(res, error.message, 423);
      } else {
        sendError(res, 'Failed to login', 500);
      }
    }
  }

  public async refresh(req: Request, res: Response): Promise<void> {
    // Implementation to be added in a future task
    sendSuccess(res, { message: 'Token refreshed successfully' }, 200);
  }
}

export default new AuthController();
