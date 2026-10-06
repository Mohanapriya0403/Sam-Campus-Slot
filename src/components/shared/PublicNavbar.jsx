import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useLanguage } from '../../context/LanguageContext';

// Every top-level nav link now routes somewhere real — Features and How It
// Works got their own pages instead of staying inert labels.
const LINKS = [
  { to: '/', key: 'nav_home' },
  { to: '/about', key: 'nav_about' },
  { to: '/features', key: 'nav_features' },
  { to: '/how-it-works', key: 'nav_how' },
];

export default function PublicNavbar({ dark = false }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = dark && !scrolled;
  const textCls = solid ? 'text-white/80 hover:text-white' : 'text-ink-600 dark:text-ink-300 hover:text-brand-600';
  const barCls = solid ? 'bg-transparent' : scrolled ? 'glass shadow-soft' : 'bg-transparent';

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${barCls}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
        <Link to="/"><Logo size="sm" light={solid} /></Link>

        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <NavLink key={l.key} to={l.to} className={`text-sm font-medium transition-colors ${textCls}`}>
              {t(l.key)}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className={solid ? 'text-white/80' : ''}><LanguageSwitcher compact /></span>
          <span className={solid ? 'text-white/80' : ''}><ThemeSwitcher compact /></span>
          <Link to="/login" className={`text-sm font-medium ${textCls}`}>{t('nav_login')}</Link>
          <Link to="/register"><Button size="sm" variant="primary">{t('nav_getstarted')}</Button></Link>
        </div>

        <button className={`lg:hidden p-2 rounded-lg ${solid ? 'text-white' : ''} hover:bg-ink-100 dark:hover:bg-ink-800`} onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className={`lg:hidden px-5 pb-5 flex flex-col gap-4 ${solid ? 'bg-forest-900/95' : 'glass'}`}>
          {LINKS.map((l) => (
            <NavLink key={l.key} to={l.to} onClick={() => setOpen(false)} className={`text-sm font-medium ${textCls}`}>
              {t(l.key)}
            </NavLink>
          ))}
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <ThemeSwitcher compact />
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">{t('nav_login')}</Button></Link>
            <Link to="/register" className="flex-1"><Button className="w-full">{t('nav_getstarted')}</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
