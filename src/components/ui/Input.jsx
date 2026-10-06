import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', id, type, ...props }, ref) => {
  const inputId = id || props.name;
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`w-full rounded-xl border ${
            error ? 'border-red-400 focus:ring-red-300' : 'border-ink-200 dark:border-ink-700 focus:ring-brand-300'
          } bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 px-4 py-2.5 ${Icon ? 'pl-10' : ''} ${
            isPassword ? 'pr-11' : ''
          } text-sm outline-none focus:ring-2 transition-all placeholder:text-ink-400 ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 focus:outline-none transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
