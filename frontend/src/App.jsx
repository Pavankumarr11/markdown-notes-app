// src/App.jsx
import { useAuth } from './hooks/useAuth';
import AuthPage  from './pages/AuthPage';
import NotesPage from './pages/NotesPage';

export default function App() {
  const { user } = useAuth();
  return user ? <NotesPage /> : <AuthPage />;
}
