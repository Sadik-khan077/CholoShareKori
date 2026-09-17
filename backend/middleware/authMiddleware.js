const jwt = require('jsonwebtoken');
const db = require('../db');

const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token string
      token = req.headers.authorization.split(' ')[1];

      // 1. Verify the token (This secret MUST perfectly match authRoutes.js)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_this_later');

      // 2. Fetch the user from the database using the ID inside the token
      const [users] = await db.query('SELECT id, name, email, location FROM users WHERE id = ?', [decoded.id]);
      
      // Attach the user to the request object so the next route can use it
      req.user = users[0];
      
      next();
    } catch (error) {
      console.error("Middleware Verification Error:", error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };