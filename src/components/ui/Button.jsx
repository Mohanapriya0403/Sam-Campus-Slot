import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft focus-visible:ring-brand-300',
  accent: 'bg-slot-500 text-ink-900 hover:bg-slot-600 shadow-soft',
  outline: 'border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800',
  ghost: 'text-ink-600 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
};

const Button = forwardRef(
  ({ children, variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
        {children}
        {!loading && IconRight ? <IconRight size={16} /> : null}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
