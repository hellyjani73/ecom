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

  public async getFeaturedProducts(req: Request, res: Response) {
    try {
      const result = await productService.getFeaturedProducts(req);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          products: result.products,
          total: result.products.length,
          page: 1,
          limit: result.products.length,
          totalPages: 1,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch featured products',
      });
    }
  }

  public async getPublicProducts(req: Request, res: Response) {
    try {
      // Only return active products for public endpoint
      // Modify query to ensure only active products are returned
      const originalStatus = req.query.status;
      req.query.status = 'active';
      
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
      } finally {
        // Restore original status if it existed
        if (originalStatus !== undefined) {
          req.query.status = originalStatus;
        } else {
          delete req.query.status;
        }
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch products',
      });
    }
  }

  public async getPublicProductById(req: Request, res: Response) {
    try {
      const result = await productService.getProductById(req);
      // Only return if product is active
      if (result.product && !result.product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
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
}

