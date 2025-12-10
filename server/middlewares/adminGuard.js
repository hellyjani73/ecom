/**
 * Admin Guard Middleware
 * - Checks if user role is "admin"
 * - Returns 403 Forbidden if not admin
 * - Must be used AFTER sessionGuard
 */
const adminGuard = (req, res, next) => {
  // Check if user exists (should be set by sessionGuard)
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }

  // Set additional cache-control headers for admin routes
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  next();
};

module.exports = adminGuard;

