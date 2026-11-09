import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and contain at least 32 characters.');
}

const { default: app } = await import('./app.js');
const { pool } = await import('./config/db.js');
const port = Number(process.env.PORT) || 5000;

const server = app.listen(port, () => console.log(`Sweety API listening on http://localhost:${port}`));

async function shutdown(signal) {
  console.log(`${signal} received; shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
