export default function Card({ children, className = '', hover = false, glass = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 dark:border-ink-800 ${glass ? 'glass' : 'bg-white dark:bg-ink-800/60'} shadow-soft ${
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glow' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
