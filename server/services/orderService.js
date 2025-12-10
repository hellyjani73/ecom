const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getAllOrders = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    userId,
    orderStatus,
    paymentStatus,
    startDate,
    endDate,
  } = filters;

  const query = {};

  if (userId) {
    query.user = userId;
  }

  if (orderStatus) {
    query.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images price')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email phone address')
    .populate('items.product', 'name slug images price');
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

const getOrderByOrderNumber = async (orderNumber) => {
  const order = await Order.findOne({ orderNumber })
    .populate('user', 'name email phone address')
    .populate('items.product', 'name slug images price');
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

const getUserOrders = async (userId, filters = {}) => {
  const { page = 1, limit = 10, orderStatus } = filters;
  const query = { user: userId };

  if (orderStatus) {
    query.orderStatus = orderStatus;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('items.product', 'name slug images price')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const createOrder = async (orderData) => {
  const { userId, items, shippingAddress, paymentMethod, tax, shipping, notes } = orderData;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate and process items
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    if (!product.isActive) {
      throw new Error(`Product ${product.name} is not available`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    const itemPrice = product.price;
    const itemSubtotal = itemPrice * item.quantity;
    subtotal += itemSubtotal;

    processedItems.push({
      product: product._id,
      quantity: item.quantity,
      price: itemPrice,
      subtotal: itemSubtotal,
    });

    // Update product stock
    product.stock -= item.quantity;
    await product.save();
  }

  const total = subtotal + (tax || 0) + (shipping || 0);

  const order = await Order.create({
    user: userId,
    items: processedItems,
    subtotal,
    tax: tax || 0,
    shipping: shipping || 0,
    total,
    shippingAddress,
    paymentMethod,
    notes,
  });

  return await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images price');
};

const updateOrder = async (orderId, updateData) => {
  const { orderStatus, paymentStatus, shippingAddress, notes } = updateData;

  const updateFields = {};
  if (orderStatus) updateFields.orderStatus = orderStatus;
  if (paymentStatus) updateFields.paymentStatus = paymentStatus;
  if (shippingAddress) updateFields.shippingAddress = shippingAddress;
  if (notes !== undefined) updateFields.notes = notes;

  const order = await Order.findByIdAndUpdate(orderId, updateFields, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'name email')
    .populate('items.product', 'name slug images price');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId).populate('items.product');
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.orderStatus === 'cancelled') {
    throw new Error('Order is already cancelled');
  }

  if (order.orderStatus === 'delivered') {
    throw new Error('Cannot cancel a delivered order');
  }

  // Restore product stock
  for (const item of order.items) {
    const product = await Product.findById(item.product._id);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.orderStatus = 'cancelled';
  await order.save();

  return await Order.findById(orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images price');
};

const deleteOrder = async (orderId) => {
  const order = await Order.findByIdAndDelete(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  return { message: 'Order deleted successfully' };
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderByOrderNumber,
  getUserOrders,
  createOrder,
  updateOrder,
  cancelOrder,
  deleteOrder,
};

