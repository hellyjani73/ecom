"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const categoryModel_1 = require("../models/categoryModel");
const cloudinaryUtil_1 = require("../utils/cloudinaryUtil");
class CategoryService {
    // Create a new category
    createCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, image, parentCategory, isActive } = req.body;
                // Validate required fields
                if (!name || !image) {
                    throw new Error('Category name and image are required');
                }
                // Check if category with same name already exists
                const existingCategory = yield categoryModel_1.Category.findOne({
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                });
                if (existingCategory) {
                    throw new Error('Category with this name already exists');
                }
                // Create category
                const category = new categoryModel_1.Category({
                    name: name.trim(),
                    image,
                    parentCategory: parentCategory || null,
                    isActive: isActive !== undefined ? isActive : true,
                });
                yield category.save();
                return {
                    category: category,
                    message: 'Category created successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to create category');
            }
        });
    }
    // Get all categories
    getAllCategories(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield categoryModel_1.Category.find().sort({ createdAt: -1 });
                return {
                    categories: categories,
                    message: 'Categories fetched successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch categories');
            }
        });
    }
    // Get category by ID
    getCategoryById(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const category = yield categoryModel_1.Category.findById(id);
                if (!category) {
                    throw new Error('Category not found');
                }
                return {
                    category: category,
                    message: 'Category fetched successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch category');
            }
        });
    }
    // Update category
    updateCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, image, parentCategory, isActive } = req.body;
                const category = yield categoryModel_1.Category.findById(id);
                if (!category) {
                    throw new Error('Category not found');
                }
                // Update fields
                if (name !== undefined) {
                    // Check if another category with same name exists
                    const existingCategory = yield categoryModel_1.Category.findOne({
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
                yield category.save();
                return {
                    category: category,
                    message: 'Category updated successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to update category');
            }
        });
    }
    // Delete category
    deleteCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const category = yield categoryModel_1.Category.findByIdAndDelete(id);
                if (!category) {
                    throw new Error('Category not found');
                }
                return {
                    message: 'Category deleted successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to delete category');
            }
        });
    }
    // Upload image to Cloudinary
    uploadImage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { image } = req.body;
                if (!image) {
                    throw new Error('Image is required');
                }
                // Upload to Cloudinary
                const imageUrl = yield (0, cloudinaryUtil_1.uploadToCloudinary)(image);
                return {
                    url: imageUrl,
                    message: 'Image uploaded successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to upload image');
            }
        });
    }
}
exports.CategoryService = CategoryService;
