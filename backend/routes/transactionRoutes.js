const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

// 1. CREATE TRANSACTION & DEDUCT INVENTORY
router.post('/', protect, async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { resource_id, provider_id, transaction_type, quantity, payment_method, duration_days } = req.body;
    const reqQty = quantity || 1;

    if (Number(requesterId) === Number(provider_id)) {
      return res.status(400).json({ success: false, message: "You cannot request your own item." });
    }

    // Verify stock availability
    const [[resource]] = await db.query('SELECT quantity FROM resources WHERE id = ?', [resource_id]);
    if (!resource || resource.quantity < reqQty) {
      return res.status(400).json({ success: false, message: 'Not enough quantity available.' });
    }

    const initialStatus = transaction_type === 'order' ? 'approved' : 'pending';

    // Deduct quantity immediately to reserve the item
    await db.query('UPDATE resources SET quantity = quantity - ? WHERE id = ?', [reqQty, resource_id]);

    const insertQuery = `
      INSERT INTO transactions (resource_id, requester_id, provider_id, transaction_type, quantity, payment_method, duration_days, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(insertQuery, [
      resource_id, requesterId, provider_id, transaction_type, 
      reqQty, payment_method || null, duration_days || null, initialStatus
    ]);

    res.status(201).json({ success: true, message: 'Request sent successfully!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'You already have an active request for this item.' });
    }
    console.error("Transaction Error:", error);
    res.status(500).json({ success: false, message: 'Server error while processing request.' });
  }
});

// 2. GET INCOMING REQUESTS
router.get('/incoming', protect, async (req, res) => {
  try {
    const providerId = req.user.id;
    const query = `
      SELECT t.*, r.title, r.listing_type, r.price, r.location, 
             u.name as requester_name, u.phone as requester_phone 
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users u ON t.requester_id = u.id
      WHERE t.provider_id = ?
      ORDER BY t.created_at DESC
    `;
    const [requests] = await db.query(query, [providerId]);
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch incoming requests.' });
  }
});

// 3. GET COMPLETED TRANSACTION HISTORY
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT t.*, r.title, r.listing_type, r.price, 
             p.name as provider_name, p.phone as provider_phone,
             req.name as requester_name, req.phone as requester_phone
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users p ON t.provider_id = p.id
      JOIN users req ON t.requester_id = req.id
      WHERE (t.provider_id = ? OR t.requester_id = ?) AND t.status = 'completed'
      ORDER BY t.created_at DESC
    `;
    const [history] = await db.query(query, [userId, userId]);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
});

// 4. UPDATE STATUS & RESTORE INVENTORY IF REJECTED/RETURNED
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const transactionId = req.params.id;
    const providerId = req.user.id;

    const [[tx]] = await db.query(`SELECT * FROM transactions WHERE id = ? AND provider_id = ?`, [transactionId, providerId]);
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found." });

    await db.query(`UPDATE transactions SET status = ? WHERE id = ?`, [status, transactionId]);

    // Restore inventory if an order is rejected, OR if a borrowed item is successfully returned (completed)
    if (status === 'rejected' || (status === 'completed' && tx.transaction_type === 'borrow_request')) {
      await db.query(`UPDATE resources SET quantity = quantity + ? WHERE id = ?`, [tx.quantity, tx.resource_id]);
    }

    res.json({ success: true, message: 'Status updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

module.exports = router;