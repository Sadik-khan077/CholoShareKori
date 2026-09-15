const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==========================================
// REGISTER ROUTE
// ==========================================
router.post('/register', async (req, res) => {
  const { name, email, password, phone, location, registration_no } = req.body;

  try {
    // 1. Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // 2. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into the database
    const insertQuery = 'INSERT INTO users (name, email, password, phone, location, registration_no) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(insertQuery, [name, email, hashedPassword, phone, location, registration_no]);

    // 4. Generate the Auth Token
    const token = jwt.sign(
      { id: result.insertId }, 
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_this_later', 
      { expiresIn: '7d' }
    );

    // 5. Send back success
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: {
        token: token,
        user: {
          id: result.insertId,
          name: name,
          email: email,
          location: location,
          registration_no: registration_no
        }
      }
    });

  } catch (error) {
    console.error("Backend Registration Error:", error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// ==========================================
// LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if the user exists in the database
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // If the array is empty, the email doesn't exist
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // 2. Compare the typed password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Generate the Auth Token
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_this_later', 
      { expiresIn: '7d' }
    );

    // 4. Send back the success data to React
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          location: user.location,
          registration_no: user.registration_no
        }
      }
    });

  } catch (error) {
    console.error("Backend Login Error:", error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

module.exports = router;