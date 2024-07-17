const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// Register User
router.post('/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check if user already exists
  db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;

      // Insert user into database
      db.query('INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)', 
               [firstName, lastName, email, hash], (err, result) => {
        if (err) throw err;
        res.status(201).json({ msg: 'User registered' });
      });
    });
  });
});

// Authenticate User
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare password
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Create JWT token
      const payload = { id: result[0].id, email: result[0].email };
      jwt.sign(payload, 'your_jwt_secret', { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        req.session.user = {
          id: result[0].id,
          email: result[0].email,
          firstName: result[0].firstName,
          lastName: result[0].lastName
        };
        res.redirect('/homepage')
      });
    });
  });
});

// Logout User
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ msg: 'Error logging out' });
    }
    res.redirect('/login');
  });
});

module.exports = router;
