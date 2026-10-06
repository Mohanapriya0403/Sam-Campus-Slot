import { useEffect, useState, useRef } from 'react';
import Card from '../ui/Card';

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let frame;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function StatCard({ icon: Icon, label, value, suffix = '', tone = 'brand', trend }) {
  const numeric = typeof value === 'number' ? value : parseInt(value, 10) || 0;
  const animated = useCountUp(numeric);
  const display = typeof value === 'number' ? animated : value;

  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
    accent: 'bg-slot-50 text-slot-600 dark:bg-slot-900/30 dark:text-slot-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <Card hover className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          <Icon size={18} />
        </div>
        {trend && <span className="text-xs font-semibold text-green-600">{trend}</span>}
      </div>
      <p className="font-display text-2xl font-bold">{display}{suffix}</p>
      <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{label}</p>
    </Card>
  );
}
