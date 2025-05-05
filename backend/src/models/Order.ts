import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  customer_id: mongoose.Types.ObjectId;
  vendor_id: mongoose.Types.ObjectId;
  driver_id?: mongoose.Types.ObjectId;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    coordinates: [number, number]; // [longitude, latitude]
    additional_info?: string;
  };
  status: 'pending' | 'accepted' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id?: mongoose.Types.ObjectId;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  estimated_delivery_time?: Date;
  actual_delivery_time?: Date;
  cancellation_reason?: string;
  is_emergency_request: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customer_id: {
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
    delivery_address: {
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
        index: '2dsphere',
      },
      additional_info: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    payment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    delivery_fee: {
      type: Number,
      required: true,
      min: 0,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    estimated_delivery_time: Date,
    actual_delivery_time: Date,
    cancellation_reason: String,
    is_emergency_request: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for frequent queries
orderSchema.index({ customer_id: 1, createdAt: -1 });
orderSchema.index({ vendor_id: 1, status: 1 });
orderSchema.index({ driver_id: 1, status: 1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ 'delivery_address.coordinates': '2dsphere' });

// Virtual populate for order items
orderSchema.virtual('order_items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order_id',
});

// Enable virtuals in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order; 