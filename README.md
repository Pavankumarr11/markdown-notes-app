# 📝 MarkNote — Full-Stack Markdown Notes App

> A production-ready, feature-rich Markdown notes application built with React, Express, and SQLite.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📝 Markdown editor | Full GFM support — tables, task lists, fenced code |
| 👁 Live split preview | Side-by-side editor & rendered preview |
| 🔧 Markdown toolbar | Bold, italic, headings, code blocks, links & more |
| 🔐 JWT authentication | Register / Login with bcrypt-hashed passwords |
| 💾 Auto-save | Debounced silent save 900ms after typing stops |
| 🌙 Dark mode | One-click toggle, preference persisted in localStorage |
| 🔍 Search | Instant full-text search across title, content & tags |
| 🏷 Tags | Comma-separated tags with pill display |
| ⏱ Timestamps | created_at / updated_at on every note |
| 🍞 Toast notifications | Success + error feedback via react-hot-toast |
| 📦 SQLite persistence | File-based database, zero config |

---

## 🧱 Tech Stack

**Frontend**
- React 18 (hooks only)
- Vite (dev server + bundler)
- Axios (HTTP client with interceptors)
- react-markdown + remark-gfm (Markdown rendering)
- react-hot-toast (notifications)

**Backend**
- Node.js + Express 4
- better-sqlite3 (synchronous SQLite driver)
- jsonwebtoken (JWT auth)
- bcryptjs (password hashing)
- express-validator (input validation)
- cors (cross-origin headers)

---

## 📁 Project Structure

```
markdown-notes-app/
├── package.json               ← root (runs both servers with concurrently)
├── backend/
│   ├── server.js              ← Express entry point
│   ├── package.json
│   ├── .env.example
│   ├── database/
│   │   └── db.js              ← SQLite init + schema bootstrap
│   ├── middleware/
│   │   └── auth.js            ← JWT middleware
│   ├── controllers/
│   │   ├── authController.js  ← register / login
│   │   └── notesController.js ← CRUD operations
│   └── routes/
│       ├── auth.js
│       └── notes.js
└── frontend/
    ├── index.html
    ├── vite.config.js         ← dev proxy → backend :5000
    ├── package.json
    └── src/
        ├── main.jsx           ← React entry, theme bootstrap
        ├── App.jsx            ← Auth gate
        ├── hooks/
        │   ├── useAuth.jsx    ← AuthContext + login/register/logout
        │   ├── useNotes.js    ← All notes state & API calls
        │   └── useDebounce.js ← Auto-save debounce
        ├── services/
        │   └── api.js         ← Axios instance + interceptors
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Editor.jsx     ← Split pane + auto-save
        │   └── MarkdownToolbar.jsx
        ├── pages/
        │   ├── AuthPage.jsx
        │   └── NotesPage.jsx
        └── styles/
            └── global.css     ← CSS variables, light + dark themes
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js ≥ 18** — [Download](https://nodejs.org)
- **npm ≥ 9** (comes with Node.js)

Verify installation:
```bash
node -v   # should print v18.x.x or higher
npm  -v   # should print 9.x.x or higher
```

---

### Step 1 — Clone / Extract the project

```bash
# If using git:
git clone <repo-url> markdown-notes-app
cd markdown-notes-app

# If extracted from ZIP:
cd markdown-notes-app
```

---

### Step 2 — Install dependencies

```bash
# Install all dependencies for BOTH backend and frontend in one command:
npm run install:all

# Or manually:
cd backend  && npm install && cd ..
cd frontend && npm install && cd ..
```

---

### Step 3 — Configure environment (optional)

```bash
cp backend/.env.example backend/.env
# Open backend/.env and change JWT_SECRET to a long random string in production
```

The app works without a `.env` file using safe defaults for development.

---

### Step 4 — Start development servers

**Option A — Run both at once (recommended):**
```bash
# From the project root:
npm install          # installs concurrently
npm run dev          # starts backend :5000 AND frontend :5173
```

**Option B — Run separately (two terminals):**
```bash
# Terminal 1 — Backend
cd backend
npm run dev          # nodemon watches for file changes

# Terminal 2 — Frontend
cd frontend
npm run dev          # Vite HMR dev server
```

---

### Step 5 — Open in browser

```
http://localhost:5173
```

1. Click **Register** and create an account
2. You're in! Create your first note with the **+** button

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ username, password }` | Create account |
| POST | `/api/auth/login` | `{ username, password }` | Sign in |

### Notes (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes (supports `?search=query`) |
| GET | `/api/notes/:id` | Get single note |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |

---

## 🧪 Testing with Postman / curl

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
# → copy the "token" value from response
```

**Create a note:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"title":"My First Note","content":"# Hello\n\nThis is **markdown**!","tags":["work","ideas"]}'
```

**Get all notes:**
```bash
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Search notes:**
```bash
curl "http://localhost:5000/api/notes?search=hello" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 🐛 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| `EADDRINUSE :5000` | Another process is using port 5000. Run `lsof -ti:5000 \| xargs kill` |
| `Cannot find module 'better-sqlite3'` | Run `npm install` inside the `backend/` folder |
| Frontend shows CORS error | Ensure `vite.config.js` proxy points to `:5000` and Vite is running on `:5173` |
| `TokenExpiredError` | Token expired (7 days). Log out and log in again |
| Database locked | Stop all backend instances; only one process should access the SQLite file |
| Port 5173 in use | `npm run dev -- --port 3000` in the frontend folder |

---

## 🏗 Production Build

```bash
# Build frontend static files
cd frontend && npm run build

# Serve with Express (add static middleware to server.js):
# app.use(express.static(path.join(__dirname, '../frontend/dist')));

# Start backend
cd ../backend && node server.js
```

---

## 📸 Screenshots

```
┌─────────────────────────────────────────────────────────────────────┐
│ Sidebar          │  Note Title Input       │  [Save] [Delete]        │
│                  │─────────────────────────────────────────────────── │
│ 🔍 Search        │  B I S ` | H1 H2 H3 | — ❝ • 1. | </> 🔗 🖼      │
│                  │─────────────────────────┬────────────────────────  │
│ Note 1   2h ago  │  ✏️ Editor              │ 👁 Preview              │
│ Note 2   1d ago  │                         │                          │
│ Note 3   3d ago  │  # My Note              │  My Note                 │
│                  │  Some **bold** text     │  Some bold text          │
│ [username]  [→]  │                         │                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📄 License

MIT — free to use, modify, and distribute.
