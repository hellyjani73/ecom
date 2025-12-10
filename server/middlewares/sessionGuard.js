const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Session Guard Middleware
 * - Validates JWT token
 * - Rejects expired or invalid tokens
 * - Confirms user role from DB
 * - Adds user to req.user
 * - Forces cache-control headers to prevent back-button access
 */
const sessionGuard = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(401).json({ message: 'Token verification failed' });
    }

    // Get user from database to confirm role and active status
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    // Attach user to request
    req.user = user;

    // Set cache-control headers to prevent back-button access
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    next();
  } catch (error) {
    console.error('Session guard error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = sessionGuard;

