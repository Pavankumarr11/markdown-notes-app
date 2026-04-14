// src/pages/NotesPage.jsx
// The main app shell once authenticated.

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Editor  from '../components/Editor';
import { useNotes } from '../hooks/useNotes';

export default function NotesPage() {
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const {
    notes, activeNote, setActiveNote,
    loading, saving,
    searchQuery,
    createNote, saveNote, deleteNote, search,
  } = useNotes();

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  }

  return (
    <div className="app-shell">
      <Sidebar
        notes={notes}
        activeNote={activeNote}
        onSelect={setActiveNote}
        onCreate={createNote}
        onSearch={search}
        searchQuery={searchQuery}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <div className="main-content">
        {loading && !activeNote ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
              </svg>
            </div>
          </div>
        ) : activeNote ? (
          <Editor
            key={activeNote.id}
            note={activeNote}
            onSave={saveNote}
            onDelete={deleteNote}
            saving={saving}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No note selected</h3>
            <p>Select a note from the sidebar or create a new one to get started.</p>
            <button className="btn btn-primary" onClick={createNote}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create first note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
