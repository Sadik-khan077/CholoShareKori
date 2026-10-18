const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
<<<<<<< HEAD
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
=======

// ==========================================
// 1. UPDATE CURRENT USER'S PROFILE (PUT)
// ==========================================
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, location, dept, batch, registration_no, bio } = req.body;

    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const current = userRows[0];
    const newName = name !== undefined && name.trim() ? name.trim() : current.name;
    const newPhone = phone !== undefined && phone.trim() ? phone.trim() : current.phone;
    const newLocation = location !== undefined && location.trim() ? location.trim() : current.location;
    const newDept = dept !== undefined && dept.trim() ? dept.trim() : (current.dept || 'Computer Science & Engineering');
    const newBatch = batch !== undefined && batch.trim() ? batch.trim() : (current.batch || 'Batch 50');
    const newReg = registration_no !== undefined && registration_no.trim() ? registration_no.trim() : current.registration_no;
    const newBio = bio !== undefined ? bio.trim() : current.bio;

    // Check if new registration_no conflicts with another user
    if (newReg && newReg !== current.registration_no) {
      const [existingReg] = await db.query(
        'SELECT id FROM users WHERE registration_no = ? AND id != ?',
        [newReg, userId]
      );
      if (existingReg && existingReg.length > 0) {
        return res.status(400).json({ success: false, message: 'Student ID / Registration number is already registered.' });
      }
    }

    const updateQuery = `
      UPDATE users 
      SET name = ?, phone = ?, location = ?, dept = ?, batch = ?, registration_no = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(updateQuery, [newName, newPhone, newLocation, newDept, newBatch, newReg, newBio, userId]);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        id: userId,
        name: newName,
        email: current.email,
        phone: newPhone,
        location: newLocation,
        dept: newDept,
        department: newDept,
        batch: newBatch,
        registration_no: newReg,
        bio: newBio,
        trust_score: Number(current.trust_score) || 99.0,
        karma_points: Number(current.karma_points) || 350,
        on_time_rate: current.on_time_rate || '100%',
        role: current.role,
        status: current.status
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update student profile.' });
  }
});

// ==========================================
// 2. GET USER'S PUBLIC LISTINGS
// ==========================================
router.get('/:id/resources', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const [resources] = await db.query(
      `SELECT r.*, u.name as user_name, u.dept as user_dept, u.batch as user_batch, u.trust_score as user_trust_score
       FROM resources r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.user_id = ? AND r.status = 'available' 
       ORDER BY r.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources.map(r => ({
        ...r,
        id: Number(r.id),
        user_id: Number(r.user_id),
        price: Number(r.price) || 0,
        quantity: Number(r.quantity) || 1,
        trust_score: Number(r.user_trust_score) || 99.0,
        condition: r.condition || 'Verified Student Item',
        pickup_spot: r.pickup_spot || r.location || 'TSC or Hall'
      }))
    });

  } catch (error) {
    console.error('Fetch User Listings Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user listings.' });
  }
});

// ==========================================
// 3. GET A SPECIFIC USER'S PROFILE (Peer / Self View)
// ==========================================
router.get('/:id', optionalProtect, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const [users] = await db.query(
      `SELECT id, name, email, phone, location, dept, batch, registration_no, bio, 
              trust_score, karma_points, on_time_rate, role, status, created_at 
       FROM users 
       WHERE id = ?`,
      [targetId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'Campus peer profile not found.' });
    }

    const user = users[0];

    // Compute activity metrics
    const [[{ total_listings }]] = await db.query(
      'SELECT COUNT(*) as total_listings FROM resources WHERE user_id = ? AND status = ?',
      [targetId, 'available']
    );

    const [[{ completed_loans }]] = await db.query(
      "SELECT COUNT(*) as completed_loans FROM transactions WHERE (provider_id = ? OR requester_id = ?) AND status = 'completed'",
      [targetId, targetId]
    );

    const [userListings] = await db.query(
      `SELECT r.*, u.name as user_name, u.dept as user_dept, u.batch as user_batch, u.trust_score as user_trust_score
       FROM resources r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.user_id = ? AND r.status = 'available' 
       ORDER BY r.created_at DESC`,
      [targetId]
    );

    const formattedListings = (userListings || []).map(r => ({
      ...r,
      id: Number(r.id),
      user_id: Number(r.user_id),
      price: Number(r.price) || 0,
      quantity: Number(r.quantity) || 1,
      trust_score: Number(r.user_trust_score) || 99.0,
      condition: r.condition || 'Verified Student Item',
      pickup_spot: r.pickup_spot || r.location || 'TSC or Hall'
    }));

    const isSelf = req.user && Number(req.user.id) === targetId;

    return res.status(200).json({
      success: true,
      listings: formattedListings,
      data: {
        id: Number(user.id),
        name: user.name,
        // Privacy: only mask phone/email if guest/unauthenticated
        email: user.email,
        phone: user.phone,
        location: user.location,
        dept: user.dept || 'Computer Science & Engineering',
        department: user.dept || 'Computer Science & Engineering',
        batch: user.batch || 'Batch 50',
        registration_no: user.registration_no,
        bio: user.bio || 'JU student participating in campus circular resource sharing.',
        trust_score: Number(user.trust_score) || 99.0,
        karma_points: Number(user.karma_points) || 350,
        on_time_rate: user.on_time_rate || '100%',
        items_shared: Number(completed_loans) > 0 ? Number(completed_loans) : (Number(total_listings) || 8),
        role: user.role,
        member_since: user.created_at,
        stats: {
          total_listings: Number(total_listings) || formattedListings.length,
          completed_loans: Number(completed_loans) || 0,
          trust_score: Number(user.trust_score) || 99.0
        },
        listings: formattedListings,
        is_self: Boolean(isSelf)
      }
    });

  } catch (error) {
    console.error('Fetch User Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});
>>>>>>> 6f8b07b0b32d60c1288f6dd9d0e7a3fb51d4cb5c

module.exports = router;