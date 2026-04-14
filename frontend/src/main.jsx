// src/main.jsx
import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import { Toaster }     from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import './styles/global.css';

// Apply saved theme before first paint to prevent flash
const savedTheme = localStorage.getItem('mn_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </StrictMode>
);
