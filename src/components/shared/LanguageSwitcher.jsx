import { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, LANGUAGES } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!compact) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`py-3 rounded-xl border text-sm font-medium transition-all ${
              lang === l.code ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-600' : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-brand-300'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 p-2 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
      >
        <Languages size={17} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl shadow-glow py-1.5 z-30" role="listbox">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
              role="option"
              aria-selected={lang === l.code}
            >
              {l.label}
              {lang === l.code && <Check size={14} className="text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
