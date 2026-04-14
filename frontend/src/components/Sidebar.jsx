// src/components/Sidebar.jsx
import { useAuth } from '../hooks/useAuth';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Sidebar({ notes, activeNote, onSelect, onCreate, onSearch, searchQuery, darkMode, onToggleDark }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Logo + dark toggle */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity=".15"/>
            <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Mark<span>Note</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-icon" onClick={onToggleDark} title="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn-icon" onClick={onCreate} title="New note" style={{ background: 'rgba(251,146,60,.15)', color: 'var(--color-accent)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search notes…"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Notes list */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-sidebar-mut)', fontSize: 13 }}>
            {searchQuery ? 'No results found.' : 'No notes yet. Create one!'}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${activeNote?.id === note.id ? 'active' : ''}`}
              onClick={() => onSelect(note)}
            >
              <div className="note-item-title">{note.title || 'Untitled'}</div>
              <div className="note-item-preview">
                {note.content
                  ? note.content.replace(/[#*`_>\[\]]/g, '').slice(0, 60)
                  : 'No content'}
              </div>
              <div className="note-item-meta">
                <span className="note-item-date">{formatDate(note.updated_at)}</span>
                {note.tags?.length > 0 && (
                  <div className="note-item-tags">
                    {note.tags.slice(0, 2).map((t) => (
                      <span key={t} className="tag-pill">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* User footer */}
      <div className="sidebar-footer">
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'var(--font-ui)',
          fontWeight: 700, fontSize: 14, flexShrink: 0
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.username}</div>
          <div className="user-role">{notes.length} note{notes.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn-icon" onClick={logout} title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
