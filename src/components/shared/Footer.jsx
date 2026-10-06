import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Logo size="sm" />
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-4 max-w-xs">
            Smart Allocation &amp; Management for Campus Slots — pairing every class with its ideal room, automatically.
          </p>
        </div>
        <div>
          <h5 className="font-display font-semibold text-sm mb-3">Product</h5>
          <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
            <li><Link to="/features" className="hover:text-brand-600">Features</Link></li>
            <li><Link to="/how-it-works" className="hover:text-brand-600">How it works</Link></li>
            <li><Link to="/about" className="hover:text-brand-600">About</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-display font-semibold text-sm mb-3">Company</h5>
          <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
            <li><Link to="/contact" className="hover:text-brand-600">Contact</Link></li>
            <li><Link to="/login" className="hover:text-brand-600">Login</Link></li>
            <li><Link to="/register" className="hover:text-brand-600">Get Started</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-display font-semibold text-sm mb-3">Campus Office</h5>
          <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
            <li className="flex items-center gap-2"><MapPin size={15} /> Sam Institute of Technology, Tamil Nadu</li>
            <li className="flex items-center gap-2"><Mail size={15} /> support@samcampusslot.edu</li>
            <li className="flex items-center gap-2"><Phone size={15} /> +91 98765 43210</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100 dark:border-ink-800 py-5 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} Sam Campus Slot. Built for the EL Project Evaluation.
      </div>
    </footer>
  );
}
