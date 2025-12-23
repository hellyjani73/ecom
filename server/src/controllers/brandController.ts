import { Request, Response } from 'express';
import { BrandService } from '../services/brandService';
import { commonResponse } from '../utils/commonResponse';
import { AuthenticatedRequest } from '../middleware/middleware';

export class BrandController {
  private brandService: BrandService;

  constructor() {
    this.brandService = new BrandService();
  }

  public async createBrandController(req: Request, res: Response) {
    try {
      const result = await this.brandService.createBrand(req as AuthenticatedRequest);
      return res.status(200).json(commonResponse(true, result.brand, result.message));
    } catch (error: any) {
      return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to create brand'));
    }
  }

  public async getAllBrandsController(req: Request, res: Response) {
    try {
      const result = await this.brandService.getAllBrands(req);
      return res.status(200).json(commonResponse(true, result.brands, result.message));
    } catch (error: any) {
      return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to fetch brands'));
    }
  }

  public async getBrandByIdController(req: Request, res: Response) {
    try {
      const result = await this.brandService.getBrandById(req);
      return res.status(200).json(commonResponse(true, result.brand, result.message));
    } catch (error: any) {
      return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to fetch brand'));
    }
  }

  public async updateBrandController(req: Request, res: Response) {
    try {
      const result = await this.brandService.updateBrand(req as AuthenticatedRequest);
      return res.status(200).json(commonResponse(true, result.brand, result.message));
    } catch (error: any) {
      return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to update brand'));
    }
  }

  public async deleteBrandController(req: Request, res: Response) {
    try {
      const result = await this.brandService.deleteBrand(req as AuthenticatedRequest);
      return res.status(200).json(commonResponse(true, null, result.message));
    } catch (error: any) {
      return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to delete brand'));
    }
  }
}


