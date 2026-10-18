const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_this_later';

/**
 * Helper to generate signed JWT tokens.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// ==========================================
// 1. REGISTER NEW STUDENT USER
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      location, 
      registration_no,
      dept,
      batch,
      bio 
    } = req.body;

    // Strict Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Valid student name is required.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid university or personal email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (!phone || phone.trim().length < 7) {
      return res.status(400).json({ success: false, message: 'Valid contact phone number is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanLocation = (location && location.trim()) || 'Al-Beruni Hall';
    const cleanRegNo = (registration_no && registration_no.trim()) || `JU-${Date.now().toString().slice(-6)}`;
    const cleanDept = (dept && dept.trim()) || 'Computer Science & Engineering';
    const cleanBatch = (batch && batch.trim()) || 'Batch 50';
    const cleanBio = (bio && bio.trim()) || 'JU student participating in campus circular resource sharing.';

    // Check existing email
    const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingEmail && existingEmail.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Check existing registration_no
    const [existingReg] = await db.query('SELECT id FROM users WHERE registration_no = ?', [cleanRegNo]);
    if (existingReg && existingReg.length > 0) {
      return res.status(400).json({ success: false, message: 'This student ID or registration number is already registered.' });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new student user
    const insertQuery = `
      INSERT INTO users 
      (name, email, password, phone, location, dept, batch, registration_no, bio, trust_score, karma_points, on_time_rate, role, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 99.0, 350, '100%', 'user', 'active')
    `;
    const [result] = await db.query(insertQuery, [
      cleanName, cleanEmail, hashedPassword, cleanPhone, cleanLocation, cleanDept, cleanBatch, cleanRegNo, cleanBio
    ]);

    const newUserId = result.insertId;
    const token = generateToken(newUserId);

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully!',
      data: {
        token,
        user: {
          id: newUserId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          location: cleanLocation,
          dept: cleanDept,
          batch: cleanBatch,
          registration_no: cleanRegNo,
          bio: cleanBio,
          trust_score: 99.0,
          karma_points: 350,
          on_time_rate: '100%',
          role: 'user',
          status: 'active'
        }
      }
    });

  } catch (error) {
    console.error('Registration Route Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email or registration number already in use.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// ==========================================
// 2. USER LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check account status
    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your campus account is currently suspended.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Welcome back!',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          dept: user.dept || 'Computer Science & Engineering',
          batch: user.batch || 'Batch 52',
          registration_no: user.registration_no,
          bio: user.bio,
          trust_score: Number(user.trust_score) || 99.0,
          karma_points: Number(user.karma_points) || 350,
          on_time_rate: user.on_time_rate || '100%',
          role: user.role || 'user',
          status: user.status || 'active'
        }
      }
    });

  } catch (error) {
    console.error('Login Route Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// ==========================================
// 3. GET CURRENT USER PROFILE (ME)
// ==========================================
router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userRows] = await db.query(
      `SELECT id, name, email, phone, location, dept, batch, registration_no, bio, 
              trust_score, karma_points, on_time_rate, role, status, created_at 
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRows[0];

    // Calculate real activity counts from DB
    const [[{ total_listings }]] = await db.query(
      'SELECT COUNT(*) as total_listings FROM resources WHERE user_id = ?',
      [userId]
    );

    const [[{ active_loans }]] = await db.query(
      "SELECT COUNT(*) as active_loans FROM transactions WHERE (provider_id = ? OR requester_id = ?) AND status IN ('pending', 'approved')",
      [userId, userId]
    );

    const [[{ completed_loans }]] = await db.query(
      "SELECT COUNT(*) as completed_loans FROM transactions WHERE (provider_id = ? OR requester_id = ?) AND status = 'completed'",
      [userId, userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        trust_score: Number(user.trust_score) || 99.0,
        karma_points: Number(user.karma_points) || 350,
        stats: {
          total_listings: Number(total_listings) || 0,
          active_loans: Number(active_loans) || 0,
          completed_loans: Number(completed_loans) || 0,
          trust_score: Number(user.trust_score) || 99.0
        }
      }
    });

  } catch (error) {
    console.error('Auth /me Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

// ==========================================
// 4. CHANGE PASSWORD
// ==========================================
router.post('/change-password', protect, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password (min 6 characters) are required.'
      });
    }

    const [userRows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, userRows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashed = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHashed, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// ==========================================
// 5. GET AVAILABLE DEMO PROFILES
// ==========================================
router.get('/demo-students', async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT id, name, email, phone, location, dept, batch, bio, trust_score, karma_points, on_time_rate 
       FROM users 
       WHERE id IN (98, 97, 99) 
       ORDER BY id ASC`
    );

    const enriched = students.map(s => ({
      ...s,
      demo_token: `demo-jwt-token-${s.id}`,
      jwt_token: generateToken(s.id)
    }));

    return res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch demo profiles.' });
  }
});

module.exports = router;