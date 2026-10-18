const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// ==========================================
// 1. GET LIVE CAMPUS ECOSYSTEM STATS & IMPACT
// ==========================================
router.get('/', statsController.getStats);

// ==========================================
// 2. GET CAMPUS RESIDENTIAL HALLS & SPOTS
// ==========================================
router.get('/locations', statsController.getLocations);

// ==========================================
// 3. GET RESOURCE CATEGORIES
// ==========================================
router.get('/categories', statsController.getCategories);

// ==========================================
// 4. GET PULSE 
// ==========================================
router.get('/pulse', statsController.getPulse);

module.exports = router;