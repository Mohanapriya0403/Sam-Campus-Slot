import Card from '../ui/Card';

export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-display font-semibold">{title}</h4>
          {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
