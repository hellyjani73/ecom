const User = require('../models/User');
const RefreshToken = require('../models/Auth');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const saveRefreshToken = async (token, userId) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    token,
    user: userId,
    expiresAt,
  });
};

const register = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  await saveRefreshToken(refreshToken, user._id);

  // Remove password from response
  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

const login = async (email, password) => {
  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  await saveRefreshToken(refreshToken, user._id);

  // Remove password from response
  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    );

    // Check if token exists in database
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.id,
    });

    if (!tokenDoc) {
      throw new Error('Invalid refresh token');
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return { accessToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

const logout = async (refreshToken) => {
  await RefreshToken.deleteOne({ token: refreshToken });
};

const logoutAll = async (userId) => {
  await RefreshToken.deleteMany({ user: userId });
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
};

