// server.js
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Bootstrap the Express application, register middleware and routes,
//          then start listening.
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config(); // loads .env if present (optional in dev)

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Initialize DB (runs CREATE TABLE IF NOT EXISTS on first import)
require('./database/db');

const authRoutes  = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────────────────────────────

// CORS: allow the Vite dev server (port 5173) and any production origin.
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON bodies up to 10 MB (handles large markdown documents).
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/notes', notesRoutes);

// Health check — useful for Docker / CI
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  API server listening on http://localhost:${PORT}`);
});

module.exports = app; // exported for testing
