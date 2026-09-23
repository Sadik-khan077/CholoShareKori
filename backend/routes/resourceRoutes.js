const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL RESOURCES (Used by Marketplaces & Dashboards)
router.get('/', async (req, res) => {
  try {
    // Perform a JOIN to get the user's name alongside the resource data
    const query = `
      SELECT r.*, u.name AS user_name 
      FROM resources r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC
    `;
    const [resources] = await db.query(query);
    res.json({ success: true, data: resources });
  } catch (error) {
    console.error("Fetch Resources Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. GET SINGLE RESOURCE BY ID (Used by the Edit Post page)
router.get('/:id', async (req, res) => {
  try {
    const resourceId = req.params.id;
    const [resource] = await db.query('SELECT * FROM resources WHERE id = ?', [resourceId]);
    
    if (resource.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: resource[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// CREATE A NEW RESOURCE
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id; 
    
    const { listing_type, type, title, category, quantity, price, location, description, urgency, status } = req.body;

    // Both listing_type and type are included in the INSERT statement
    const insertQuery = `
      INSERT INTO resources 
      (user_id, listing_type, type, title, category, quantity, price, location, description, urgency, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userId, 
      listing_type, 
      type, 
      title, 
      category, 
      quantity || 1, 
      price !== undefined ? price : null, 
      location, 
      description || null, 
      urgency || 'medium', 
      status || 'available'
    ];
    
    const [result] = await db.query(insertQuery, values);

    res.status(201).json({ success: true, message: 'Resource created successfully!', insertId: result.insertId });
  } catch (error) {
    console.error("Database Insert Error:", error.message);
    res.status(500).json({ success: false, message: 'Failed to create resource', error: error.message });
  }
});

// ==========================================
// UPDATE A SPECIFIC RESOURCE
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id; 
    const { title, location, quantity, description, price } = req.body;

    // First, verify the user actually owns the item they are trying to edit
    const [existing] = await db.query('SELECT user_id FROM resources WHERE id = ?', [resourceId]);
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    
    if (Number(existing[0].user_id) !== Number(userId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this post' });
    }

    // Update the database
    const updateQuery = `
      UPDATE resources 
      SET title = ?, location = ?, quantity = ?, description = ? , price = ?
      WHERE id = ?
    `;
    await db.query(updateQuery, [title, location, quantity, description, price, resourceId]);

    res.json({ success: true, message: 'Resource updated successfully' });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: 'Server error while updating' });
  }
});

module.exports = router;