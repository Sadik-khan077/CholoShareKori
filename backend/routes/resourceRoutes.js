const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

// UPDATE a specific resource
router.put('/:id', protect, (req, res) => {
  const resourceId = req.params.id;
  const userId = req.user.id; // From the auth middleware
  const { title, description, quantity, price, location, status } = req.body;

  // 1. Verify the resource exists and belongs to the user
  db.query('SELECT * FROM resources WHERE id = ?', [resourceId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Resource not found' });
    
    const resource = results[0];

    // Check ownership
    if (resource.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this resource' });
    }

    // 2. Update the resource
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

    db.query(updateQuery, values, (updateErr, updateResult) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ message: 'Resource updated successfully' });
    });
  });
});

module.exports = router;