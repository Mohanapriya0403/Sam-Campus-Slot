import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
      <CompassIcon size={40} className="text-brand-400 mb-4" />
      <h1 className="font-display text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-ink-500 dark:text-ink-400 mb-6 max-w-sm">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/"><Button>Back to Home</Button></Link>
    </div>
  );
}
