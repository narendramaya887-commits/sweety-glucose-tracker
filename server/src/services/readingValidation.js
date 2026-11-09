export const VALID_SLOTS = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];

function isValidCalendarDate(value) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateReading(input, today = new Date().toISOString().slice(0, 10)) {
  const errors = {};
  const value = input?.value;

  if (value === undefined || value === null || value === '') {
    errors.value = 'Please enter a glucose value.';
  } else if (!Number.isInteger(Number(value)) || !Number.isFinite(Number(value)) || Number(value) < 40 || Number(value) > 600) {
    errors.value = 'Value must be between 40 and 600 mg/dl.';
  }

  if (!input?.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(`${input.date}T00:00:00Z`))) {
    errors.date = 'Please select a valid date.';
  } else if (input.date > today) {
    errors.date = 'Date cannot be in the future.';
  }

  if (!VALID_SLOTS.includes(input?.slot)) {
    errors.slot = 'Please select a valid time slot.';
  }

  return errors;
}
