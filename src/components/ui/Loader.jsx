import { Loader2 } from 'lucide-react';

export function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400">
      <Loader2 size={28} className="animate-spin text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-ink-100 dark:bg-ink-700 rounded-xl ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 dark:border-ink-800 p-5 space-y-3">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-full mt-2" />
    </div>
  );
}
