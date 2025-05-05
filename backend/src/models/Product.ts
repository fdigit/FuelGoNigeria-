import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  vendor_id: mongoose.Types.ObjectId;
  type: 'PMS' | 'Diesel' | 'Kerosene' | 'Gas';
  name: string;
  description: string;
  price_per_litre: number;
  available_qty: number;
  min_order_qty: number;
  max_order_qty: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  image_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    vendor_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    type: {
      type: String,
      enum: ['PMS', 'Diesel', 'Kerosene', 'Gas'],
      required: [true, 'Fuel type is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price_per_litre: {
      type: Number,
      required: [true, 'Price per litre is required'],
      min: 0,
    },
    available_qty: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: 0,
    },
    min_order_qty: {
      type: Number,
      required: [true, 'Minimum order quantity is required'],
      min: 1,
    },
    max_order_qty: {
      type: Number,
      required: [true, 'Maximum order quantity is required'],
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'discontinued'],
      default: 'available',
    },
    image_url: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by vendor and type
productSchema.index({ vendor_id: 1, type: 1 });

// Index for price-based queries
productSchema.index({ price_per_litre: 1 });

// Pre-save middleware to update status based on quantity
productSchema.pre('save', function(next) {
  if (this.available_qty <= 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.available_qty > 0) {
    this.status = 'available';
  }
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product; 