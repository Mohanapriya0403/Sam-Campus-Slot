import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Info } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ThemeSwitcher from '../../components/shared/ThemeSwitcher';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import GoogleSignInButton from '../../components/shared/GoogleSignInButton';
import CompleteProfileModal from '../../components/shared/CompleteProfileModal';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../context/ToastContext';

const TEST_ACCOUNTS = [
  { label: 'Student (CSE)', email: 'student@sam.edu', password: 'student123', role: 'student' },
  { label: 'Faculty (CSE)', email: 'faculty@sam.edu', password: 'faculty123', role: 'faculty' },
  { label: 'Faculty (MECH)', email: 'lakshmi.narayanan@sam.edu', password: 'faculty123', role: 'faculty' },
  { label: 'Admin (General)', email: 'admin@sam.edu', password: 'admin123', role: 'admin' },
  { label: 'Academic Coordinator', email: 'coordinator@sam.edu', password: 'coordinator123', role: 'admin' },
];

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const showToast = useToastContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: 'student@sam.edu', password: 'student123' });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingProfile, setPendingProfile] = useState(false);

  const selectTestAccount = (acc) => {
    setForm({ email: acc.email, password: acc.password });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = form.email.trim();
    const isEmail = /^\S+@\S+\.\S+$/.test(cleanEmail);
    const isStaffOrRegNo = /^[a-zA-Z0-9_.-]{3,35}$/.test(cleanEmail);
    const errs = {};
    if (!isEmail && !isStaffOrRegNo) {
      errs.email = 'Enter a valid email, register number, or staff ID (e.g. arjun-cse or 2115001).';
    }
    if (!form.password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const loginIdentifier = isEmail ? cleanEmail : `${cleanEmail}@nec.edu.in`;
    const result = await login(loginIdentifier, form.password);
    setLoading(false);

    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }

    const roleName =
      result.user.role === 'admin' ? 'Administrator'
      : result.user.role === 'faculty' ? 'Faculty'
      : 'Student';

    showToast(`Welcome back, ${result.user.name?.trim()} (${roleName})!`, 'success');
    navigate(`/${result.user.role}/dashboard`);
  };

  const handleGoogleCredential = async (credential) => {
    const result = await loginWithGoogle(credential);
    if (!result.ok) {
      showToast(result.error, 'error');
      return result;
    }
    if (result.needsProfile) {
      setPendingProfile(true);
      return result;
    }
    const roleName =
      result.user.role === 'admin' ? 'Administrator'
      : result.user.role === 'faculty' ? 'Faculty'
      : 'Student';
    showToast(`Welcome, ${result.user.name?.trim()} (${roleName})!`, 'success');
    navigate(`/${result.user.role}/dashboard`);
    return result;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12 slot-grid-bg relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
        <LanguageSwitcher compact />
        <ThemeSwitcher compact />
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <Card glass className="p-8">
          <h1 className="font-display text-2xl font-bold text-center mb-1.5">Welcome back</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 text-center mb-6">
            Sign in to access your campus dashboard and schedule.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email / Staff ID / Register Number"
              icon={Mail}
              type="text"
              placeholder="e.g. user@sam.edu, arjun-cse, 2115001"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-500 dark:text-ink-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded accent-brand-600"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => showToast('Password reset link sent (demo).', 'info')}
                className="text-brand-600 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" icon={LogIn} loading={loading}>
              Log In
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800" />
            <span className="text-xs text-ink-400 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800" />
          </div>
          <GoogleSignInButton onCredential={handleGoogleCredential} text="signin_with" />

          <div className="mt-6 p-3.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-xs text-ink-500 dark:text-ink-400">
            <p className="flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-300">
              <Info size={13} /> Demo Accounts (Click to test):
            </p>
            <div className="grid grid-cols-1 gap-1.5 mt-2">
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  type="button"
                  key={acc.email}
                  onClick={() => selectTestAccount(acc)}
                  className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors flex items-center justify-between ${
                    form.email === acc.email
                      ? 'border-brand-500 bg-white dark:bg-ink-800 font-semibold text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'border-brand-200/60 dark:border-brand-900/40 hover:bg-white/60 dark:hover:bg-ink-800/40'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                        acc.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : acc.role === 'faculty'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {acc.role.toUpperCase()}
                    </span>
                    <span>{acc.label}</span>
                  </span>
                  <span className="font-mono text-ink-400">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-400 italic">
              Your role (Student, Faculty, Admin) and department are automatically resolved from your account upon signing in.
            </p>
          </div>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </Card>
      </div>
      <CompleteProfileModal open={pendingProfile} onDone={() => navigate('/student/dashboard')} />
    </div>
  );
}
