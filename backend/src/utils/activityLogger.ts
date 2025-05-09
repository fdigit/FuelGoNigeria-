import { Request } from 'express';
import UserActivity, { ActivityType } from '../models/UserActivity';
import { UAParser } from 'ua-parser-js';
import { Types } from 'mongoose';

interface ActivityLogData {
  userId: string | Types.ObjectId;
  type: ActivityType;
  ipAddress: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  location?: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  details?: string;
  status: 'success' | 'failed';
}

export const logUserActivity = async (
  userId: string,
  type: ActivityType,
  req: Request,
  status: 'success' | 'failed',
  details?: string
) => {
  try {
    const parser = new UAParser(req.headers['user-agent']);
    const deviceInfo = {
      browser: parser.getBrowser().name || 'Unknown',
      os: parser.getOS().name || 'Unknown',
      device: parser.getDevice().type || 'Desktop',
    };

    await UserActivity.create({
      userId,
      type,
      ipAddress: req.ip,
      deviceInfo,
      status,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};

export const logActivity = async (data: ActivityLogData): Promise<void> => {
  try {
    await UserActivity.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export default logActivity; 