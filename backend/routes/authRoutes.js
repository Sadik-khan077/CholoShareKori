const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

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