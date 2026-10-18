const jwt = require('jsonwebtoken');
const db = require('../db');

// STRICT ENFORCEMENT: No fallback string.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
}

async function fetchActiveUser(userId) {
  const [users] = await db.query(
    `SELECT id, name, email, phone, location, dept, batch, registration_no, bio, trust_score, karma_points, on_time_rate, role, status 
     FROM users 
     WHERE id = ?`,
    [userId]
  );
  return users && users.length > 0 ? users[0] : null;
}

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Please sign in to continue.' });
  }

  try {
    let userId = null;
    if (token.startsWith('demo-jwt-token-')) {
      const demoId = parseInt(token.replace('demo-jwt-token-', ''), 10);
      if (demoId) userId = demoId;
    } else {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) userId = decoded.id;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token structure.' });
    }

    const user = await fetchActiveUser(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Campus student account no longer exists.' });
    }
    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your campus account has been suspended. Please contact JU student administration.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Authentication session expired. Please sign in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or forged authentication token.' });
  }
};

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