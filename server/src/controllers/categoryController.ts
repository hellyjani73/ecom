import { Request, Response } from 'express';
import { commonResponse } from '../utils/commonResponse';
import { CategoryService } from '../services/categoryService';
import { AuthenticatedRequest } from '../middleware/middleware';

export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    public async createCategoryController(req: Request, res: Response) {
        try {
            const result = await this.categoryService.createCategory(req as AuthenticatedRequest);
            return res.status(200).json(commonResponse(true, result.category, result.message));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to create category'));
        }
    }

    public async getAllCategoriesController(req: Request, res: Response) {
        try {
            const result = await this.categoryService.getAllCategories(req);
            return res.status(200).json(commonResponse(true, result.categories, result.message));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to fetch categories'));
        }
    }

    public async getCategoryByIdController(req: Request, res: Response) {
        try {
            const result = await this.categoryService.getCategoryById(req);
            return res.status(200).json(commonResponse(true, result.category, result.message));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to fetch category'));
        }
    }

    public async updateCategoryController(req: Request, res: Response) {
        try {
            const result = await this.categoryService.updateCategory(req as AuthenticatedRequest);
            return res.status(200).json(commonResponse(true, result.category, result.message));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to update category'));
        }
    }

    public async deleteCategoryController(req: Request, res: Response) {
        try {
            const result = await this.categoryService.deleteCategory(req as AuthenticatedRequest);
            return res.status(200).json(commonResponse(true, null, result.message));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to delete category'));
        }
    }

    public async uploadImageController(req: Request, res: Response) {
        try {
            const result = await this.categoryService.uploadImage(req as AuthenticatedRequest);
            return res.status(200).json(commonResponse(true, { url: result.url }, result.message));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Failed to upload image'));
        }
    }
}

