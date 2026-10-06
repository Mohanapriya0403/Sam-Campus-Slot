import { Sparkles } from 'lucide-react';

// The special "glowing but not flashy" treatment for smart classrooms, used everywhere
// a smart room is referenced (explorer, floor map, my venues, allocation results).
export default function SmartBadge({ size = 'sm' }) {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold glow-smart bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 ${
        isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <Sparkles size={isSm ? 10 : 12} /> SMART
    </span>
  );
}
