const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadToCloudinary, uploadFromBuffer, deleteFromCloudinary } = require('./cloudinaryUpload');
const { validateCreateCategory, validateUpdateCategory } = require('../validations/categoryValidation');

const getAllCategories = async (filters = {}) => {
  const { page = 1, limit = 100, search, status, parentId } = filters;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (status) {
    query.status = status;
  }

  if (parentId !== undefined) {
    if (parentId === null || parentId === 'null' || parentId === '') {
      query.parentId = null;
    } else {
      query.parentId = parentId;
    }
  }

  const skip = (page - 1) * limit;

  const categories = await Category.find(query)
    .populate('parentId', 'name slug')
    .populate('createdBy', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ priority: -1, createdAt: -1 });

  const total = await Category.countDocuments(query);

  return {
    categories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId)
    .populate('parentId', 'name slug')
    .populate('createdBy', 'name email');
  
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

const createCategory = async (categoryData, userId, imageFile) => {
  // Validate input
  const validatedData = validateCreateCategory(categoryData);

  // Handle parentId
  let parentId = null;
  if (validatedData.parentId) {
    const parent = await Category.findById(validatedData.parentId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    parentId = validatedData.parentId;
  }

  // Check for unique name under same parent
  const existingCategory = await Category.findOne({
    name: validatedData.name,
    parentId: parentId,
  });

  if (existingCategory) {
    throw new Error('Category with this name already exists under the same parent');
  }

  // Upload image to Cloudinary if provided
  let imageUrl = validatedData.imageUrl || null;
  if (imageFile) {
    try {
      imageUrl = await uploadFromBuffer(imageFile.buffer, imageFile.originalname, 'ecom');
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Create category
  const category = await Category.create({
    name: validatedData.name,
    description: validatedData.description || '',
    parentId: parentId,
    imageUrl: imageUrl,
    priority: validatedData.priority || 0,
    status: validatedData.status || 'active',
    createdBy: userId,
  });

  return await Category.findById(category._id)
    .populate('parentId', 'name slug')
    .populate('createdBy', 'name email');
};

const updateCategory = async (categoryId, categoryData, userId, imageFile) => {
  // Validate input
  const validatedData = validateUpdateCategory(categoryData);

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  // Handle parentId update
  let parentId = category.parentId;
  if (validatedData.parentId !== undefined) {
    if (validatedData.parentId === null || validatedData.parentId === '' || validatedData.parentId === 'null') {
      parentId = null;
    } else {
      const parent = await Category.findById(validatedData.parentId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
      // Prevent setting itself as parent
      if (validatedData.parentId === categoryId.toString()) {
        throw new Error('Category cannot be its own parent');
      }
      parentId = validatedData.parentId;
    }
  }

  // Check for unique name under same parent if name is being updated
  if (validatedData.name) {
    const existingCategory = await Category.findOne({
      name: validatedData.name,
      parentId: parentId,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists under the same parent');
    }
  }

  // Handle image upload
  let imageUrl = category.imageUrl;
  if (imageFile) {
    // Delete old image if exists
    if (category.imageUrl) {
      await deleteFromCloudinary(category.imageUrl);
    }
    // Upload new image
    try {
      imageUrl = await uploadFromBuffer(imageFile.buffer, imageFile.originalname, 'ecom');
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  } else if (validatedData.imageUrl !== undefined) {
    // If imageUrl is explicitly set to null/empty, delete old image
    if (!validatedData.imageUrl && category.imageUrl) {
      await deleteFromCloudinary(category.imageUrl);
      imageUrl = null;
    } else if (validatedData.imageUrl) {
      imageUrl = validatedData.imageUrl;
    }
  }

  // Update category
  const updateFields = {};
  if (validatedData.name) updateFields.name = validatedData.name;
  if (validatedData.description !== undefined) updateFields.description = validatedData.description;
  if (validatedData.priority !== undefined) updateFields.priority = validatedData.priority;
  if (validatedData.status) updateFields.status = validatedData.status;
  updateFields.parentId = parentId;
  updateFields.imageUrl = imageUrl;

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    updateFields,
    { new: true, runValidators: true }
  )
    .populate('parentId', 'name slug')
    .populate('createdBy', 'name email');

  return updatedCategory;
};

const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category: categoryId });
  if (productsCount > 0) {
    throw new Error(`Cannot delete category. ${productsCount} product(s) are linked to this category.`);
  }

  // Check if category has subcategories
  const subcategoriesCount = await Category.countDocuments({ parentId: categoryId });
  if (subcategoriesCount > 0) {
    throw new Error(`Cannot delete category. ${subcategoriesCount} subcategory(ies) exist under this category.`);
  }

  // Delete image from Cloudinary if exists
  if (category.imageUrl) {
    await deleteFromCloudinary(category.imageUrl);
  }

  // Delete category
  await Category.findByIdAndDelete(categoryId);

  return { message: 'Category deleted successfully' };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

