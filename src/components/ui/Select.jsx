import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, children, className = '', id, ...props }, ref) => {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full appearance-none rounded-xl border ${
            error ? 'border-red-400' : 'border-ink-200 dark:border-ink-700'
          } bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-brand-300 transition-all ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
export default Select;
