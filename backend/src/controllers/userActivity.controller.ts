import { Request, Response } from 'express';
import UserActivity from '../models/UserActivity';

export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const activities = await UserActivity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Error fetching user activity' });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const activities = await UserActivity.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'firstName lastName email');

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

export const getActivityByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const activities = await UserActivity.find({ type })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'firstName lastName email');

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity by type:', error);
    res.status(500).json({ message: 'Error fetching activity by type' });
  }
}; 