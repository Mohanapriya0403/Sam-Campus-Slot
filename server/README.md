# Sam Campus Slot — API server

Node.js + Express + MongoDB (Mongoose) backend for Sam Campus Slot.

## Setup

```bash
cp .env.example .env    # edit MONGODB_URI to match your local/Atlas MongoDB
npm install
npm run db:setup        # seed real data (creates collections/documents on first insert)
npm run dev              # http://localhost:4000, auto-restarts on file changes
```

MongoDB has no schema-creation step — collections and indexes are created
automatically the first time a document is written, based on the Mongoose
models in `src/models/`. `npm run db:setup` (alias for `db:seed`) populates
the database from `seed-data/*.js` — verbatim copies of the frontend's real
data files. Re-run `npm run db:seed` any time to reset to a clean state; it
clears every collection first.

You'll need a MongoDB server to point at — either install MongoDB locally
(https://www.mongodb.com/docs/manual/installation/) or use a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its
connection string into `MONGODB_URI`.

## Environment variables (`.env`)

| Variable | Meaning |
|---|---|
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `PORT` | Port the API listens on (default 4000) |
| `CORS_ORIGIN` | Allowed origin for the frontend (default `http://localhost:5173`) |
| `JWT_SECRET` | Signing secret for auth tokens — change this for anything beyond local dev |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `ANTHROPIC_API_KEY` | Enables the AI Campus Assistant chatbot (`/api/chatbot`). Get one from https://console.anthropic.com. Without it, the chatbot endpoint returns a friendly 503 and the frontend widget shows a "not configured" state. |
| `ANTHROPIC_MODEL` | Model id for the chatbot (default `claude-sonnet-5`) |

## Data model

See `src/models/*.js` for full field definitions. Summary:

- `User` — accounts, bcrypt password hashes, role (student/faculty/admin)
- `Classroom` — one document per room; `facilities` is an array of strings
- `TimetableSlot` — one document per (department, year, batch, day, period) —
  the flattened weekly grid every student/faculty page reads from
- `DepartmentYear` — which batches exist for a department + year, and the
  semester label
- `Booking` — faculty room bookings, with a status of upcoming/completed/cancelled
- `BlockedSlot` — manually-held room/time ranges outside formal bookings
- `Notification`, `VenueChangeNotice` — department-scoped notices
- `AnalyticsCache` — presentation-ready sample analytics payloads (one document per metric)

Custom, human-readable ids (e.g. `"F12"`, `"BK-1735689600000"`, `"u1"`) are
stored directly as each document's `_id` instead of using MongoDB's default
ObjectId, so ids stay stable across reseeds and match what the frontend
already expects.

## API reference

All routes are prefixed `/api`. Routes marked 🔒 require `Authorization: Bearer <token>`;
🔒admin/🔒faculty require that specific role.

### Auth
- `POST /auth/login` `{ email, password, department?, year? }` → `{ token, user }`
- `POST /auth/register` `{ name, email, password, role, department?, year? }` → `{ token, user }`
- `POST /auth/google` `{ credential }` → `{ token, user, needsProfile }` — Google OAuth
  sign-in/sign-up. `credential` is the ID token from Google Identity Services
  (client-side); verified server-side with `google-auth-library` against
  `GOOGLE_CLIENT_ID`. A brand-new account is created as `student` with no
  department/year — `needsProfile: true` tells the frontend to prompt for
  those once (see `PATCH /users/me` below). Requires `GOOGLE_CLIENT_ID`.
- `GET /auth/me` 🔒 → `{ user }`

### Timetable (all public — no login needed to check what's available)
- `GET /timetable/available` → `[{ department, year }]`
- `GET /timetable/meta?department=&year=` → `{ semester, batches }`
- `GET /timetable?department=&year=&batch=` → `{ Monday: [slot, ...], ... }` or 404

### Classrooms
- `GET /classrooms?department=` → room list
- `GET /classrooms/grouped?department=` → `[{ id, label, rooms }]`, grouped by floor/type
- `POST /classrooms` 🔒admin → create a room
- `PATCH /classrooms/:id/status` 🔒admin `{ status }` → available/occupied/maintenance

### Bookings
- `GET /bookings?facultyId=` 🔒 → that faculty member's bookings
- `GET /bookings` 🔒admin → every booking
- `GET /bookings/availability?room=&date=` 🔒 → bookings + blocked slots for one room/date
- `GET /bookings/day?date=` 🔒 → bookings + blocked slots across ALL rooms for one date
  (used by Smart Allocation to score many rooms without an N+1 request)
- `POST /bookings` 🔒faculty/admin `{ room, date, start, end, purpose }` → 201, or 409 on conflict
- `PATCH /bookings/:id/cancel` 🔒 → cancel (owner or admin only)

### Notifications
- `GET /notifications?department=` 🔒 → department's notices + any campus-wide one
- `PATCH /notifications/:id/read` 🔒
- `GET /notifications/venue-change?department=` 🔒

### Analytics
- `GET /analytics` 🔒admin → every chart's data, one payload

### Users
- `GET /users` 🔒admin → every account (no password hashes)
- `PATCH /users/me` 🔒 `{ department, year? }` → `{ token, user }` — lets the
  signed-in user set their own department/year. Currently only reachable
  right after a first Google sign-in (see `CompleteProfileModal.jsx`); reissues
  the JWT so its embedded fields stay in sync.

### Chatbot
- `POST /chatbot/message` 🔒 `{ message, history? }` → `{ reply }` — the AI Campus
  Assistant. `history` is the trailing conversation (`[{ role: 'user'|'assistant', content }]`),
  sent back by the frontend each turn since the server keeps no chat state.
  The system prompt is grounded in the signed-in user's own department: live
  classroom availability counts, recent notifications, and any active venue-change
  notice — never another department's data. Requires `ANTHROPIC_API_KEY`.

### Recently Accessed
- `POST /recent` 🔒 `{ roomId }` → records that the signed-in user just opened
  that room's details (upserted per user+room, so re-viewing just bumps the
  timestamp instead of piling up duplicates).
- `GET /recent` 🔒 → the user's last 8 viewed rooms, most recent first, each
  re-joined live against the current `Classroom` doc (status/capacity always
  current, never a stale snapshot from when it was viewed).
- `DELETE /recent` 🔒 → clears the signed-in user's whole history.

## Notes on scope

- Booking conflict detection checks the *same room* for *overlapping bookings
  or blocked slots* — it does not attempt to fuzzy-match a booking against
  `TimetableSlot`'s free-text venue field, since venues there aren't always a
  clean 1:1 room-ID match (e.g. combined labels like `"F12 (L3)"`).
- Analytics figures are stored as-is (`AnalyticsCache`), not recomputed from
  live booking volume — same as the original frontend mock, just DB-backed
  instead of hardcoded in a JS file.
