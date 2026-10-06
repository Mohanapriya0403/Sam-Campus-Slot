import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ThemeSwitcher from '../../components/shared/ThemeSwitcher';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import GoogleSignInButton from '../../components/shared/GoogleSignInButton';
import CompleteProfileModal from '../../components/shared/CompleteProfileModal';
import { DEPARTMENTS } from '../../data/classrooms';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../context/ToastContext';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const showToast = useToastContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', department: 'CSE', role: 'faculty' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingProfile, setPendingProfile] = useState(false);

  const handleGoogleCredential = async (credential) => {
    const result = await loginWithGoogle(credential);
    if (!result.ok) {
      showToast(result.error, 'error');
      return result;
    }
    if (result.needsProfile) {
      setPendingProfile(true); // collect department/year below before going anywhere
      return result;
    }
    showToast(`Welcome, ${result.user.name?.trim()}!`, 'success');
    navigate(`/${result.user.role}/dashboard`);
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (form.password.length < 6) errs.password = 'At least 6 characters.';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }
    showToast(`Account created. Welcome, ${form.name.trim()}!`, 'success');
    navigate(`/${result.user.role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12 slot-grid-bg relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
        <LanguageSwitcher compact />
        <ThemeSwitcher compact />
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Link to="/"><Logo /></Link></div>
        <Card glass className="p-8">
          <h1 className="font-display text-2xl font-bold text-center mb-1.5">Create your account</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 text-center mb-6">Set up your Sam Campus Slot access.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input label="Full Name" icon={User} placeholder="Dr. Arjun Kumar" value={form.name} error={errors.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" icon={Mail} type="email" placeholder="you@sam.edu" value={form.email} error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Password" icon={Lock} type="password" value={form.password} error={errors.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Input label="Confirm Password" icon={Lock} type="password" value={form.confirm} error={errors.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <Button type="submit" className="w-full" icon={UserPlus} loading={loading}>Create Account</Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800" />
            <span className="text-xs text-ink-400 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800" />
          </div>
          <GoogleSignInButton onCredential={handleGoogleCredential} text="signup_with" />

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
            Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link>
          </p>
        </Card>
      </div>
      <CompleteProfileModal open={pendingProfile} onDone={() => navigate('/student/dashboard')} />
    </div>
  );
}
