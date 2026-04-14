// src/hooks/useAuth.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Global auth state via React context.
//          Provides login(), register(), logout() and the current user object.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mn_user')); }
    catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const { data } = await authAPI.login({ username, password });
    localStorage.setItem('mn_token', data.token);
    localStorage.setItem('mn_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (username, password) => {
    const { data } = await authAPI.register({ username, password });
    localStorage.setItem('mn_token', data.token);
    localStorage.setItem('mn_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mn_token');
    localStorage.removeItem('mn_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
