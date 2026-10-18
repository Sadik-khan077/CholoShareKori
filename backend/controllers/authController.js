const { registerSchema } = require('../schemas/authSchema');
const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    // 1. Zod Input Validation
    const validatedData = registerSchema.parse(req.body);

    // 2. Delegate to Service Layer
    const result = await authService.registerUser(validatedData);

    // 3. Return Success Response
    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully!',
      data: result
    });

  } catch (error) {
    // Handle Zod Validation Errors cleanly
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message // Returns the first specific validation failure
      });
    }
    
    // Pass other errors (like duplicate emails) to your global error handler
    next(error); 
  }
};

const login = async (req, res, next) => {
  try {
    // 1. Validate Input
    const validatedData = loginSchema.parse(req.body);

    // 2. Execute Service Logic
    const result = await authService.loginUser(validatedData);

    // 3. Return Success Response
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      data: result
    });

  } catch (error) {
    // Handle Zod Validation Errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }
    
    // Pass other errors to global handler
    next(error);
  }
};

const getme = async(req, res) => {
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
};

const change_pass = async (req, res) => {
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
};

const demo = async (req, res) => {
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
};

module.exports = { register, login, getme, change_pass, demo};