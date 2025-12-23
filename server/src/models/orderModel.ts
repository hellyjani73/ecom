import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productSku: string;
  variantName?: string;
  variantSku?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  attributes?: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
}

export interface ICustomer {
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
}

export interface IAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IPaymentInfo {
  method: 'card' | 'paypal' | 'cod';
  status: 'paid' | 'unpaid' | 'partially_refunded' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface IShippingInfo {
  method: 'standard' | 'express' | 'next-day';
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
}

export interface IOrderNote {
  type: 'customer' | 'admin' | 'system';
  content: string;
  author?: string;
  createdAt: Date;
  isPinned?: boolean;
}

export interface IOrderTimelineEvent {
  type: 'placed' | 'payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'note' | 'status_change';
  title: string;
  description?: string;
  timestamp: Date;
  performedBy?: string;
  metadata?: any;
}

export interface IOrder extends Document {
  orderId: string;
  customer: ICustomer;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  payment: IPaymentInfo;
  shipping: IShippingInfo;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on_hold';
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  total: number;
  notes?: IOrderNote[];
  timeline?: IOrderTimelineEvent[];
  isHighPriority?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productSku: { type: String, required: true },
  variantName: { type: String },
  variantSku: { type: String },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0.01 },
  subtotal: { type: Number, required: true, min: 0 },
  attributes: { type: Map, of: String },
}, { _id: false });

const customerSchema = new Schema<ICustomer>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
}, { _id: false });

const addressSchema = new Schema<IAddress>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
}, { _id: false });

const paymentInfoSchema = new Schema<IPaymentInfo>({
  method: { type: String, enum: ['card', 'paypal', 'cod'], required: true },
  status: { type: String, enum: ['paid', 'unpaid', 'partially_refunded', 'refunded'], required: true, default: 'unpaid' },
  transactionId: { type: String },
  paidAt: { type: Date },
  refundedAt: { type: Date },
  refundAmount: { type: Number, min: 0 },
}, { _id: false });

const shippingInfoSchema = new Schema<IShippingInfo>({
  method: { type: String, enum: ['standard', 'express', 'next-day'], required: true },
  carrier: { type: String },
  trackingNumber: { type: String },
  shippedAt: { type: Date },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
}, { _id: false });

const orderNoteSchema = new Schema<IOrderNote>({
  type: { type: String, enum: ['customer', 'admin', 'system'], required: true },
  content: { type: String, required: true },
  author: { type: String },
  createdAt: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
}, { _id: false });

const orderTimelineEventSchema = new Schema<IOrderTimelineEvent>({
  type: { type: String, enum: ['placed', 'payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'note', 'status_change'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
  performedBy: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  customer: { type: customerSchema, required: true },
  items: [orderItemSchema],
  shippingAddress: { type: addressSchema, required: true },
  billingAddress: { type: addressSchema, required: true },
  payment: { type: paymentInfoSchema, required: true },
  shipping: { type: shippingInfoSchema, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold'], required: true, default: 'pending' },
  subtotal: { type: Number, required: true, min: 0 },
  shippingCost: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  discount: { type: Number, min: 0 },
  total: { type: Number, required: true, min: 0 },
  notes: [orderNoteSchema],
  timeline: [orderTimelineEventSchema],
  isHighPriority: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

// Indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

