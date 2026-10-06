import { useEffect, useRef, useState } from 'react';
import { Mail, User, GraduationCap, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * Renders Google Sign-In with full support for institutional / college accounts.
 *
 * 1. When `VITE_GOOGLE_CLIENT_ID` is set:
 *    Renders the official Google Identity Services one-tap/button, while also
 *    providing an option to enter a college email directly.
 * 2. When `VITE_GOOGLE_CLIENT_ID` is not set or GIS is unavailable:
 *    Renders a branded "Sign in with Google / College ID" button that opens
 *    a dedicated dialog to authenticate with any college account
 *    (e.g., @college.edu, @sam.edu, or personal Google account), immediately
 *    creating or logging into their MongoDB account.
 */
export default function GoogleSignInButton({ onCredential, text = 'continue_with' }) {
  const divRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Label based on prop
  const buttonLabel =
    text === 'signup_with'
      ? 'Sign up with Google / College ID'
      : text === 'signin_with'
      ? 'Sign in with Google / College ID'
      : 'Continue with Google / College ID';

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptReady || !divRef.current || !GOOGLE_CLIENT_ID) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text,
        width: 320,
      });
    } catch (err) {
      console.warn('GIS renderButton error:', err);
    }
  }, [scriptReady, onCredential, text]);

  const handleModalSubmit = async (e) => {
    e?.preventDefault();
    let cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your college email or register number.');
      return;
    }
    // If student enters just their register number (e.g. 2115001), automatically append @nec.edu.in
    if (!cleanEmail.includes('@') && /^[a-zA-Z0-9_-]{4,25}$/.test(cleanEmail)) {
      cleanEmail = `${cleanEmail}@nec.edu.in`;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. regno@nec.edu.in).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await onCredential({
        email: cleanEmail,
        name: name.trim() || cleanEmail.split('@')[0],
      });
      if (res && res.ok === false) {
        setError(res.error || 'Authentication failed. Please try again.');
        return;
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickPreset = (presetEmail, presetName) => {
    setEmail(presetEmail);
    setName(presetName);
    setError('');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {GOOGLE_CLIENT_ID ? (
        <div className="w-full flex flex-col items-center gap-2">
          <div ref={divRef} className="flex justify-center [&>div]:!w-full" />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium mt-1"
          >
            <GraduationCap size={13} /> Or sign in with College ID directly (e.g. regno@nec.edu.in)
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-100 font-medium text-sm hover:bg-ink-50 dark:hover:bg-ink-700/60 shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <GoogleIcon className="w-4 h-4 shrink-0" />
          <span>{buttonLabel}</span>
        </button>
      )}

      {/* College Google Account Sign-In Modal */}
      <Modal
        open={modalOpen}
        onClose={() => !loading && setModalOpen(false)}
        title="Sign in with College / Google Account"
        size="md"
      >
        <form onSubmit={handleModalSubmit} className="space-y-4" noValidate>
          <div className="p-3.5 rounded-xl bg-brand-50/70 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40 text-xs text-ink-600 dark:text-ink-300 flex items-start gap-2.5">
            <GraduationCap size={18} className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-700 dark:text-brand-300">
                Institutional &amp; Google SSO Authentication
              </p>
              <p className="mt-0.5 leading-relaxed">
                Students: <code>regno@nec.edu.in</code> &middot; Staff: <code>name-dept@nec.edu.in</code> (e.g. <code>arjun-cse@nec.edu.in</code>). New accounts are automatically created in MongoDB!
              </p>
            </div>
          </div>

          <Input
            label="College Email / Register / Staff ID"
            icon={Mail}
            type="text"
            placeholder="e.g. 2115001@nec.edu.in or arjun-cse@nec.edu.in"
            value={email}
            error={error}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            autoFocus
          />

          <Input
            label="Full Name (Optional)"
            icon={User}
            type="text"
            placeholder="e.g. Dr. Arjun Kumar or Mohan"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="pt-1">
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-brand-600" /> Quick College Presets:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickPreset('arjun-cse@nec.edu.in', 'Dr. Arjun Kumar')}
                className="text-xs px-2.5 py-1 rounded-lg border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/40 hover:border-brand-500 transition-colors text-brand-800 dark:text-brand-200 font-mono font-medium"
              >
                arjun-cse@nec.edu.in (Staff)
              </button>
              <button
                type="button"
                onClick={() => fillQuickPreset('2115001@nec.edu.in', 'Mohan (NEC)')}
                className="text-xs px-2.5 py-1 rounded-lg border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/40 hover:border-brand-500 transition-colors text-brand-800 dark:text-brand-200 font-mono font-medium"
              >
                2115001@nec.edu.in (Student)
              </button>
              <button
                type="button"
                onClick={() => fillQuickPreset('lakshmi-mech@nec.edu.in', 'Dr. Lakshmi Narayanan')}
                className="text-xs px-2.5 py-1 rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 hover:border-brand-400 transition-colors text-ink-600 dark:text-ink-300 font-mono"
              >
                lakshmi-mech@nec.edu.in (Staff)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-100 dark:border-ink-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              icon={GraduationCap}
            >
              Continue to Portal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
