const categoryService = require('../services/categoryService');

const getAllCategories = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories(req.query);

    res.status(200).json({
      message: 'Categories retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    res.status(200).json({
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    res.status(200).json({
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);

    res.status(200).json({
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};

