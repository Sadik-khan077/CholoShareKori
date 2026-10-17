const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const DAILY_LATE_FEE_BDT = 20;

/**
 * Universal helper to calculate loan timeline math, due dates, late fees, and display fields.
 */
function enrichTransactionTimeline(tx) {
  const createdAtMs = new Date(tx.created_at).getTime();
  const durationDays = Number(tx.duration_days) || 0;

  let dueDate = null;
  let daysLate = 0;
  let lateFee = 0;

  if (durationDays > 0) {
    const dueTimeMs = createdAtMs + (durationDays * 24 * 60 * 60 * 1000);
    dueDate = new Date(dueTimeMs).toISOString();

    if ((tx.status === 'approved' || tx.status === 'active') && tx.transaction_type === 'borrow_request') {
      const nowMs = Date.now();
      if (nowMs > dueTimeMs) {
        daysLate = Math.floor((nowMs - dueTimeMs) / (24 * 60 * 60 * 1000));
        lateFee = daysLate * DAILY_LATE_FEE_BDT;
      }
    }
  }

  const quantity = Number(tx.quantity) || 1;
  const unitPrice = Number(tx.price) || 0;
  const totalPrice = tx.total_price !== undefined && tx.total_price !== null 
    ? Number(tx.total_price) 
    : unitPrice * quantity;

  return {
    ...tx,
    id: Number(tx.id),
    resource_id: Number(tx.resource_id),
    provider_id: Number(tx.provider_id),
    requester_id: Number(tx.requester_id),
    title: tx.title || tx.resource_title || 'Campus Item',
    resource_title: tx.resource_title || tx.title || 'Campus Item',
    listing_type: tx.listing_type || (tx.transaction_type === 'order' ? 'sell' : tx.transaction_type === 'claim' ? 'free' : 'lend'),
    price: unitPrice,
    total_price: totalPrice,
    quantity: quantity,
    duration_days: durationDays,
    due_date: dueDate,
    days_late: daysLate,
    late_fee: lateFee,
    pickup_spot: tx.pickup_spot || tx.location || 'TSC or Hall',
    location: tx.location || tx.pickup_spot || 'TSC or Hall',
    rating_given: tx.rating_given !== null && tx.rating_given !== undefined ? Number(tx.rating_given) : null
  };
}

// ==========================================
// 1. CREATE TRANSACTION (Borrow, Claim, or Order)
// ==========================================
router.post('/', optionalProtect, async (req, res) => {
  try {
    const { 
      resource_id, 
      resource_title,
      provider_id, 
      provider_name,
      requester_id,
      requester_name,
      requester_phone,
      transaction_type = 'borrow_request', 
      quantity = 1, 
      payment_method = 'cash_on_pickup', 
      duration_days,
      pickup_spot,
      total_price
    } = req.body;

    const authUserId = req.user ? req.user.id : null;
    const reqUserId = authUserId || parseInt(requester_id, 10) || 98;
    const resId = parseInt(resource_id, 10);
    let provId = parseInt(provider_id, 10);
    const reqQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Auto-resolve provider_id from resource if omitted
    if (!provId && resId) {
      const [resLookup] = await db.query('SELECT user_id FROM resources WHERE id = ?', [resId]);
      if (resLookup && resLookup.length > 0) {
        provId = Number(resLookup[0].user_id);
      }
    }

    if (!resId || !provId) {
      return res.status(400).json({ success: false, message: 'Valid resource_id and provider_id are required.' });
    }

    if (Number(reqUserId) === Number(provId)) {
      return res.status(400).json({ success: false, message: 'You cannot borrow or purchase your own item.' });
    }

    // Check item existence and stock
    const [resources] = await db.query('SELECT id, quantity, title, status, price, location FROM resources WHERE id = ?', [resId]);
    
    let item;
    if (!resources || resources.length === 0) {
      // Auto-register resource if client referenced a demo item not yet saved
      await db.query(
        `INSERT INTO resources (id, user_id, type, listing_type, title, category, quantity, price, location, pickup_spot, status)
         VALUES (?, ?, 'offer', 'lend', ?, 'education materials', 1, 0, 'TSC', 'TSC', 'available')`,
        [resId, provId, resource_title || 'Campus Item']
      );
      item = { id: resId, quantity: 1, title: resource_title || 'Campus Item', status: 'available', price: 0 };
    } else {
      item = resources[0];
    }

    if (item.quantity < reqQty || item.status === 'fulfilled') {
      return res.status(400).json({ success: false, message: 'Insufficient quantity available for this item.' });
    }

    // Check for an already pending active request from this requester for this item
    const [existingActive] = await db.query(
      "SELECT id FROM transactions WHERE resource_id = ? AND requester_id = ? AND status IN ('pending', 'approved', 'active')",
      [resId, reqUserId]
    );

    if (existingActive && existingActive.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending request for this item.'
      });
    }

    // Deduct quantity from inventory
    await db.query('UPDATE resources SET quantity = MAX(0, quantity - ?) WHERE id = ?', [reqQty, resId]);

    // Calculate total price
    const calcTotalPrice = total_price !== undefined && total_price !== null 
      ? parseFloat(total_price) 
      : (parseFloat(item.price) || 0) * reqQty;

    const cleanPickup = (pickup_spot && pickup_spot.trim()) || item.location || 'TSC (Teacher-Student Centre)';

    // Insert transaction
    const insertQuery = `
      INSERT INTO transactions 
      (resource_id, requester_id, provider_id, transaction_type, quantity, payment_method, duration_days, pickup_spot, total_price, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const [txResult] = await db.query(insertQuery, [
      resId,
      reqUserId,
      provId,
      transaction_type,
      reqQty,
      payment_method || 'cash_on_pickup',
      duration_days ? parseInt(duration_days, 10) : null,
      cleanPickup,
      calcTotalPrice
    ]);

    return res.status(201).json({
      success: true,
      message: 'Request sent to peer provider successfully!',
      transaction_id: txResult.insertId,
      id: txResult.insertId,
      data: {
        id: txResult.insertId,
        resource_id: resId,
        provider_id: provId,
        requester_id: reqUserId,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Create Transaction Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while submitting request.' });
  }
});

// ==========================================
// 2. GET INCOMING REQUESTS (For Lenders & Sellers)
// ==========================================
router.get('/incoming', optionalProtect, async (req, res) => {
  try {
    const providerId = req.user ? req.user.id : (parseInt(req.query.user_id, 10) || 98);

    const query = `
      SELECT 
        t.*,
        r.title, r.title AS resource_title, r.listing_type, r.price, r.location, r.pickup_spot, r.category,
        u.name AS requester_name,
        u.phone AS requester_phone,
        u.location AS requester_hall,
        u.dept AS requester_dept,
        u.batch AS requester_batch,
        u.trust_score AS requester_trust_score
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users u ON t.requester_id = u.id
      WHERE t.provider_id = ?
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(query, [providerId]);
    const enriched = rows.map(enrichTransactionTimeline);

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });

  } catch (error) {
    console.error('Incoming Requests Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch incoming requests.' });
  }
});

// ==========================================
// 3. GET OUTGOING REQUESTS (For Borrowers & Buyers)
// ==========================================
router.get('/outgoing', optionalProtect, async (req, res) => {
  try {
    const requesterId = req.user ? req.user.id : (parseInt(req.query.user_id, 10) || 98);

    const query = `
      SELECT 
        t.*,
        r.title, r.title AS resource_title, r.listing_type, r.price, r.location, r.pickup_spot, r.category,
        p.name AS provider_name,
        p.phone AS provider_phone,
        p.location AS provider_hall,
        p.dept AS provider_dept,
        p.batch AS provider_batch,
        p.trust_score AS provider_trust_score
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users p ON t.provider_id = p.id
      WHERE t.requester_id = ?
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(query, [requesterId]);
    const enriched = rows.map(enrichTransactionTimeline);

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });

  } catch (error) {
    console.error('Outgoing Requests Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch outgoing requests.' });
  }
});

// ==========================================
// 4. GET COMPLETED HISTORY & ACTIVITY LEDGER
// ==========================================
router.get('/history', optionalProtect, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (parseInt(req.query.user_id, 10) || 98);

    const query = `
      SELECT 
        t.*,
        r.title, r.title AS resource_title, r.listing_type, r.price, r.location, r.pickup_spot, r.category,
        p.name AS provider_name,
        p.phone AS provider_phone,
        p.dept AS provider_dept,
        p.location AS provider_hall,
        req.name AS requester_name,
        req.phone AS requester_phone,
        req.dept AS requester_dept,
        req.location AS requester_hall
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users p ON t.provider_id = p.id
      JOIN users req ON t.requester_id = req.id
      WHERE (t.provider_id = ? OR t.requester_id = ?)
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(query, [userId, userId]);
    const enriched = rows.map(enrichTransactionTimeline);

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });

  } catch (error) {
    console.error('History Fetch Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transaction history.' });
  }
});

// ==========================================
// 5. UPDATE TRANSACTION STATUS (Approve, Reject, Complete, Cancel)
// ==========================================
router.put('/:id', optionalProtect, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id, 10);
    const userId = req.user ? req.user.id : null;
    const { status } = req.body;

    const ALLOWED_STATUSES = ['approved', 'rejected', 'completed', 'returned', 'cancelled', 'active'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const [rows] = await db.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction request not found.' });
    }

    const tx = rows[0];

    // Authorization checks (if logged in):
    if (userId && req.user.role !== 'admin') {
      const isProvider = Number(tx.provider_id) === Number(userId);
      const isRequester = Number(tx.requester_id) === Number(userId);

      if (!isProvider && !isRequester) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this transaction.' });
      }

      if (isRequester && !isProvider && status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Requesters can only cancel their own pending requests.' });
      }
    }

    // Update status in DB
    await db.query('UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, transactionId]);

    // Automatic inventory replenishment:
    // If request is rejected or cancelled, or when a borrowed item is marked completed or returned
    if (status === 'rejected' || status === 'cancelled' || ((status === 'completed' || status === 'returned') && tx.transaction_type === 'borrow_request')) {
      await db.query('UPDATE resources SET quantity = quantity + ? WHERE id = ?', [tx.quantity, tx.resource_id]);
    }

    return res.status(200).json({
      success: true,
      message: `Transaction request marked as ${status}.`,
      status,
      data: {
        id: transactionId,
        status,
        resource_id: tx.resource_id,
        provider_id: tx.provider_id,
        requester_id: tx.requester_id
      }
    });

  } catch (error) {
    console.error('Update Transaction Status Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update transaction status.' });
  }
});

module.exports = router;