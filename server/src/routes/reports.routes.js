import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { getReportRange, summarizeReadings } from '../services/reportService.js';

const router = Router();
router.use(requireAuth);

async function report(req, res, next, type) {
  try {
    const date = String(req.query.date || new Date().toISOString().slice(0, 10));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      return res.status(400).json({ message: 'Date must use YYYY-MM-DD format.' });
    }
    const { startDate, endDate } = getReportRange(type, date);
    const { rows } = await pool.query(
      `SELECT id, reading_date AS date, slot, value FROM readings
       WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3
       ORDER BY reading_date ASC,
       CASE slot WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2 WHEN 'after_lunch' THEN 3 ELSE 4 END`,
      [req.user.id, startDate, endDate]
    );
    return res.json({ type, startDate, endDate, ...summarizeReadings(rows), readings: type === 'daily' ? rows : undefined });
  } catch (error) { return next(error); }
}

router.get('/daily', (req, res, next) => report(req, res, next, 'daily'));
router.get('/month-to-date', (req, res, next) => report(req, res, next, 'month-to-date'));
router.get('/previous-month', (req, res, next) => report(req, res, next, 'previous-month'));
export default router;
