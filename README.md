# Sweety – Blood Glucose Tracker

A full-stack assessment implementation using React + Vite, Node.js + Express, and PostgreSQL.

## Features
- Register and log in; passwords are hashed with bcrypt.
- JWT authentication; every reading query is scoped to the logged-in user.
- Create, list, edit and delete glucose readings.
- Four allowed slots per day, one reading per slot, maximum four readings per day.
- Server-side and client-side validation; dates in the future are rejected.
- Daily, month-to-date and previous-calendar-month reports (high, low, average to 1 decimal, count).
- Daily report includes the individual readings.
- Seed script creates a demo account and sample readings.
- API and validation tests.
- Docker Compose for PostgreSQL.

## Requirements
- Node.js 20+
- npm
- Docker Desktop (recommended) OR a local PostgreSQL 14+ instance

## Project structure
```text
sweety/
  server/
    src/
      config/ db.js
      middleware/auth.js
      routes/auth.routes.js readings.routes.js reports.routes.js
      services/readingValidation.js reportService.js
      app.js server.js
    scripts/seed.js
    tests/readingValidation.test.js
    .env.example
  client/
    src/
      api.js
      components/ReadingForm.jsx
      pages/AuthPage.jsx Dashboard.jsx
      App.jsx main.jsx styles.css
    .env.example
  docker-compose.yml
```

## 1. Configure environment
Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.

Server `.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sweety
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
```

Client `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files. `.env.example` contains placeholders only.

## 2. Start PostgreSQL
From the project root:
```bash
docker compose up -d db
```
The database is created automatically. For a local PostgreSQL installation, create a database named `sweety` and update `DATABASE_URL`.

## 3. Install and initialize
Open a terminal in `server`:
```bash
npm install
npm run db:migrate
npm run db:seed
npm test
npm run dev
```
The API runs at `http://localhost:5000`.

Open another terminal in `client`:
```bash
npm install
npm run dev
```
Open `http://localhost:5173`.

## Demo login
- Email: `demo@sweety.local`
- Password: `SweetyDemo123!`

Change this password before using any deployment with real patient information.

## API overview
All protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/readings?date=YYYY-MM-DD` | List readings; optional date filter |
| POST | `/api/readings` | Create reading |
| PUT | `/api/readings/:id` | Update reading |
| DELETE | `/api/readings/:id` | Delete reading |
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | 1st of selected month through selected date |
| GET | `/api/reports/previous-month?date=YYYY-MM-DD` | Entire previous calendar month |

Reading slots are `morning`, `after_breakfast`, `after_lunch`, `after_dinner`. Values must be whole numbers from 40 through 600 mg/dL.

## Database
The server runs the idempotent SQL migration at `server/src/db/migrations/001_init.sql` using `npm run db:migrate`. A unique constraint on `(user_id, reading_date, slot)` protects against duplicate slots even under concurrent requests.

## Tests
`npm test` runs Node's built-in test runner for the core reading validation rules. The test suite covers missing values, integer/range validation, slot validation and future dates.

## Assumptions and notes
- Dates are stored as PostgreSQL `DATE` values and interpreted as calendar dates, not timestamps. The browser submits `YYYY-MM-DD`.
- A user's maximum of four readings/day follows naturally from the four permitted unique slots; the API also checks the daily count and returns the specified message.
- Report averages are rounded to one decimal place.
- Month-to-date includes the selected date. Previous-month means the entire preceding calendar month.
- The brief does not specify password complexity or email verification; this implementation requires a minimum password length of 8 and does not implement email verification.
- This is an assessment/demo application, not a certified medical device. It does not provide medical advice.
- With more time: add refresh-token rotation, rate limiting, password reset/email verification, integration/UI tests, deployment configuration, audit logging and stronger operational monitoring.
