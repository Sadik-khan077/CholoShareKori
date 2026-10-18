const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_this_later';

/**
 * Helper to generate signed JWT tokens.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// ==========================================
// 1. REGISTER NEW STUDENT USER
// ==========================================
router.post('/register', authController.register);

// ==========================================
// 2. USER LOGIN
// ==========================================
router.post('/login', authController.login);

// ==========================================
// 3. GET CURRENT USER PROFILE (ME)
// ==========================================
router.get('/me', protect, authController.getme);

// ==========================================
// 4. CHANGE PASSWORD
// ==========================================
router.post('/change-password', protect, authController.change_pass);

// ==========================================
// 5. GET AVAILABLE DEMO PROFILES
// ==========================================
router.get('/demo-students', authController.demo);

module.exports = router;