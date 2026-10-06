import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = {
  success: 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  error: 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  info: 'border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300',
};

export default function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  return (
    <div
      className={`flex items-center gap-3 min-w-[280px] max-w-sm px-4 py-3 rounded-xl bg-white dark:bg-ink-800 border ${COLORS[toast.type]} shadow-glow animate-fade-up`}
      role="status"
    >
      <Icon size={18} className="shrink-0" />
      <p className="text-sm text-ink-700 dark:text-ink-100 flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="text-ink-400 hover:text-ink-600">
        <X size={15} />
      </button>
    </div>
  );
}
