const Product = require('../models/Product');
const Category = require('../models/Category');

const getAllProducts = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    isActive,
    isFeatured,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sort);

  const total = await Product.countDocuments(query);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (productId) => {
  const product = await Product.findById(productId).populate('category', 'name slug');
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug }).populate('category', 'name slug');
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const createProduct = async (productData) => {
  const {
    name,
    description,
    price,
    compareAtPrice,
    sku,
    category,
    images,
    stock,
    weight,
    dimensions,
    tags,
    isActive,
    isFeatured,
  } = productData;

  // Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new Error('Category not found');
  }

  // Check if SKU already exists
  if (sku) {
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    compareAtPrice,
    sku,
    category,
    images: images || [],
    stock: stock || 0,
    weight,
    dimensions,
    tags: tags || [],
    isActive: isActive !== undefined ? isActive : true,
    isFeatured: isFeatured || false,
  });

  return await Product.findById(product._id).populate('category', 'name slug');
};

const updateProduct = async (productId, updateData) => {
  const {
    name,
    description,
    price,
    compareAtPrice,
    sku,
    category,
    images,
    stock,
    weight,
    dimensions,
    tags,
    isActive,
    isFeatured,
  } = updateData;

  // Verify category exists if being updated
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new Error('Category not found');
    }
  }

  // Check if SKU is being updated and if it's already taken
  if (sku) {
    const existingProduct = await Product.findOne({ sku, _id: { $ne: productId } });
    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;
  if (price !== undefined) updateFields.price = price;
  if (compareAtPrice !== undefined) updateFields.compareAtPrice = compareAtPrice;
  if (sku) updateFields.sku = sku;
  if (category) updateFields.category = category;
  if (images) updateFields.images = images;
  if (stock !== undefined) updateFields.stock = stock;
  if (weight !== undefined) updateFields.weight = weight;
  if (dimensions) updateFields.dimensions = dimensions;
  if (tags) updateFields.tags = tags;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;

  const product = await Product.findByIdAndUpdate(productId, updateFields, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  return { message: 'Product deleted successfully' };
};

const updateStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  product.stock += quantity;
  if (product.stock < 0) {
    throw new Error('Insufficient stock');
  }

  await product.save();
  return product;
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

