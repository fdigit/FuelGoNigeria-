import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  order_id: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'paystack' | 'flutterwave' | 'cash';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transaction_ref: string;
  payment_gateway_response?: {
    gateway_ref: string;
    gateway_status: string;
    gateway_message: string;
    authorization_code?: string;
  };
  refund_info?: {
    refund_amount: number;
    refund_reason: string;
    refund_date: Date;
    refund_ref: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
    },
    method: {
      type: String,
      enum: ['paystack', 'flutterwave', 'cash'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    transaction_ref: {
      type: String,
      required: [true, 'Transaction reference is required'],
      unique: true,
    },
    payment_gateway_response: {
      gateway_ref: String,
      gateway_status: String,
      gateway_message: String,
      authorization_code: String,
    },
    refund_info: {
      refund_amount: Number,
      refund_reason: String,
      refund_date: Date,
      refund_ref: String,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for frequent queries
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ transaction_ref: 1 }, { unique: true });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ method: 1, status: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment; 