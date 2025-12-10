import { Product } from './product.types';
import { User, Address } from './auth.types';

export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
  tax?: number;
  shipping?: number;
  notes?: string;
}

export interface UpdateOrderRequest {
  orderStatus?: Order['orderStatus'];
  paymentStatus?: Order['paymentStatus'];
  shippingAddress?: Address;
  notes?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  orderStatus?: Order['orderStatus'];
  paymentStatus?: Order['paymentStatus'];
  startDate?: string;
  endDate?: string;
}

