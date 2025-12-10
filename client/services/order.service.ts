import axiosInstance from '@/lib/axios';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderListResponse,
  OrderFilters,
} from '@/types/order.types';

export const orderService = {
  async getAllOrders(filters?: OrderFilters): Promise<OrderListResponse> {
    const response = await axiosInstance.get<{ data: OrderListResponse }>('/orders', {
      params: filters,
    });
    return response.data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await axiosInstance.get<{ data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    const response = await axiosInstance.get<{ data: Order }>(
      `/orders/order-number/${orderNumber}`
    );
    return response.data.data;
  },

  async getUserOrders(filters?: OrderFilters): Promise<OrderListResponse> {
    const response = await axiosInstance.get<{ data: OrderListResponse }>('/orders/my-orders', {
      params: filters,
    });
    return response.data.data;
  },

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await axiosInstance.post<{ data: Order }>('/orders', data);
    return response.data.data;
  },

  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    const response = await axiosInstance.put<{ data: Order }>(`/orders/${id}`, data);
    return response.data.data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const response = await axiosInstance.put<{ data: Order }>(`/orders/${id}/cancel`);
    return response.data.data;
  },

  async deleteOrder(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/orders/${id}`);
    return response.data;
  },
};

