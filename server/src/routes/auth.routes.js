import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const createToken = (user) => jwt.sign(
  { name: user.name, email: user.email },
  process.env.JWT_SECRET,
  { subject: String(user.id), expiresIn: '1d' }
);

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (name.length > 100) return res.status(400).json({ message: 'Name must be 100 characters or fewer.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );
    const user = rows[0];
    return res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'An account with this email already exists.' });
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const { rows } = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token: createToken(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));
export default router;
