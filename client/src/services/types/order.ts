import { CommonResponse } from './common';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on_hold';
export type PaymentStatus = 'paid' | 'unpaid' | 'partially_refunded' | 'refunded';
export type ShippingMethod = 'standard' | 'express' | 'next-day';

export interface OrderItem {
  productId: string;
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

export interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: 'card' | 'paypal' | 'cod';
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface ShippingInfo {
  method: ShippingMethod;
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
}

export interface OrderNote {
  _id?: string;
  type: 'customer' | 'admin' | 'system';
  content: string;
  author?: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface OrderTimelineEvent {
  _id?: string;
  type: 'placed' | 'payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'note' | 'status_change';
  title: string;
  description?: string;
  timestamp: string;
  performedBy?: string;
  metadata?: any;
}

export interface Order {
  _id: string;
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  payment: PaymentInfo;
  shipping: ShippingInfo;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  total: number;
  notes?: OrderNote[];
  timeline?: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  isHighPriority?: boolean;
  tags?: string[];
}

export interface OrderListFilters {
  status?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  dateRange?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth' | 'custom';
  startDate?: string;
  endDate?: string;
  search?: string;
  highPriority?: boolean;
  newOrders?: boolean;
  delayedShipments?: boolean;
  customerIssues?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'orderId' | 'date' | 'customer' | 'total';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderListResponse extends CommonResponse {
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statistics: {
      totalOrders: number;
      pendingOrders: number;
      completedOrders: number;
      totalRevenue: number;
      totalOrdersChange?: number;
      pendingOrdersChange?: number;
      completedOrdersChange?: number;
      totalRevenueChange?: number;
    };
  };
}

export interface OrderResponse extends CommonResponse {
  data: Order;
}

export interface BulkOrderAction {
  orderIds: string[];
  action: 'update_status' | 'export' | 'print_invoices' | 'send_notifications' | 'delete';
  data?: {
    status?: OrderStatus;
    [key: string]: any;
  };
}

