const Category = require('../models/Category');
const Product = require('../models/Product');

const getAllCategories = async (filters = {}) => {
  const { page = 1, limit = 10, search, isActive } = filters;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (page - 1) * limit;

  const categories = await Category.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ name: 1 });

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
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

const createCategory = async (categoryData) => {
  const { name, description, image, isActive } = categoryData;

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new Error('Category with this name already exists');
  }

  const category = await Category.create({
    name,
    description,
    image,
    isActive: isActive !== undefined ? isActive : true,
  });

  return category;
};

const updateCategory = async (categoryId, updateData) => {
  const { name, description, image, isActive } = updateData;

  // Check if name is being updated and if it's already taken
  if (name) {
    const existingCategory = await Category.findOne({ name, _id: { $ne: categoryId } });
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (image !== undefined) updateFields.image = image;
  if (isActive !== undefined) updateFields.isActive = isActive;

  const category = await Category.findByIdAndUpdate(categoryId, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

const deleteCategory = async (categoryId) => {
  // Check if category has products
  const productsCount = await Product.countDocuments({ category: categoryId });
  if (productsCount > 0) {
    throw new Error('Cannot delete category with associated products');
  }

  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  return { message: 'Category deleted successfully' };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};

