const orderService = require('../services/orderService');

const getAllOrders = async (req, res) => {
  try {
    const result = await orderService.getAllOrders(req.query);

    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    res.status(200).json({
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getOrderByOrderNumber = async (req, res) => {
  try {
    const order = await orderService.getOrderByOrderNumber(req.params.orderNumber);

    res.status(200).json({
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const result = await orderService.getUserOrders(req.user._id, req.query);

    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const orderData = {
      userId: req.user._id,
      ...req.body,
    };

    const order = await orderService.createOrder(orderData);

    res.status(201).json({
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);

    res.status(200).json({
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);

    res.status(200).json({
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const result = await orderService.deleteOrder(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
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

