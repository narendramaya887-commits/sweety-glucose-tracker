import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReading } from '../src/services/readingValidation.js';
import { getReportRange, summarizeReadings } from '../src/services/reportService.js';

const valid = { date: '2026-11-08', slot: 'morning', value: 105 };

test('accepts a valid reading', () => {
  assert.deepEqual(validateReading(valid, '2026-11-08'), {});
});
test('requires a glucose value', () => {
  assert.equal(validateReading({ ...valid, value: '' }, '2026-11-08').value, 'Please enter a glucose value.');
});
test('rejects decimals and values outside 40..600', () => {
  for (const value of [39, 601, 88.5, 'abc']) {
    assert.equal(validateReading({ ...valid, value }, '2026-11-08').value, 'Value must be between 40 and 600 mg/dl.');
  }
});
test('rejects a future date', () => {
  assert.equal(validateReading({ ...valid, date: '2026-11-09' }, '2026-11-08').date, 'Date cannot be in the future.');
});
test('rejects an unknown slot', () => {
  assert.ok(validateReading({ ...valid, slot: 'midnight' }, '2026-11-08').slot);
});
test('calculates previous calendar month across year boundary', () => {
  assert.deepEqual(getReportRange('previous-month', '2026-01-15'), {
    startDate: '2025-12-01', endDate: '2025-12-31'
  });
});
test('summarizes values and rounds average to one decimal', () => {
  assert.deepEqual(summarizeReadings([{ value: 100 }, { value: 111 }, { value: 120 }]), {
    highest: 120, lowest: 100, average: 110.3, count: 3
  });
});
test('returns a friendly empty summary shape', () => {
  assert.deepEqual(summarizeReadings([]), { highest: null, lowest: null, average: null, count: 0 });
});
