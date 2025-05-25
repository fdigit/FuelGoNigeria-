import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  vendor_id: mongoose.Types.ObjectId;
  type: 'PMS' | 'Diesel' | 'Kerosene' | 'Gas';
  name: string;
  description: string;
  price_per_unit: number;
  unit: 'litre' | 'kg';
  available_qty: number;
  min_order_qty: number;
  max_order_qty: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  image_url?: string;
  specifications?: {
    octane_rating?: number;  // For PMS
    cetane_number?: number;  // For Diesel
    flash_point?: number;    // For Kerosene
    pressure?: number;       // For Gas
  };
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
      required: [true, 'Product type is required'],
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
    price_per_unit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: 0,
    },
    unit: {
      type: String,
      enum: ['litre', 'kg'],
      required: [true, 'Unit is required'],
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
    specifications: {
      octane_rating: Number,
      cetane_number: Number,
      flash_point: Number,
      pressure: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by vendor and type
productSchema.index({ vendor_id: 1, type: 1 });

// Pre-save middleware to set default unit based on product type
productSchema.pre('save', function(next) {
  if (this.isModified('type')) {
    this.unit = this.type === 'Gas' ? 'kg' : 'litre';
  }
  if (this.available_qty <= 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.available_qty > 0) {
    this.status = 'available';
  }
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product; 