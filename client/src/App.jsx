import React, { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sweety_token');
    if (!token) { setChecking(false); return; }
    api('/auth/me').then(result => setUser(result.user))
      .catch(() => localStorage.removeItem('sweety_token'))
      .finally(() => setChecking(false));
  }, []);

  function logout() {
    localStorage.removeItem('sweety_token');
    setUser(null);
  }

  if (checking) return <div className="screen-loader">Opening your journal…</div>;
  return user ? <Dashboard user={user} onLogout={logout} /> : <AuthPage onAuthenticated={setUser} />;
}
