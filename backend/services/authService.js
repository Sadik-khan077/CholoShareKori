const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Assuming db.js is one level up

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is loaded from .env now!

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (userData) => {
  // 1. Apply defaults for the campus community
  const cleanEmail = userData.email.trim().toLowerCase();
  const cleanName = userData.name.trim();
  const cleanPhone = userData.phone.trim();
  const cleanLocation = (userData.location && userData.location.trim()) || 'Al-Beruni Hall';
  const cleanRegNo = (userData.registration_no && userData.registration_no.trim()) || `JU-${Date.now().toString().slice(-6)}`;
  const cleanDept = (userData.dept && userData.dept.trim()) || 'Computer Science & Engineering';
  const cleanBatch = (userData.batch && userData.batch.trim()) || 'Batch 50';
  const cleanBio = (userData.bio && userData.bio.trim()) || 'JU student participating in campus circular resource sharing.';

  // 2. Check for duplicate records
  const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
  if (existingEmail && existingEmail.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 400;
    throw error;
  }

  const [existingReg] = await db.query('SELECT id FROM users WHERE registration_no = ?', [cleanRegNo]);
  if (existingReg && existingReg.length > 0) {
    const error = new Error('This student ID or registration number is already registered.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Hash password and execute insertion
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

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

  // 4. Return the constructed user profile
  return {
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
  };
};

const loginUser = async (loginData) => {
  const cleanEmail = loginData.email.trim().toLowerCase();

  // 1. Query user from the database
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
  
  if (!users || users.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];

  // 2. Verify password
  const isMatch = await bcrypt.compare(loginData.password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // 3. Check active status
  if (user.status !== 'active') {
    const error = new Error('Your student account is suspended or inactive.');
    error.statusCode = 403;
    throw error;
  }

  // 4. Generate Token
  const token = generateToken(user.id);

  // 5. Clean sensitive data before returning
  delete user.password;

  return {
    token,
    user
  };
};

module.exports = { registerUser, loginUser };