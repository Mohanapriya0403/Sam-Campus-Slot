import { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext(null);

const FONTS = [
  { id: 'inter', label: 'Inter', className: 'font-inter' },
  { id: 'poppins', label: 'Poppins', className: 'font-poppins' },
  { id: 'roboto', label: 'Roboto', className: 'font-roboto' },
  { id: 'manrope', label: 'Manrope', className: 'font-manrope' },
];

export function ThemeProvider({ children }) {
  const [mode, setMode] = useLocalStorage('sam-campus-slot-theme', 'system'); // light | dark | system
  const [fontId, setFontId] = useLocalStorage('scs-font', 'inter');

  const resolvedDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedDark);
  }, [resolvedDark]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => document.documentElement.classList.toggle('dark', mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  useEffect(() => {
    // Applied to <html> (not <body>) so it matches the anti-flash inline script in
    // index.html, which sets this class before body even exists.
    const font = FONTS.find((f) => f.id === fontId) || FONTS[0];
    const root = document.documentElement;
    FONTS.forEach((f) => root.classList.remove(f.className));
    root.classList.add(font.className);
  }, [fontId]);

  const cycleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, setMode, cycleMode, isDark: resolvedDark, fontId, setFontId, FONTS }),
    [mode, setMode, cycleMode, resolvedDark, fontId, setFontId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
