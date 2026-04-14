// controllers/notesController.js
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: CRUD operations for notes. Every route is protected by the
//          authenticate middleware so `req.user` is always populated.
// ─────────────────────────────────────────────────────────────────────────────

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../database/db');

// ─── Helper ──────────────────────────────────────────────────────────────────
/**
 * Parse the JSON tags array stored in SQLite as a text column.
 * Returns a plain JS array; falls back to [] on any parse failure.
 */
function parseTags(raw) {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}

function noteRow(row) {
  return { ...row, tags: parseTags(row.tags) };
}

// ─── GET /api/notes ──────────────────────────────────────────────────────────
/**
 * Returns all notes for the authenticated user, newest first.
 * Optional query param: ?search=keyword  (searches title + content)
 */
function getAllNotes(req, res) {
  try {
    const { search } = req.query;
    let rows;

    if (search && search.trim()) {
      const pattern = `%${search.trim()}%`;
      rows = db.prepare(`
        SELECT * FROM notes
        WHERE user_id = ?
          AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)
        ORDER BY updated_at DESC
      `).all(req.user.id, pattern, pattern, pattern);
    } else {
      rows = db.prepare(`
        SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC
      `).all(req.user.id);
    }

    return res.json(rows.map(noteRow));
  } catch (err) {
    console.error('getAllNotes error:', err);
    return res.status(500).json({ error: 'Failed to fetch notes.' });
  }
}

// ─── GET /api/notes/:id ───────────────────────────────────────────────────────
/**
 * Returns a single note. 404 if not found or doesn't belong to user.
 */
function getNoteById(req, res) {
  try {
    const row = db.prepare(`
      SELECT * FROM notes WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!row) return res.status(404).json({ error: 'Note not found.' });
    return res.json(noteRow(row));
  } catch (err) {
    console.error('getNoteById error:', err);
    return res.status(500).json({ error: 'Failed to fetch note.' });
  }
}

// ─── POST /api/notes ─────────────────────────────────────────────────────────
/**
 * Creates a new note.
 * Body: { title?, content?, tags? }
 */
function createNote(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { title = 'Untitled', content = '', tags = [] } = req.body;
    const id  = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO notes (id, user_id, title, content, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, title, content, JSON.stringify(tags), now, now);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    return res.status(201).json(noteRow(note));
  } catch (err) {
    console.error('createNote error:', err);
    return res.status(500).json({ error: 'Failed to create note.' });
  }
}

// ─── PUT /api/notes/:id ───────────────────────────────────────────────────────
/**
 * Updates title, content, and/or tags. Partial updates are fine.
 */
function updateNote(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const existing = db.prepare(`
      SELECT * FROM notes WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!existing) return res.status(404).json({ error: 'Note not found.' });

    const title   = req.body.title   !== undefined ? req.body.title   : existing.title;
    const content = req.body.content !== undefined ? req.body.content : existing.content;
    const tags    = req.body.tags    !== undefined ? JSON.stringify(req.body.tags) : existing.tags;
    const now     = new Date().toISOString();

    db.prepare(`
      UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(title, content, tags, now, req.params.id, req.user.id);

    const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    return res.json(noteRow(updated));
  } catch (err) {
    console.error('updateNote error:', err);
    return res.status(500).json({ error: 'Failed to update note.' });
  }
}

// ─── DELETE /api/notes/:id ────────────────────────────────────────────────────
/**
 * Hard-deletes a note. Returns 204 No Content on success.
 */
function deleteNote(req, res) {
  try {
    const info = db.prepare(`
      DELETE FROM notes WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    if (info.changes === 0) return res.status(404).json({ error: 'Note not found.' });
    return res.status(204).send();
  } catch (err) {
    console.error('deleteNote error:', err);
    return res.status(500).json({ error: 'Failed to delete note.' });
  }
}

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote };
