import { Request } from 'express';
import { Brand, IBrand } from '../models/brandModel';
import { AuthenticatedRequest } from '../middleware/middleware';

export class BrandService {
  // Create a new brand
  public async createBrand(req: AuthenticatedRequest) {
    try {
      const { name, isActive } = req.body;

      // Validate required fields
      if (!name) {
        throw new Error('Brand name is required');
      }

      // Check if brand with same name already exists
      const existingBrand = await Brand.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (existingBrand) {
        throw new Error('Brand with this name already exists');
      }

      // Create brand
      const brand = new Brand({
        name: name.trim(),
        isActive: isActive !== undefined ? isActive : true,
      });

      await brand.save();

      return {
        brand: brand,
        message: 'Brand created successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create brand');
    }
  }

  // Get all brands
  public async getAllBrands(req: Request) {
    try {
      const { isActive } = req.query;
      
      const query: any = {};
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const brands = await Brand.find(query).sort({ name: 1 });

      return {
        brands: brands,
        message: 'Brands fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch brands');
    }
  }

  // Get brand by ID
  public async getBrandById(req: Request) {
    try {
      const { id } = req.params;

      const brand = await Brand.findById(id);

      if (!brand) {
        throw new Error('Brand not found');
      }

      return {
        brand: brand,
        message: 'Brand fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch brand');
    }
  }

  // Update brand
  public async updateBrand(req: AuthenticatedRequest) {
    try {
      const { id } = req.params;
      const { name, isActive } = req.body;

      const brand = await Brand.findById(id);

      if (!brand) {
        throw new Error('Brand not found');
      }

      // Check if name is being changed and if new name already exists
      if (name && name.trim() !== brand.name) {
        const existingBrand = await Brand.findOne({
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: id },
        });

        if (existingBrand) {
          throw new Error('Brand with this name already exists');
        }

        brand.name = name.trim();
      }

      if (isActive !== undefined) {
        brand.isActive = isActive;
      }

      await brand.save();

      return {
        brand: brand,
        message: 'Brand updated successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update brand');
    }
  }

  // Delete brand
  public async deleteBrand(req: AuthenticatedRequest) {
    try {
      const { id } = req.params;

      const brand = await Brand.findById(id);

      if (!brand) {
        throw new Error('Brand not found');
      }

      await brand.deleteOne();

      return {
        message: 'Brand deleted successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete brand');
    }
  }
}

