// controllers/authController.js
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Handle user registration and login.
//          Passwords are hashed with bcryptjs; sessions are JWT-based.
// ─────────────────────────────────────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

// ─── Register ────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Body: { username, password }
 * Returns: { token, user: { id, username } }
 */
async function register(req, res) {
  // 1. Validate input (rules defined in the route file).
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // 2. Check for duplicate username.
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    // 3. Hash password (cost factor 12 — good balance of security and speed).
    const hash = await bcrypt.hash(password, 12);
    const id   = uuidv4();

    // 4. Persist user.
    db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').run(id, username, hash);

    // 5. Issue JWT (7-day expiry for demo convenience; tighten in production).
    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ token, user: { id, username } });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, user: { id, username } }
 */
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // 1. Find user.
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      // Generic message prevents username enumeration.
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 2. Compare password.
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3. Issue JWT.
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = { register, login };
