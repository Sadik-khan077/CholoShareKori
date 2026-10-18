const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.post('/', uploadMiddleware.single('photo'), uploadController.uploadPhoto);

module.exports = router;