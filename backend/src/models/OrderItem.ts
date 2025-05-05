import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem extends Document {
  order_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  price_per_litre: number;
  total_price: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    price_per_litre: {
      type: Number,
      required: [true, 'Price per litre is required'],
      min: 0,
    },
    total_price: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for frequent queries
orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ product_id: 1 });

// Pre-save middleware to calculate total price
orderItemSchema.pre('save', function(next) {
  this.total_price = this.quantity * this.price_per_litre;
  next();
});

const OrderItem = mongoose.model<IOrderItem>('OrderItem', orderItemSchema);

export default OrderItem; 