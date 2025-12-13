import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { AuthenticatedRequest } from '../middleware/middleware';

const productService = new ProductService();

export class ProductController {
  public async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await productService.createProduct(req);
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create product',
      });
    }
  }
  
  public async getAllProducts(req: Request, res: Response) {
    try {
      const result = await productService.getAllProducts(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          products: result.products,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch products',
      });
    }
  }
  
  public async getProductById(req: Request, res: Response) {
    try {
      const result = await productService.getProductById(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.product,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Product not found',
      });
    }
  }
  
  public async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await productService.updateProduct(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update product',
      });
    }
  }
  
  public async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await productService.deleteProduct(req);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete product',
      });
    }
  }
  
  public async bulkAction(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await productService.bulkAction(req);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to perform bulk action',
      });
    }
  }
  
  public async uploadImage(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await productService.uploadImage(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          url: result.url,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  }
}

