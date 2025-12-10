const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query);

    res.status(200).json({
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const result = await userService.updatePassword(req.params.id, currentPassword, newPassword);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);

    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateUser(req.user._id, req.body);

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  getProfile,
  updateProfile,
};

