// src/pages/AuthPage.jsx
// Login / Register page with toggle

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode]         = useState('login');   // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password);
        toast.success('Welcome back! 👋');
      } else {
        await register(username, password);
        toast.success('Account created! Happy writing ✍️');
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Mark<span>Note</span></div>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to your notes'
            : 'Create a new account'}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '11px 0' }}
            disabled={loading}
          >
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>Don&apos;t have an account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }}>Register</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
