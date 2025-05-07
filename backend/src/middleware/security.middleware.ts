import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import mongoose from 'mongoose';

// IP Whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress;
    
    if (!clientIP || !allowedIPs.includes(clientIP)) {
      return res.status(403).json({ 
        message: 'Access denied: IP not whitelisted',
        error: 'IP_NOT_WHITELISTED'
      });
    }
    
    next();
  };
};

// Rate limiter for admin registration
export const adminRegistrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    message: 'Too many admin registration attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});

// MongoDB-based rate limiter for admin actions
export const adminActionLimiter = new RateLimiterMongo({
  storeClient: mongoose.connection,
  keyPrefix: 'admin_action',
  points: 10, // Number of actions
  duration: 60, // Per minute
});

export const adminActionRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.user?._id.toString() || req.ip;
    await adminActionLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      message: 'Too many admin actions, please try again later',
      error: 'RATE_LIMIT_EXCEEDED'
    });
  }
}; 