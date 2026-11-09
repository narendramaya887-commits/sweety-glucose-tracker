export function getReportRange(type, selectedDate) {
  const [year, month, day] = selectedDate.split('-').map(Number);
  const selected = new Date(Date.UTC(year, month - 1, day));
  const iso = (date) => date.toISOString().slice(0, 10);

  if (type === 'daily') return { startDate: selectedDate, endDate: selectedDate };
  if (type === 'month-to-date') {
    return { startDate: iso(new Date(Date.UTC(year, month - 1, 1))), endDate: selectedDate };
  }
  if (type === 'previous-month') {
    const firstThisMonth = new Date(Date.UTC(year, month - 1, 1));
    const lastPreviousMonth = new Date(firstThisMonth.getTime() - 86400000);
    const firstPreviousMonth = new Date(Date.UTC(lastPreviousMonth.getUTCFullYear(), lastPreviousMonth.getUTCMonth(), 1));
    return { startDate: iso(firstPreviousMonth), endDate: iso(lastPreviousMonth) };
  }
  throw new Error('Unsupported report type.');
}

export function summarizeReadings(rows) {
  if (!rows.length) return { highest: null, lowest: null, average: null, count: 0 };
  const values = rows.map((row) => Number(row.value));
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Math.round((total / values.length) * 10) / 10,
    count: values.length
  };
}
