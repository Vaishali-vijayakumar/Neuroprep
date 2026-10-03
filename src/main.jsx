import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Automated clean reset: wipe all previous user accounts, practice records, and sessions
if (typeof localStorage !== 'undefined') {
  const DB_CLEAN_FLAG = 'neuroprep_clean_reset_v4';
  if (!localStorage.getItem(DB_CLEAN_FLAG)) {
    try {
      localStorage.clear();
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
      localStorage.setItem(DB_CLEAN_FLAG, 'true');
    } catch (e) {
      console.error('Error clearing database:', e);
    }
  }
}

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

