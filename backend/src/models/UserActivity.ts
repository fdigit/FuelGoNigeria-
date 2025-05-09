import mongoose, { Document, Schema } from 'mongoose';

export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'password_change' 
  | 'profile_update' 
  | 'status_change' 
  | 'role_change'
  | 'verification_update';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
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
  timestamp: Date;
}

const userActivitySchema = new Schema<IUserActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'login',
      'logout',
      'password_change',
      'profile_update',
      'status_change',
      'role_change',
      'verification_update'
    ],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  },
  location: {
    country: String,
    city: String,
    coordinates: [Number]
  },
  details: String,
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IUserActivity>('UserActivity', userActivitySchema); 