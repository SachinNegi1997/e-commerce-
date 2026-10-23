const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/register  -> create account
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [fullName.trim(), email.trim().toLowerCase(), phone || null, passwordHash]
    );

    res.status(201).json({ message: 'Account created successfully.', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/login  -> verify credentials
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, full_name, email, password_hash FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));

    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    res.json({ message: 'Login successful.', user: { id: user.id, fullName: user.full_name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
