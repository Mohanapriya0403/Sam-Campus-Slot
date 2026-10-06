import { useState } from 'react';
import { Palette, Globe2, Type, Bell as BellIcon, User, ShieldCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeSwitcher from '../../components/shared/ThemeSwitcher';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import FontSwitcher from '../../components/shared/FontSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../context/ToastContext';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe2 },
  { id: 'font', label: 'Font', icon: Type },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

export default function Settings() {
  const { user } = useAuth();
  const showToast = useToastContext();
  const [active, setActive] = useState('appearance');
  const [prefs, setPrefs] = useState({ bookingUpdates: true, roomChanges: true, systemAlerts: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Manage your preferences and account.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  active === s.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                <s.icon size={17} /> {s.label}
              </button>
            ))}
          </div>
        </div>

        <Card className="lg:col-span-3 p-6 sm:p-8">
          {active === 'appearance' && (
            <div>
              <h3 className="font-display font-semibold mb-1">Appearance</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">Choose how Sam Campus Slot looks on your device.</p>
              <ThemeSwitcher />
            </div>
          )}
          {active === 'language' && (
            <div>
              <h3 className="font-display font-semibold mb-1">Language</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">Select your preferred interface language.</p>
              <LanguageSwitcher />
            </div>
          )}
          {active === 'font' && (
            <div>
              <h3 className="font-display font-semibold mb-1">Font</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">Pick a typeface that's easiest for you to read.</p>
              <FontSwitcher />
            </div>
          )}
          {active === 'notifications' && (
            <div>
              <h3 className="font-display font-semibold mb-1">Notification Preferences</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">Choose what you'd like to be notified about.</p>
              <div className="space-y-3">
                {[
                  { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Confirmations, changes, and cancellations.' },
                  { key: 'roomChanges', label: 'Room Changes', desc: 'When your venue changes at short notice.' },
                  { key: 'systemAlerts', label: 'System Alerts', desc: 'Maintenance and platform announcements.' },
                ].map((p) => (
                  <label key={p.key} className="flex items-center justify-between p-4 rounded-xl border border-ink-100 dark:border-ink-700 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-ink-400">{p.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[p.key]}
                      onChange={(e) => setPrefs({ ...prefs, [p.key]: e.target.checked })}
                      className="w-5 h-5 rounded accent-brand-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
          {active === 'account' && (
            <div>
              <h3 className="font-display font-semibold mb-1">Account</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">Your profile information.</p>
              <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
                <Input label="Full Name" defaultValue={user?.name} />
                <Input label="Email" defaultValue={user?.email} disabled />
                <Input label="Department" defaultValue={user?.department} />
                <Input label="Role" defaultValue={user?.role} disabled className="capitalize" />
              </div>
              <Button className="mt-5" onClick={() => showToast('Profile updated.', 'success')}>Save Changes</Button>
            </div>
          )}
          {active === 'security' && (
            <div>
              <h3 className="font-display font-semibold mb-1">Security</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">Manage your password and account security.</p>
              <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
              </div>
              <Button className="mt-5" onClick={() => showToast('Password updated.', 'success')}>Update Password</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
