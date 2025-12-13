import { Request } from 'express';
import { Category, ICategory } from '../models/categoryModel';
import { uploadToCloudinary } from '../utils/cloudinaryUtil';
import { AuthenticatedRequest } from '../middleware/middleware';

export class CategoryService {
  // Create a new category
  public async createCategory(req: AuthenticatedRequest) {
    try {
      const { name, image, parentCategory, isActive } = req.body;

      // Validate required fields
      if (!name || !image) {
        throw new Error('Category name and image are required');
      }

      // Check if category with same name already exists
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }

      // Create category
      const category = new Category({
        name: name.trim(),
        image,
        parentCategory: parentCategory || null,
        isActive: isActive !== undefined ? isActive : true,
      });

      await category.save();

      return {
        category: category,
        message: 'Category created successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create category');
    }
  }

  // Get all categories
  public async getAllCategories(req: Request) {
    try {
      const categories = await Category.find().sort({ createdAt: -1 });
      return {
        categories: categories,
        message: 'Categories fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch categories');
    }
  }

  // Get category by ID
  public async getCategoryById(req: Request) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);

      if (!category) {
        throw new Error('Category not found');
      }

      return {
        category: category,
        message: 'Category fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch category');
    }
  }

  // Update category
  public async updateCategory(req: AuthenticatedRequest) {
    try {
      const { id } = req.params;
      const { name, image, parentCategory, isActive } = req.body;

      const category = await Category.findById(id);

      if (!category) {
        throw new Error('Category not found');
      }

      // Update fields
      if (name !== undefined) {
        // Check if another category with same name exists
        const existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: id },
        });

        if (existingCategory) {
          throw new Error('Category with this name already exists');
        }
        category.name = name.trim();
      }

      if (image !== undefined) {
        category.image = image;
      }

      if (parentCategory !== undefined) {
        category.parentCategory = parentCategory || null;
      }

      if (isActive !== undefined) {
        category.isActive = isActive;
      }

      await category.save();

      return {
        category: category,
        message: 'Category updated successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update category');
    }
  }

  // Delete category
  public async deleteCategory(req: AuthenticatedRequest) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        throw new Error('Category not found');
      }

      return {
        message: 'Category deleted successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete category');
    }
  }

  // Upload image to Cloudinary
  public async uploadImage(req: AuthenticatedRequest) {
    try {
      const { image } = req.body;

      if (!image) {
        throw new Error('Image is required');
      }

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(image);

      return {
        url: imageUrl,
        message: 'Image uploaded successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to upload image');
    }
  }
}

