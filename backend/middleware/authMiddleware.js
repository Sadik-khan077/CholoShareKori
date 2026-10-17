const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_this_later';

/**
 * Helper to retrieve an active student by user ID.
 */
async function fetchActiveUser(userId) {
  const [users] = await db.query(
    `SELECT id, name, email, phone, location, dept, batch, registration_no, bio, trust_score, karma_points, on_time_rate, role, status 
     FROM users 
     WHERE id = ?`,
    [userId]
  );
  return users && users.length > 0 ? users[0] : null;
}

/**
 * Strict authentication middleware.
 * Supports standard Bearer JWT tokens and demo student tokens ('demo-jwt-token-<id>').
 * Attaches verified user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please sign in to continue.'
    });
  }

  try {
    let userId = null;

    // 1. Support seamless Quick Demo Login tokens from the frontend
    if (token.startsWith('demo-jwt-token-')) {
      const demoId = parseInt(token.replace('demo-jwt-token-', ''), 10);
      if (demoId) {
        userId = demoId;
      }
    } else {
      // 2. Standard JWT verification
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        userId = decoded.id;
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token structure.'
      });
    }

    const user = await fetchActiveUser(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Campus student account no longer exists.'
      });
    }

    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your campus account has been suspended. Please contact JU student administration.'
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or forged authentication token.'
    });
  }
};

/**
 * Optional authentication middleware.
 * If token is present and valid, attaches req.user; otherwise proceeds without blocking.
 */
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    let userId = null;
    if (token.startsWith('demo-jwt-token-')) {
      userId = parseInt(token.replace('demo-jwt-token-', ''), 10);
    } else {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded ? decoded.id : null;
    }

    if (userId) {
      const user = await fetchActiveUser(userId);
      req.user = user && user.status === 'active' ? user : null;
    } else {
      req.user = null;
    }
  } catch (e) {
    req.user = null;
  }
  return next();
};

module.exports = { protect, optionalProtect };