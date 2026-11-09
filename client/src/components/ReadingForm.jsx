import React, { useEffect, useState } from 'react';

const slots = [
  ['morning', 'Morning (fasting)'],
  ['after_breakfast', 'After breakfast'],
  ['after_lunch', 'After lunch'],
  ['after_dinner', 'After dinner']
];

export default function ReadingForm({ initialValue, onSave, onCancel, selectedDate }) {
  const [date, setDate] = useState(initialValue?.date || selectedDate);
  const [slot, setSlot] = useState(initialValue?.slot || 'morning');
  const [value, setValue] = useState(initialValue?.value ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(initialValue?.date || selectedDate);
    setSlot(initialValue?.slot || 'morning');
    setValue(initialValue?.value ?? '');
    setError('');
  }, [initialValue, selectedDate]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const numeric = Number(value);
    if (value === '') return setError('Please enter a glucose value.');
    if (!Number.isInteger(numeric) || numeric < 40 || numeric > 600) {
      return setError('Value must be between 40 and 600 mg/dl.');
    }
    if (date > new Date().toLocaleDateString('en-CA')) return setError('Date cannot be in the future.');

    setSaving(true);
    try {
      await onSave({ date, slot, value: numeric });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel reading-form" onSubmit={submit}>
      <div className="section-heading">
        <div><span className="eyebrow">{initialValue ? 'UPDATE ENTRY' : 'NEW ENTRY'}</span><h2>{initialValue ? 'Edit reading' : 'Add glucose reading'}</h2></div>
        {onCancel && <button type="button" className="icon-button" onClick={onCancel} aria-label="Close form">×</button>}
      </div>
      <label>Date<input type="date" value={date} max={new Date().toLocaleDateString('en-CA')} onChange={e => setDate(e.target.value)} required /></label>
      <label>Time slot<select value={slot} onChange={e => setSlot(e.target.value)}>{slots.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <label>Glucose value <span className="muted">(mg/dL)</span><input type="number" min="40" max="600" step="1" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 105" required /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-actions"><button className="primary" disabled={saving}>{saving ? 'Saving…' : initialValue ? 'Save changes' : 'Save reading'}</button>{onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}</div>
    </form>
  );
}
