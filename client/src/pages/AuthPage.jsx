import { useState } from 'react';
import { api } from '../api';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('sweety_token', result.token);
      onAuthenticated(result.user);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="brand brand-light"><span className="brand-mark">s</span> sweety</div>
        <div className="story-copy"><span className="eyebrow">A LITTLE MORE AWARE, EVERY DAY</span><h1>Your health story,<br />one reading at a time.</h1><p>A calm, simple place to track your glucose readings and understand your daily patterns.</p></div>
        <div className="story-foot">Small steps. Clearer picture.</div>
      </section>
      <section className="auth-main">
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">WELCOME TO SWEETY</span>
          <h2>{mode === 'login' ? 'Good to see you.' : 'Create your account.'}</h2>
          <p className="muted">{mode === 'login' ? 'Sign in to continue your health journey.' : 'Start keeping your readings in one place.'}</p>
          {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" required maxLength="100" /></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder="At least 8 characters" minLength="8" required /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          <p className="switch-auth">{mode === 'login' ? 'New to Sweety?' : 'Already have an account?'} <button type="button" className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}> {mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        </form>
      </section>
    </main>
  );
}
