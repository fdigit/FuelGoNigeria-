import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const updateLastActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        lastActive: new Date()
      });
    }
    next();
  } catch (error) {
    console.error('Error updating last active:', error);
    next();
  }
};

export default updateLastActive; 