import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validateReading } from '../services/readingValidation.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { date } = req.query;
    const params = [req.user.id];
    let sql = `SELECT id, reading_date AS date, slot, value
               FROM readings WHERE user_id = $1`;
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return res.status(400).json({ message: 'Date must use YYYY-MM-DD format.' });
      params.push(date);
      sql += ' AND reading_date = $2';
    }
    sql += ` ORDER BY reading_date DESC,
      CASE slot WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2 WHEN 'after_lunch' THEN 3 ELSE 4 END`;
    const { rows } = await pool.query(sql, params);
    return res.json({ readings: rows });
  } catch (error) { return next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateReading(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: Object.values(errors)[0], errors });

    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM readings WHERE user_id = $1 AND reading_date = $2',
      [req.user.id, req.body.date]
    );
    if (countResult.rows[0].count >= 4) return res.status(400).json({ message: 'You can add only 4 readings per day.' });

    const { rows } = await pool.query(
      `INSERT INTO readings(user_id, reading_date, slot, value)
       VALUES($1, $2, $3, $4)
       RETURNING id, reading_date AS date, slot, value`,
      [req.user.id, req.body.date, req.body.slot, Number(req.body.value)]
    );
    return res.status(201).json({ reading: rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: `You already have an ${String(req.body.slot).replaceAll('_', ' ')} reading for this date.` });
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateReading(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: Object.values(errors)[0], errors });
    const { rows } = await pool.query(
      `UPDATE readings SET reading_date = $1, slot = $2, value = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, reading_date AS date, slot, value`,
      [req.body.date, req.body.slot, Number(req.body.value), req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Reading not found.' });
    return res.json({ reading: rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: `You already have an ${String(req.body.slot).replaceAll('_', ' ')} reading for this date.` });
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM readings WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Reading not found.' });
    return res.status(204).end();
  } catch (error) { return next(error); }
});

export default router;
