import { useTheme } from '../../context/ThemeContext';

export default function FontSwitcher() {
  const { fontId, setFontId, FONTS } = useTheme();
  return (
    <div className="grid grid-cols-2 gap-3">
      {FONTS.map((f) => (
        <button
          key={f.id}
          onClick={() => setFontId(f.id)}
          className={`py-4 rounded-xl border text-left px-4 transition-all ${
            fontId === f.id ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'
          }`}
        >
          <p className={`text-lg ${f.className}`} style={{ fontFamily: f.label }}>{f.label}</p>
          <p className="text-xs text-ink-400 mt-0.5">Aa Bb Cc — 123</p>
        </button>
      ))}
    </div>
  );
}
