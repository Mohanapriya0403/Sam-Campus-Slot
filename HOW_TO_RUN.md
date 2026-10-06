# How to Run SAM Campus Slot

Follow these quick steps to set up, seed, and run the full-stack application on your machine.

---

## Prerequisites

- **Node.js** (v18 or higher): Verify with `node -v`
- **npm** (v9 or higher): Verify with `npm -v`
- **MongoDB**: Verify local service is running on `mongodb://localhost:27017` or provide your MongoDB Atlas URI in `server/.env`.

---

## Quick Setup & Execution

### 1. Database Setup & Seeding

Open a terminal and navigate to the `server/` directory:

```bash
cd server
npm install
npm run db:seed
```

This will connect to MongoDB, seed the 5 core demo accounts (passwords securely hashed with bcrypt), 61 classrooms, and 1,067 timetable slots across CSE, IT, AI&DS, MECH, and ECE.

---

### 2. Start the Backend API Server

From the `server/` directory:

```bash
npm run dev
```

The Express API server will start on **`http://localhost:4000`**.

---

### 3. Start the Frontend Client

Open a **second terminal** and navigate to the root directory (`sam-campus-slot/`):

```bash
npm install
npm run dev
```

The Vite frontend development server will launch on **`http://localhost:5173`**.

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## Demo Accounts (Unified Single Login)

The login screen automatically detects the user's role from their email or ID and redirects them to their respective dashboard:

| Role | Email / ID | Password | Destination Portal |
|---|---|---|---|
| **Administrator** | `admin@sam.edu` | `admin123` | `/admin/dashboard` |
| **Academic Coordinator** | `coordinator@sam.edu` | `coordinator123` | `/admin/dashboard` |
| **Faculty (CSE)** | `faculty@sam.edu` *(or `arjun-cse`)* | `faculty123` | `/faculty/dashboard` |
| **Faculty (MECH)** | `lakshmi.narayanan@sam.edu` | `faculty123` | `/faculty/dashboard` |
| **Student (CSE)** | `student@sam.edu` *(or `2115001`)* | `student123` | `/student/dashboard` |

> **Note**: Institutional emails ending in `@nec.edu.in` (such as `2115001@nec.edu.in` or `arjun-cse@nec.edu.in`) are also recognized automatically.

---

## Key Features & URL Routes

- **Landing Page**: `http://localhost:5173/`
- **Unified Login**: `http://localhost:5173/login`
- **Student Dashboard**: `http://localhost:5173/student/dashboard`
- **Student Timetable (Department & Year switcher)**: `http://localhost:5173/student/timetable`
- **Student Venue Tracker**: `http://localhost:5173/student/venue`
- **Faculty Teaching Schedule**: `http://localhost:5173/faculty/timetable`
- **Faculty Smart Allocation Engine**: `http://localhost:5173/faculty/allocation`
- **Admin Live Analytics**: `http://localhost:5173/admin/dashboard`
- **Admin Master Venue Matrix (22 venues × 7 periods)**: `http://localhost:5173/admin/timetable`
- **Admin User Directory (Student / Faculty / Admin filters)**: `http://localhost:5173/admin/users`
- **AI Campus Assistant**: Accessible via the chat bubble widget on the bottom right.

---

## Running Verification Tests

To verify backend APIs and the second-year departmental timetables:

```bash
# In server or root directory with Node:
node test_endpoints.js
node test_year2_timetables.js
```
