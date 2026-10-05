# FarmSafe API Server

Node.js + Express + MongoDB (Mongoose) backend for FarmSafe, replacing the
original Python/FastAPI + SQLite backend in `website/`. That directory is
kept as read-only reference material; this server does not import or modify
anything under it.

## Setup

```bash
cd server
npm install
cp .env.example .env   # then edit values as needed
```

Environment variables (see `.env.example`):

- `MONGODB_URI` — MongoDB connection string.
- `JWT_SECRET` — secret used to sign auth JWTs.
- `PORT` — Express port (default 5000).
- `WEATHER_API_KEY` — OpenWeather API key. If unset, `/api/advisory` still
  works, just without weather-based risk flags.
- `OLLAMA_BASE_URL` — OpenAI-compatible base URL for a local Ollama server
  (default `http://localhost:11434/v1`).
- `OLLAMA_MODEL` — model name to use for the advisory narrative (default
  `gemma4:e2b-it-q4_K_M`).

## Data migration (one-off)

The original SQLite `mandi_market_data` table is migrated into MongoDB in
two steps:

```bash
# 1. Export SQLite rows to JSON (run from repo root, needs Python 3 + stdlib sqlite3 only)
python server/scripts/export_sqlite_to_json.py

# 2. Seed MongoDB from that JSON (needs MONGODB_URI set, e.g. via server/.env)
cd server
npm run seed
```

The seed script upserts on the same composite key the original SQLite table
used: `(arrival_date, state, district, market, commodity, variety, grade)`.

## Running

```bash
npm run dev     # or: npm start
```

Both commands run `node src/server.js`, which connects to MongoDB and then
starts listening on `PORT`.

## Endpoints

### Auth (public)
- `POST /api/auth/register` — body `{ name, email, password, role? }`.
  Returns `201` with `{ success, message, user, token }`.
- `POST /api/auth/login` — body `{ email, password }`. Returns `200` with
  `{ success, message, user, token }`, or `401` on bad credentials.

All other routes require `Authorization: Bearer <token>` (the JWT returned
above) except the market routes, which are public.

### Market (public)
- `GET /api/market?state=&district=&market=&crop=` — latest price row for
  the given location/commodity.
- `GET /api/market/history?state=&district=&market=&crop=&limit=30` —
  price history (oldest → newest), `limit` max 90.

### Advisory (requires auth, any role)
- `POST /api/advisory` — body `{ crop?, state?, district?, market?,
  latitude?, longitude?, language? }`, all optional with FarmSafe's
  defaults (Tomato / Andhra Pradesh / Palamaner / Palamaner APMC /
  13.552040, 78.505798 / Telugu). Returns weather, market, crop-advisory,
  LLM-generated recommendation, confidence, risk level, decision and
  reasons. Returns `404` for an unsupported crop.

### Admin (requires auth, role `Admin`)
- `POST /api/admin/sync-prices` — simulates today's mandi price sync by
  applying a randomized fluctuation to the latest known price per
  (state, district, market, commodity) combination.
- `GET /api/admin/sync-status` — last sync timestamp, records added, and
  total record count.

## Auth header usage

```
Authorization: Bearer <token>
```

Send the `token` returned from `/api/auth/register` or `/api/auth/login`.
`/api/admin/*` additionally requires the authenticated user's `role` to be
`"Admin"`.
