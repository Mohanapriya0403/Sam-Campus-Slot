import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import 'express-async-errors'; // patches Express so thrown/rejected errors in the
                                // async route handlers below reach the error handler
                                // instead of hanging the request.

import authRoutes from './routes/auth.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import classroomsRoutes from './routes/classrooms.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import usersRoutes from './routes/users.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import recentRoutes from './routes/recent.routes.js';

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/classrooms', classroomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/recent', recentRoutes);

// Centralized error handler — every route above is async, so unhandled
// rejections land here as a 500 instead of hanging the request.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
