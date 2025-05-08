import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user found in request' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Forbidden: Insufficient permissions',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };
}; 