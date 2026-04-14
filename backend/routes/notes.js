// routes/notes.js
const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/notesController');

const router = express.Router();

// All notes routes require a valid JWT
router.use(authenticate);

// Validation rules for create / update
const noteRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters.'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array.')
    .custom((arr) => arr.every((t) => typeof t === 'string' && t.length <= 50))
    .withMessage('Each tag must be a string of at most 50 characters.'),
];

router.get('/',     getAllNotes);
router.get('/:id',  getNoteById);
router.post('/',    noteRules, createNote);
router.put('/:id',  noteRules, updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
