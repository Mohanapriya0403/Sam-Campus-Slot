import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, tips }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
        <Icon size={28} className="text-brand-500" />
      </div>
      <h3 className="font-display font-semibold text-lg mb-1.5">{title}</h3>
      {description && <p className="text-sm text-ink-500 dark:text-ink-400 max-w-sm mb-4">{description}</p>}
      {tips && tips.length > 0 && (
        <ul className="text-sm text-ink-500 dark:text-ink-400 text-left space-y-1 mb-5">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" /> {tip}
            </li>
          ))}
        </ul>
      )}
      {action}
    </div>
  );
}
