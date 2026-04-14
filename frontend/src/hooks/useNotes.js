// src/hooks/useNotes.js
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Encapsulates all notes state and async operations.
//          Components stay lean — they call these functions and render state.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { notesAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useNotes() {
  const [notes,         setNotes]         = useState([]);
  const [activeNote,    setActiveNote]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const { data } = await notesAPI.getAll(query);
      setNotes(data);
      // Keep activeNote in sync if it was updated elsewhere
      if (activeNote) {
        const refreshed = data.find((n) => n.id === activeNote.id);
        if (refreshed) setActiveNote(refreshed);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load notes.');
    } finally {
      setLoading(false);
    }
  }, [activeNote]);

  // ── Create ───────────────────────────────────────────────────────────────
  const createNote = useCallback(async () => {
    try {
      const { data } = await notesAPI.create({ title: 'Untitled Note', content: '' });
      setNotes((prev) => [data, ...prev]);
      setActiveNote(data);
      toast.success('Note created!');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create note.');
    }
  }, []);

  // ── Save (used by auto-save & manual save button) ────────────────────────
  const saveNote = useCallback(async (id, patch, silent = false) => {
    setSaving(true);
    try {
      const { data } = await notesAPI.update(id, patch);
      setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
      setActiveNote((prev) => (prev?.id === id ? data : prev));
      if (!silent) toast.success('Note saved!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteNote = useCallback(async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes((prev) => {
        const remaining = prev.filter((n) => n.id !== id);
        // Auto-select adjacent note
        if (activeNote?.id === id) {
          setActiveNote(remaining[0] ?? null);
        }
        return remaining;
      });
      toast.success('Note deleted.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete note.');
    }
  }, [activeNote]);

  // ── Search ───────────────────────────────────────────────────────────────
  const search = useCallback((q) => {
    setSearchQuery(q);
    fetchNotes(q);
  }, [fetchNotes]);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => { fetchNotes(); }, []); // eslint-disable-line

  return {
    notes,
    activeNote,
    setActiveNote,
    loading,
    saving,
    searchQuery,
    fetchNotes,
    createNote,
    saveNote,
    deleteNote,
    search,
  };
}
