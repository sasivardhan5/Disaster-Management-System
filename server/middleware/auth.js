const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'disasterguard_demo_jwt_secret_key_change_in_production_2026';

function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (authHeader) {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided. Please log in as an administrator.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrator credentials required for this action.'
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.'
    });
  }
}

// Optional auth helper to check if requester is logged in as admin without throwing 401
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (authHeader) {
    token = authHeader;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Ignored for optional auth
    }
  }
  next();
}

module.exports = {
  requireAdmin,
  optionalAuth
};
