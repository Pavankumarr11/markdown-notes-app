// src/components/MarkdownToolbar.jsx
// Inserts markdown syntax at cursor position in a <textarea>.

export default function MarkdownToolbar({ textareaRef, onContentChange, content }) {

  function wrap(before, after = before) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const selected = content.slice(start, end);
    const newText  = content.slice(0, start) + before + selected + after + content.slice(end);
    onContentChange(newText);
    // Restore cursor
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    });
  }

  function insertLine(prefix) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const newText = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    onContentChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  function insertBlock(text) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const newText = content.slice(0, start) + text + content.slice(start);
    onContentChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      const newPos = start + text.indexOf('\n') + 1;
      ta.setSelectionRange(newPos, newPos);
    });
  }

  const tools = [
    { label: 'B',      title: 'Bold',           action: () => wrap('**') },
    { label: 'I',      title: 'Italic',          action: () => wrap('_') },
    { label: 'S',      title: 'Strikethrough',   action: () => wrap('~~') },
    { label: '`',      title: 'Inline code',     action: () => wrap('`') },
    { sep: true },
    { label: 'H1',     title: 'Heading 1',       action: () => insertLine('# ') },
    { label: 'H2',     title: 'Heading 2',       action: () => insertLine('## ') },
    { label: 'H3',     title: 'Heading 3',       action: () => insertLine('### ') },
    { sep: true },
    { label: '—',      title: 'Horizontal rule', action: () => onContentChange(content + '\n---\n') },
    { label: '❝',      title: 'Blockquote',      action: () => insertLine('> ') },
    { label: '• ',     title: 'Bullet list',     action: () => insertLine('- ') },
    { label: '1.',     title: 'Numbered list',   action: () => insertLine('1. ') },
    { sep: true },
    { label: '</>',    title: 'Code block',      action: () => insertBlock('\n```\n\n```\n') },
    { label: '🔗',    title: 'Link',             action: () => wrap('[', '](url)') },
    { label: '🖼',    title: 'Image',            action: () => wrap('![alt](', ')') },
  ];

  return (
    <div className="md-toolbar">
      {tools.map((t, i) =>
        t.sep
          ? <div key={`sep-${i}`} className="md-toolbar-sep" />
          : (
            <button
              key={t.label}
              className="md-toolbar-btn"
              title={t.title}
              onMouseDown={(e) => { e.preventDefault(); t.action(); }}
            >
              {t.label}
            </button>
          )
      )}
    </div>
  );
}
