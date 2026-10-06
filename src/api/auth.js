import { api, setToken } from './client';

export async function login(email, password, academic = {}) {
  const data = await api.post('/auth/login', { email, password, ...academic }, { auth: false });
  setToken(data.token);
  return data.user;
}

export async function register({ name, email, password, department, role, year }) {
  const data = await api.post('/auth/register', { name, email, password, department, role, year }, { auth: false });
  setToken(data.token);
  return data.user;
}

// Exchanges a Google Identity Services ID token credential OR college Google account for a session.
// `needsProfile` comes back true for a brand-new account that still needs
// department/year filled in (see AuthContext.completeProfile).
export async function loginWithGoogle(param) {
  const body = typeof param === 'string' ? { credential: param } : { ...param };
  const data = await api.post('/auth/google', body, { auth: false });
  setToken(data.token);
  return { user: data.user, needsProfile: !!data.needsProfile };
}

export async function completeProfile({ department, year }) {
  const data = await api.patch('/users/me', { department, year });
  setToken(data.token);
  return data.user;
}

export async function fetchMe() {
  const data = await api.get('/auth/me');
  return data.user;
}

export function logoutApi() {
  setToken(null);
}
