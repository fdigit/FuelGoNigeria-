import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  order_id: mongoose.Types.ObjectId;
  reviewer_id: mongoose.Types.ObjectId;
  vendor_id: mongoose.Types.ObjectId;
  driver_id?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  vendor_response?: string;
  type: 'vendor' | 'driver';
  status: 'active' | 'hidden' | 'reported';
  report_reason?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    reviewer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    driver_id: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    vendor_response: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['vendor', 'driver'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'reported'],
      default: 'active',
    },
    report_reason: String,
    images: [{
      type: String,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid image URL',
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for frequent queries
reviewSchema.index({ order_id: 1 });
reviewSchema.index({ vendor_id: 1, type: 1, status: 1 });
reviewSchema.index({ driver_id: 1, type: 1, status: 1 });
reviewSchema.index({ reviewer_id: 1, createdAt: -1 });

// Middleware to update vendor/driver rating after review
reviewSchema.post('save', async function(doc) {
  if (doc.type === 'vendor') {
    const Vendor = mongoose.model('Vendor');
    const reviews = await mongoose.model('Review').find({
      vendor_id: doc.vendor_id,
      type: 'vendor',
      status: 'active',
    });
    
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    await Vendor.findByIdAndUpdate(doc.vendor_id, {
      average_rating: avgRating,
      total_ratings: reviews.length,
    });
  } else if (doc.type === 'driver' && doc.driver_id) {
    const Driver = mongoose.model('Driver');
    const reviews = await mongoose.model('Review').find({
      driver_id: doc.driver_id,
      type: 'driver',
      status: 'active',
    });
    
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    await Driver.findByIdAndUpdate(doc.driver_id, {
      average_rating: avgRating,
    });
  }
});

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review; 