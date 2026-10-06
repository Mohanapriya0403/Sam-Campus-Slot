import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const OPTIONS = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'system', icon: Monitor, label: 'System' },
];

export default function ThemeSwitcher({ compact = false }) {
  const { mode, setMode } = useTheme();

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-xl bg-ink-100 dark:bg-ink-800">
        {OPTIONS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            aria-label={`Switch to ${id} mode`}
            aria-pressed={mode === id}
            className={`p-1.5 rounded-lg transition-colors ${mode === id ? 'bg-white dark:bg-ink-700 shadow-soft text-brand-600' : 'text-ink-400 hover:text-ink-600'}`}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setMode(id)}
          aria-pressed={mode === id}
          className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
            mode === id ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-600' : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-brand-300'
          }`}
        >
          <Icon size={20} />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
