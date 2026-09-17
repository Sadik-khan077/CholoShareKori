const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// GET ALL RESOURCES (For the 5 Pillars)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // We use a JOIN here to attach the user's name to the resource data!
    const query = `
      SELECT resources.*, users.name AS user_name 
      FROM resources 
      JOIN users ON resources.user_id = users.id
      ORDER BY resources.created_at DESC
    `;
    const [resources] = await db.query(query);
    
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
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
  const resourceId = req.params.id;
  const userId = req.user.id; 
  const { title, description, quantity, price, location, status } = req.body;

  try {
    // 1. Verify the resource exists
    const [results] = await db.query('SELECT * FROM resources WHERE id = ?', [resourceId]);
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    
    const resource = results[0];

    // 2. Check ownership (Security check!)
    if (resource.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this resource' });
    }

    // 3. Update the resource
    const updateQuery = `
      UPDATE resources 
      SET title = ?, description = ?, quantity = ?, price = ?, location = ?, status = ?
      WHERE id = ?
    `;
    
    const values = [
      title || resource.title,
      description || resource.description,
      quantity || resource.quantity,
      price || resource.price,
      location || resource.location,
      status || resource.status,
      resourceId
    ];

    await db.query(updateQuery, values);
    res.status(200).json({ success: true, message: 'Resource updated successfully' });

  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ success: false, message: 'Failed to update resource' });
  }
});

module.exports = router;