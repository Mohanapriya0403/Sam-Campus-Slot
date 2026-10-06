import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import PublicNavbar from '../../components/shared/PublicNavbar';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

// Get Started / cover page. Deliberately minimal: identity, heading, tagline,
// two calls to action — no floating batch/venue cards or room-map widgets.
// The realistic classroom scene behind this page is the shared, global
// ClassroomBackground mounted once in MainLayout — this page does not (and
// must not) render its own background image or its own theme logic; it just
// uses the same ink/brand tokens, with dark: variants, as every other page.
export default function Landing() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen relative">
      <PublicNavbar dark={isDark} />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-24 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="w-full text-center animate-fade-up">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-ink-200 dark:border-white/15 bg-white/70 dark:bg-white/5 text-brand-700 dark:text-slot-200 text-xs font-semibold tracking-wide">
              SMART CAMPUS PLATFORM
            </span>
          </div>

          <h1 className="font-display font-bold leading-[0.95] tracking-tight text-5xl sm:text-6xl xl:text-7xl">
            <span className="text-ink-900 dark:text-white">SAM</span><br />
            <span className="text-gradient">CAMPUS</span><br />
            <span className="text-ink-900 dark:text-white">SLOT</span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl font-medium text-brand-700 dark:text-slot-100">{t('tagline')}</p>
          <p className="mt-3 text-sm sm:text-base text-ink-500 dark:text-white/50 max-w-md mx-auto">
            Intelligent classroom allocation for every batch, every slot.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link to="/register"><Button size="lg">Get Started</Button></Link>
            <a href="#about-anchor">
              <Button
                size="lg"
                variant="outline"
                iconRight={ArrowRight}
                className={isDark ? '!border-white/25 !text-white hover:!bg-white/10' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('about-anchor')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Campus
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div id="about-anchor" />
    </div>
  );
}
