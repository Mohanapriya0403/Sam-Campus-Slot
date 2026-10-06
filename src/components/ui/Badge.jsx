const STYLES = {
  available: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  occupied: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  upcoming: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  completed: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
  info: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
};

export default function Badge({ children, tone = 'neutral', className = '', dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STYLES[tone] || STYLES.neutral} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
