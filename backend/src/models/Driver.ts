import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  user_id: mongoose.Types.ObjectId;
  license_info: {
    license_number: string;
    expiry_date: Date;
    vehicle_category: string[];
    image_url: string;
  };
  vehicle_info: {
    type: string;
    make: string;
    model: string;
    year: number;
    plate_number: string;
    capacity: number;
  };
  current_location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    last_updated: Date;
  };
  availability_status: 'available' | 'busy' | 'offline';
  verification_status: 'pending' | 'verified' | 'rejected';
  total_deliveries: number;
  average_rating: number;
  active_order_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    license_info: {
      license_number: {
        type: String,
        required: [true, 'License number is required'],
      },
      expiry_date: {
        type: Date,
        required: [true, 'License expiry date is required'],
      },
      vehicle_category: [{
        type: String,
        required: [true, 'Vehicle category is required'],
      }],
      image_url: {
        type: String,
        required: [true, 'License image is required'],
      },
    },
    vehicle_info: {
      type: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: ['Truck', 'Van', 'Bike'],
      },
      make: {
        type: String,
        required: [true, 'Vehicle make is required'],
      },
      model: {
        type: String,
        required: [true, 'Vehicle model is required'],
      },
      year: {
        type: Number,
        required: [true, 'Vehicle year is required'],
      },
      plate_number: {
        type: String,
        required: [true, 'Vehicle plate number is required'],
        unique: true,
      },
      capacity: {
        type: Number,
        required: [true, 'Vehicle capacity is required'],
      },
    },
    current_location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere',
      },
      last_updated: {
        type: Date,
        default: Date.now,
      },
    },
    availability_status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline',
    },
    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    total_deliveries: {
      type: Number,
      default: 0,
    },
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    active_order_id: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
driverSchema.index({ 'current_location.coordinates': '2dsphere' });

const Driver = mongoose.model<IDriver>('Driver', driverSchema);

export default Driver; 