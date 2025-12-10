const User = require('../models/User');

const getAllUsers = async (filters = {}) => {
  const { page = 1, limit = 10, search, role, isActive } = filters;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email }).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const createUser = async (userData) => {
  const { name, email, password, role, phone, address } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    phone,
    address,
  });

  const userObject = user.toObject();
  delete userObject.password;

  return userObject;
};

const updateUser = async (userId, updateData) => {
  const { name, email, phone, address, role, isActive } = updateData;

  // Check if email is being updated and if it's already taken
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new Error('Email is already taken');
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return { message: 'User deleted successfully' };
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
};

