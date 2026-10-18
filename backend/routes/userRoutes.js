const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// ==========================================
// 1. UPDATE CURRENT USER'S PROFILE (PUT)
// ==========================================
router.put('/profile', protect, userController.updateProfile);

// ==========================================
// 2. GET USER'S PUBLIC LISTINGS
// ==========================================
router.get('/:id/resources', userController.getListings);

// ==========================================
// 3. GET A SPECIFIC USER'S PROFILE (Peer / Self View)
// ==========================================
router.get('/:id', optionalProtect, userController.getProfile);

module.exports = router;