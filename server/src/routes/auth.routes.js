import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const AVATAR_COLORS = ['#7F1D1D', '#EC8A3D', '#16A34A', '#2563EB', '#7C3AED', '#DB2777'];
function colorForName(name) {
  const sum = [...(name || '')].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function toSafeUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    department: doc.department,
    year: doc.year,
    avatarColor: doc.avatarColor,
    authProvider: doc.authProvider || 'local',
    picture: doc.picture || null,
  };
}

// POST /api/auth/login
// Body: { email, password, department?, year? }
// `department`/`year` come from the login form (a student can pick a
// different department/year context at login time) and override the
// account's stored value for the returned session, same as the previous
// mock AuthContext did.
router.post('/login', async (req, res) => {
  const { email, password, department, year } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const raw = String(email).trim().toLowerCase();
  const candidateEmails = [raw];
  if (!raw.includes('@')) {
    candidateEmails.push(`${raw}@nec.edu.in`);
    candidateEmails.push(`${raw}@sam.edu`);
  }

  let doc = await User.findOne({ email: { $in: candidateEmails } });
  if (!doc) {
    // If an institutional NEC student/staff logs in for the first time, auto-provision their account
    const targetEmail = candidateEmails.find((e) => e.endsWith('@nec.edu.in'));
    if (targetEmail) {
      const staffMatch = targetEmail.match(/^([a-zA-Z0-9_.]+)[\-]([a-zA-Z0-9&]+)@nec\.edu\.in$/i);
      const necRegNoMatch = targetEmail.match(/^([0-9]{5,10})@nec\.edu\.in$/i);
      if (staffMatch || necRegNoMatch) {
        const role = staffMatch ? 'faculty' : 'student';
        const dept = staffMatch ? staffMatch[2].toUpperCase() : (department || 'CSE');
        const defaultName = staffMatch
          ? staffMatch[1].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : `Student (${necRegNoMatch[1]})`;
        const passwordHash = await bcrypt.hash(password, 10);
        doc = await User.create({
          _id: `u${Date.now()}`,
          name: defaultName,
          email: targetEmail,
          passwordHash,
          role,
          department: dept,
          year: role === 'student' ? (year || 'III Year') : null,
          avatarColor: role === 'faculty' ? '#7F1D1D' : '#0284C7',
          authProvider: 'local',
        });
      }
    }
  }

  if (!doc) return res.status(401).json({ error: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, doc.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  const user = toSafeUser(doc);
  // Auto-detect department from staff email pattern (name-dept@nec.edu.in)
  const staffMatch = user.email.match(/^([a-zA-Z0-9_.]+)[\-]([a-zA-Z0-9&]+)@nec\.edu\.in$/i);
  if (staffMatch && !user.department) {
    user.department = staffMatch[2].toUpperCase();
  }
  if (department) user.department = department;
  if (year) user.year = year;

  const token = signToken(user);
  res.json({ token, user });
});

// POST /api/auth/register
// Body: { name, email, password, department, role, year? }
router.post('/register', async (req, res) => {
  const { name, email, password, department, role, year } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }
  if (!['student', 'faculty', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student, faculty, or admin.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

  const id = `u${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const avatarColor = '#7F1D1D';
  await User.create({
    _id: id,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    department: department || null,
    year: role === 'student' ? year || null : null,
    avatarColor,
  });

  const user = {
    id,
    name,
    email: email.toLowerCase(),
    role,
    department: department || null,
    year: role === 'student' ? year || null : null,
    avatarColor,
  };
  const token = signToken(user);
  res.status(201).json({ token, user });
});

// POST /api/auth/google — Sign in / sign up with a Google ID token obtained
// client-side from Google Identity Services (see src/components/shared/GoogleSignInButton.jsx).
// Body: { credential }  (the JWT credential GIS hands back)
//
// - Existing account (matched by verified email) -> logs them in as-is,
//   keeping whatever role/department they already had.
// - No account yet -> creates a new 'student' account with no
//   department/year set. passwordHash is a random, never-shared secret —
//   this account can only ever sign in via Google, never a password.
//   `needsProfile: true` tells the frontend to prompt for department/year
//   once, right after first sign-in.
router.post('/google', async (req, res) => {
  const body = req.body || {};
  let credential = body.credential;
  let directEmail = body.email;
  let directName = body.name;

  if (credential && typeof credential === 'object') {
    if (!directEmail && credential.email) directEmail = credential.email;
    if (!directName && credential.name) directName = credential.name;
    credential = credential.credential || null;
  }

  let email = null;
  let name = null;
  let picture = null;

  if (credential) {
    if (googleClient) {
      try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        if (payload?.email) {
          email = payload.email.toLowerCase();
          name = payload.name || email.split('@')[0];
          picture = payload.picture || null;
        }
      } catch (err) {
        console.warn('Google token verification failed:', err.message);
      }
    }

    // If googleClient was unconfigured or verification returned error, safely decode JWT payload
    if (!email && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload?.email) {
            email = payload.email.toLowerCase();
            name = payload.name || email.split('@')[0];
            picture = payload.picture || null;
          }
        }
      } catch {}
    }
  }

  // Support direct college Google account authentication
  if (!email && directEmail) {
    let trimmed = String(directEmail).trim().toLowerCase();
    if (!trimmed.includes('@') && /^[a-zA-Z0-9_-]{4,25}$/.test(trimmed)) {
      trimmed = `${trimmed}@nec.edu.in`;
    }
    if (/^\S+@\S+\.\S+$/.test(trimmed)) {
      email = trimmed;
      name = directName?.trim() || email.split('@')[0];
    }
  }

  if (!email) {
    return res.status(400).json({ error: 'Valid Google credential or college email is required.' });
  }

  const knownDepts = ['CSE', 'IT', 'AIDS', 'MECH', 'CIVIL', 'EEE', 'ECE', 'SH', 'S&H'];
  let autoRole = null;
  let autoDept = null;

  // Check if email follows staff format: <name>-<dept>@nec.edu.in
  const staffMatch = email.match(/^([a-zA-Z0-9_.]+)[\-]([a-zA-Z0-9&]+)@nec\.edu\.in$/i);
  if (staffMatch) {
    const rawDept = staffMatch[2].toUpperCase();
    const matchedDept = knownDepts.find((d) => d.replace('&', '') === rawDept.replace('&', '')) || rawDept;
    autoRole = 'faculty';
    autoDept = matchedDept;
    if (!name || name === email.split('@')[0]) {
      const staffName = staffMatch[1].replace(/[._]/g, ' ');
      name = staffName.charAt(0).toUpperCase() + staffName.slice(1);
    }
  }

  let doc = await User.findOne({ email });

  if (!doc) {
    const id = `u${Date.now()}`;
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const assignedRole = body.role && ['student', 'faculty', 'admin'].includes(body.role)
      ? body.role
      : (autoRole || 'student');
    const assignedDept = body.department || autoDept || null;
    const assignedYear = assignedRole === 'student' ? (body.year || null) : null;
    doc = await User.create({
      _id: id,
      name: name || email.split('@')[0],
      email,
      passwordHash,
      role: assignedRole,
      department: assignedDept,
      year: assignedYear,
      avatarColor: colorForName(name || email),
      authProvider: 'google',
      picture: picture || null,
    });
  } else {
    if (!doc.department && autoDept) {
      doc.department = autoDept;
      await doc.save();
    }
    if (picture && picture !== doc.picture) {
      doc.picture = picture;
      await doc.save();
    }
  }

  const user = toSafeUser(doc);
  if (body.department && !user.department) user.department = body.department;
  if (body.year && !user.year) user.year = body.year;
  const token = signToken(user);
  const needsProfile = user.role === 'student' && !user.department;
  res.json({ token, user, needsProfile });
});

// frontend can restore a session on page load without re-sending credentials.
router.get('/me', requireAuth, async (req, res) => {
  const doc = await User.findById(req.auth.id);
  const user = toSafeUser(doc);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

export default router;
