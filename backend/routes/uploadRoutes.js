const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadController = require('../controllers/uploadController');
const uploaMiddleware = require('../middleware/uploadMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = `item-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, cleanName);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) && (mime.startsWith('image/') || allowedTypes.test(mime))) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WebP, GIF) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

/**
 * POST /api/upload
 * Handles single photo upload (field name: 'photo' or 'image').
 */
router.post('/', uploaMiddleware.single('photo'), uploadController.uploadPhoto);

module.exports = router;
