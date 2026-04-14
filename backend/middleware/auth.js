// middleware/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Verify JWT token on every protected route.
//          Attaches `req.user = { id, username }` on success.
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dev-key-change-in-prod';

/**
 * Express middleware that validates a Bearer JWT in the Authorization header.
 * Returns 401 if missing or invalid, 403 if expired.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

module.exports = { authenticate, JWT_SECRET };
