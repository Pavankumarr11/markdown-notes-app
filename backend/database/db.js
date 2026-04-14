// database/db.js
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Initialize and export a singleton SQLite connection using
//          better-sqlite3 (synchronous API — far easier to reason about in
//          small Express apps than the async sqlite3 package).
// ─────────────────────────────────────────────────────────────────────────────

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists so SQLite can create the file there.
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'notes.db');

let db;

try {
  db = new Database(DB_PATH, { verbose: process.env.NODE_ENV === 'development' ? console.log : null });
  // Enable WAL mode for better concurrent read performance.
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (err) {
  console.error('❌  Failed to open database:', err.message);
  process.exit(1);
}

// ─── Schema bootstrap ────────────────────────────────────────────────────────
// Runs once at startup; idempotent thanks to "IF NOT EXISTS".

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    username    TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT 'Untitled',
    content     TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '[]',   -- JSON array stored as text
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_notes_user_id   ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
`);

console.log('✅  Database ready at', DB_PATH);

module.exports = db;
