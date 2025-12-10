const adminCategoryService = require('../services/adminCategoryService');
const { validateCreateCategory, validateUpdateCategory } = require('../validations/categoryValidation');

const getAllCategories = async (req, res) => {
  try {
    const result = await adminCategoryService.getAllCategories(req.query);

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
    const category = await adminCategoryService.getCategoryById(req.params.id);

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
    // Validate input
    const categoryData = validateCreateCategory({
      name: req.body.name,
      description: req.body.description,
      parentId: req.body.parentId || null,
      imageUrl: req.body.imageUrl || null,
      priority: req.body.priority ? parseInt(req.body.priority) : 0,
      status: req.body.status || 'active',
    });

    // Handle base64 image if provided
    let imageFile = req.file;
    if (!imageFile && req.body.imageBase64) {
      // Convert base64 to buffer for cloudinary upload
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageFile = {
        buffer: Buffer.from(base64Data, 'base64'),
        originalname: `category-${Date.now()}.webp`,
        mimetype: 'image/webp',
      };
    }

    const category = await adminCategoryService.createCategory(
      categoryData,
      req.user._id,
      imageFile
    );

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
    // Build update data object
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.parentId !== undefined) updateData.parentId = req.body.parentId;
    if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
    if (req.body.priority !== undefined) updateData.priority = parseInt(req.body.priority);
    if (req.body.status) updateData.status = req.body.status;
    
    // Validate input
    const categoryData = validateUpdateCategory(updateData);

    // Handle base64 image if provided
    let imageFile = req.file;
    if (!imageFile && req.body.imageBase64) {
      // Convert base64 to buffer for cloudinary upload
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageFile = {
        buffer: Buffer.from(base64Data, 'base64'),
        originalname: `category-${Date.now()}.webp`,
        mimetype: 'image/webp',
      };
    }

    const category = await adminCategoryService.updateCategory(
      req.params.id,
      categoryData,
      req.user._id,
      imageFile
    );

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
    const result = await adminCategoryService.deleteCategory(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

