import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminInvitation {
  token: string;
  email: string;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  usedBy?: mongoose.Types.ObjectId;
}

export interface IAdminInvitationDocument extends IAdminInvitation, Document {}

const adminInvitationSchema = new Schema<IAdminInvitationDocument>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Only keep the TTL index
adminInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AdminInvitation = mongoose.model<IAdminInvitationDocument>('AdminInvitation', adminInvitationSchema);
export default AdminInvitation; 