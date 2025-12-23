import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  public async getMostSellingProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await analyticsService.getMostSellingProducts(limit);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.products,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch most selling products',
      });
    }
  }

  public async getRecentOrders(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const result = await analyticsService.getRecentOrders(limit);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.orders,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch recent orders',
      });
    }
  }

  public async getWeeklyTopCustomers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await analyticsService.getWeeklyTopCustomers(limit);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.customers,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch weekly top customers',
      });
    }
  }

  public async getDashboardStats(req: Request, res: Response) {
    try {
      const result = await analyticsService.getDashboardStats();
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard statistics',
      });
    }
  }
}

