import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { AuthenticatedRequest } from '../middleware/middleware';

const orderService = new OrderService();

export class OrderController {
  public async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await orderService.createOrder(req);
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create order',
      });
    }
  }

  public async getAllOrders(req: Request, res: Response) {
    try {
      const result = await orderService.getAllOrders(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          orders: result.orders,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          statistics: result.statistics,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch orders',
      });
    }
  }

  public async getOrderById(req: Request, res: Response) {
    try {
      const result = await orderService.getOrderById(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.order,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Order not found',
      });
    }
  }

  public async updateOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await orderService.updateOrder(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order',
      });
    }
  }
}

