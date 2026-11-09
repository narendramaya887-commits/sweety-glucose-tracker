import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import ReadingForm from '../components/ReadingForm';

const labels = { morning: 'Morning (fasting)', after_breakfast: 'After breakfast', after_lunch: 'After lunch', after_dinner: 'After dinner' };
const today = () => new Date().toLocaleDateString('en-CA');

function Stat({ label, value, suffix = '' }) {
  return <article className="stat-card"><span>{label}</span><strong>{value ?? '—'}{value !== null && value !== undefined ? suffix : ''}</strong></article>;
}

export default function Dashboard({ user, onLogout }) {
  const [date, setDate] = useState(today());
  const [readings, setReadings] = useState([]);
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reportEndpoint = useMemo(() => ({
    daily: 'daily', 'month-to-date': 'month-to-date', 'previous-month': 'previous-month'
  }[period]), [period]);

  async function load() {
    setLoading(true); setError('');
    try {
      const [list, stats] = await Promise.all([
        api(`/readings?date=${date}`),
        api(`/reports/${reportEndpoint}?date=${date}`)
      ]);
      setReadings(list.readings);
      setReport(stats);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [date, period]);

  async function saveReading(payload) {
    if (editing) await api(`/readings/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/readings', { method: 'POST', body: JSON.stringify(payload) });
    setEditing(null); setShowForm(false); await load();
  }

  async function removeReading(id) {
    if (!window.confirm('Delete this reading? This cannot be undone.')) return;
    try { await api(`/readings/${id}`, { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); }
  }

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">s</span> sweety</div>
        <div className="topbar-right"><span className="welcome">Hello, {user.name.split(' ')[0]}</span><button className="secondary small" onClick={onLogout}>Sign out</button></div>
      </header>
      <section className="welcome-row">
        <div><span className="eyebrow">YOUR PERSONAL GLUCOSE JOURNAL</span><h1>A healthier picture starts here.</h1><p>Every reading is a small piece of useful information.</p></div>
        <div className="date-control"><label htmlFor="report-date">Viewing date</label><input id="report-date" type="date" max={today()} value={date} onChange={e => setDate(e.target.value)} /></div>
      </section>
      <section className="report-section">
        <div className="section-heading report-heading"><div><span className="eyebrow">YOUR OVERVIEW</span><h2>{period === 'daily' ? dateLabel : period === 'month-to-date' ? 'Month to date' : 'Previous month'}</h2></div>
          <div className="tabs" role="group" aria-label="Report period">
            <button className={period === 'daily' ? 'active' : ''} onClick={() => setPeriod('daily')}>Daily</button>
            <button className={period === 'month-to-date' ? 'active' : ''} onClick={() => setPeriod('month-to-date')}>Month to date</button>
            <button className={period === 'previous-month' ? 'active' : ''} onClick={() => setPeriod('previous-month')}>Previous month</button>
          </div>
        </div>
        <p className="range-copy">{report ? `${report.startDate}  —  ${report.endDate}` : 'Loading report…'}</p>
        <div className="stats-grid">
          <Stat label="Highest" value={report?.highest} suffix=" mg/dL" />
          <Stat label="Lowest" value={report?.lowest} suffix=" mg/dL" />
          <Stat label="Average" value={report?.average} suffix=" mg/dL" />
          <Stat label="Readings" value={report?.count} />
        </div>
      </section>
      <section className="content-grid">
        <section className="panel readings-panel">
          <div className="section-heading"><div><span className="eyebrow">DAILY LOG</span><h2>Readings</h2></div><button className="primary" onClick={() => { setEditing(null); setShowForm(true); }}>＋ Add reading</button></div>
          {error && <p className="error" role="alert">{error}</p>}
          {loading ? <p className="empty">Loading your readings…</p> : readings.length === 0 ? <div className="empty-state"><div className="empty-icon">♡</div><h3>No readings yet</h3><p>Add your first reading for {dateLabel} to start your daily log.</p><button className="secondary" onClick={() => setShowForm(true)}>Add a reading</button></div> :
            <div className="reading-list">{readings.map(item => <article className="reading-row" key={item.id}><div className="slot-dot" /><div className="reading-info"><strong>{labels[item.slot]}</strong><span>{item.date}</span></div><div className="reading-value">{item.value}<small> mg/dL</small></div><div className="row-actions"><button aria-label="Edit reading" onClick={() => { setEditing(item); setShowForm(true); }}>Edit</button><button aria-label="Delete reading" onClick={() => removeReading(item.id)}>Delete</button></div></article>)}</div>}
        </section>
        <aside className="side-note"><span className="note-icon">✳</span><h3>Consistency over perfection.</h3><p>Recording readings at your usual times can help you and your healthcare professional see patterns over time.</p><span className="note-caption">YOUR JOURNEY, YOUR PACE</span></aside>
      </section>
      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditing(null); } }}><div className="modal"><ReadingForm initialValue={editing} selectedDate={date} onSave={saveReading} onCancel={() => { setShowForm(false); setEditing(null); }} /></div></div>}
      <footer className="footer">Sweety · Your personal glucose journal <span>For tracking only — not medical advice.</span></footer>
    </main>
  );
}
