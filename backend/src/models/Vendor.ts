import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  user_id: mongoose.Types.ObjectId;
  business_name: string;
  address: {
    street: string;
    city: string;
    state: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  fuel_types: string[];
  documents: {
    business_registration: string;
    tax_id: string;
    fuel_license: string;
  };
  operating_hours: {
    open: string;
    close: string;
    days: string[];
  };
  average_rating: number;
  total_ratings: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  bank_info: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    business_name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      coordinates: {
        type: [Number],
        required: [true, 'Location coordinates are required'],
        index: '2dsphere', // For geospatial queries
      },
    },
    fuel_types: [{
      type: String,
      enum: ['PMS', 'Diesel', 'Kerosene', 'Gas'],
      required: true,
    }],
    documents: {
      business_registration: String,
      tax_id: String,
      fuel_license: String,
    },
    operating_hours: {
      open: String,
      close: String,
      days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }],
    },
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    total_ratings: {
      type: Number,
      default: 0,
    },
    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    bank_info: {
      bank_name: {
        type: String,
        required: [true, 'Bank name is required'],
      },
      account_number: {
        type: String,
        required: [true, 'Account number is required'],
      },
      account_name: {
        type: String,
        required: [true, 'Account name is required'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
vendorSchema.index({ 'address.coordinates': '2dsphere' });

const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);

export default Vendor; 