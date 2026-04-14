// src/components/Editor.jsx
// Split-pane editor: left = textarea, right = live Markdown preview.
// Auto-saves via debounce whenever content/title/tags change.

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDebounce } from '../hooks/useDebounce';
import MarkdownToolbar from './MarkdownToolbar';

export default function Editor({ note, onSave, onDelete, saving }) {
  const [title,   setTitle]   = useState(note.title   || '');
  const [content, setContent] = useState(note.content || '');
  const [tags,    setTags]    = useState(note.tags?.join(', ') || '');

  const textareaRef = useRef(null);

  // Re-sync local state when a different note is selected
  useEffect(() => {
    setTitle(note.title   || '');
    setContent(note.content || '');
    setTags(note.tags?.join(', ') || '');
  }, [note.id]); // only when the note identity changes

  // Debounced values — trigger auto-save 900ms after the user stops typing
  const debouncedTitle   = useDebounce(title,   900);
  const debouncedContent = useDebounce(content, 900);
  const debouncedTags    = useDebounce(tags,    900);

  // Auto-save: fires whenever any debounced value changes AND differs from server
  useEffect(() => {
    const tagsArray = debouncedTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const changed =
      debouncedTitle   !== note.title   ||
      debouncedContent !== note.content ||
      JSON.stringify(tagsArray) !== JSON.stringify(note.tags || []);

    if (changed) {
      onSave(note.id, {
        title:   debouncedTitle,
        content: debouncedContent,
        tags:    tagsArray,
      }, true /* silent = no toast on auto-save */);
    }
  }, [debouncedTitle, debouncedContent, debouncedTags]); // eslint-disable-line

  const handleManualSave = useCallback(() => {
    const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    onSave(note.id, { title, content, tags: tagsArray }, false);
  }, [note.id, title, content, tags, onSave]);

  // Ctrl/Cmd+S → manual save
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleManualSave]);

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="main-header">
        <input
          className="note-title-input"
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Tags */}
        <div className="tag-input-wrap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: .5, flexShrink: 0 }}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
            <circle cx="7" cy="7" r="1" fill="currentColor"/>
          </svg>
          <input
            placeholder="tag1, tag2"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{ width: 110 }}
          />
        </div>

        <div className="header-actions">
          {/* Saving indicator */}
          <div className="saving-badge">
            {saving ? (
              <>
                <svg className="spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--color-success)' }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Saved
              </>
            )}
          </div>

          <button className="btn btn-ghost" onClick={handleManualSave} disabled={saving} style={{ fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Save
          </button>

          <button className="btn btn-danger" onClick={() => onDelete(note.id)} style={{ fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* ── Markdown Toolbar ────────────────────────────────────────────── */}
      <MarkdownToolbar
        textareaRef={textareaRef}
        content={content}
        onContentChange={setContent}
      />

      {/* ── Split Pane ──────────────────────────────────────────────────── */}
      <div className="editor-area">
        {/* Left: editor */}
        <div className="editor-pane">
          <div className="pane-label">✏️ Editor</div>
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            placeholder={`Start writing in **Markdown**…\n\n# Heading\n\nSome text with **bold** and _italic_.\n\n- List item\n- Another item\n\n\`\`\`js\nconsole.log('Hello!')\n\`\`\``}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck
          />
        </div>

        {/* Right: preview */}
        <div className="preview-pane">
          <div className="pane-label">👁 Preview</div>
          <div className="preview-pane-inner">
            {content.trim() ? (
              <div className="md-preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 13.5 }}>
                Preview will appear here as you type…
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
