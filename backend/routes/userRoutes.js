const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

// GET a specific user's profile by ID
router.get('/:id', protect, async (req, res) => {
  const userId = req.params.id;

  try {
    // Select the user, but intentionally exclude their hashed password!
    const query = 'SELECT id, name, email, phone, location, registration_no, created_at FROM users WHERE id = ?';
    const [users] = await db.query(query, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

module.exports = router;