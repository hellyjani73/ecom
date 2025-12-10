const productService = require('../services/productService');

const getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: 'Quantity is required' });
    }

    const product = await productService.updateStock(req.params.id, quantity);

    res.status(200).json({
      message: 'Stock updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};

