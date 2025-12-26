import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const globalStore: RateLimitStore = {};
const userStore: RateLimitStore = {};

const GLOBAL_LIMIT = 100;
const USER_LIMIT = 30;
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Rate limiting middleware
 * RL-001: Global endpoints limited to 100 requests per minute per IP.
 * RL-002: Authenticated user-specific endpoints limited to 30 requests per minute per user.
 */
export const rateLimiter = (isUserSpecific: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Determine the key and limit
    let key = ip;
    let limit = GLOBAL_LIMIT;
    let store = globalStore;

    if (isUserSpecific && (req as any).user?.id) {
      key = (req as any).user.id;
      limit = USER_LIMIT;
      store = userStore;
    }

    // Initialize or reset if window has passed
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 0,
        resetTime: now + WINDOW_MS,
      };
    }

    // Increment count
    store[key].count++;

    // Check limit
    if (store[key].count > limit) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return sendError(res, 'Too many requests, please try again later.', 429);
    }

    next();
  };
};
