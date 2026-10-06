import { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { login as apiLogin, register as apiRegister, fetchMe, logoutApi, loginWithGoogle as apiLoginWithGoogle, completeProfile as apiCompleteProfile } from '../api/auth';
import { getToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('sam-campus-slot-user', null);
  // Whether we've finished checking a persisted token against the backend —
  // pages that gate on `isAuthenticated` should wait for this before
  // redirecting to /login, or a valid session gets bounced on refresh.
  const [checkingSession, setCheckingSession] = useState(true);

  // On load, if a token is cached, confirm it's still valid (and pick up any
  // server-side changes to the account) rather than trusting the locally
  // cached user forever. An expired/invalid token logs the session out.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }
    fetchMe()
      .then((fresh) => setUser((prev) => (prev ? { ...prev, ...fresh } : fresh)))
      .catch(() => {
        logoutApi();
        setUser(null);
      })
      .finally(() => setCheckingSession(false));
    // Only ever run once on mount — this isn't meant to re-run on user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `academic` carries only what that role's login form actually asks for:
  //   student -> { department, year }
  //   faculty -> { department }        (no year — faculty aren't tied to one)
  //   admin   -> {}                    (neither — admin oversees everything)
  // Batch is never part of this at all: a student's batch can change per
  // project/course/lab, so it's chosen as a filter on the timetable page
  // itself (see MyTimetable / StudentDashboard), never stored on the account.
  const login = useCallback(
    async (email, password, academic = {}) => {
      try {
        const loggedIn = await apiLogin(email, password, academic);
        setUser(loggedIn);
        return { ok: true, user: loggedIn };
      } catch (err) {
        return { ok: false, error: err.message || 'Invalid email or password.' };
      }
    },
    [setUser]
  );

  const register = useCallback(
    async ({ name, email, password, department, role, year }) => {
      try {
        const created = await apiRegister({ name, email, password, department, role, year });
        setUser(created);
        return { ok: true, user: created };
      } catch (err) {
        return { ok: false, error: err.message || 'Could not create that account.' };
      }
    },
    [setUser]
  );

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, [setUser]);

  // Signs in (or silently creates a 'student' account for) a Google account.
  // `needsProfile` tells Login.jsx whether to show the one-time
  // department/year prompt right after this resolves.
  const loginWithGoogle = useCallback(
    async (credential) => {
      try {
        const { user: signedIn, needsProfile } = await apiLoginWithGoogle(credential);
        setUser(signedIn);
        return { ok: true, user: signedIn, needsProfile };
      } catch (err) {
        return { ok: false, error: err.message || 'Google sign-in failed.' };
      }
    },
    [setUser]
  );

  // Fills in department/year for an account that doesn't have them yet
  // (currently only reachable right after a first Google sign-in).
  const completeProfile = useCallback(
    async ({ department, year }) => {
      try {
        const updated = await apiCompleteProfile({ department, year });
        setUser((prev) => (prev ? { ...prev, ...updated } : updated));
        return { ok: true, user: updated };
      } catch (err) {
        return { ok: false, error: err.message || 'Could not save that.' };
      }
    },
    [setUser]
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, checkingSession, login, register, logout, loginWithGoogle, completeProfile }),
    [user, checkingSession, login, register, logout, loginWithGoogle, completeProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
