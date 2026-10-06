import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToastContext } from '../../context/ToastContext';

export default function Contact() {
  const showToast = useToastContext();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Message should be at least 10 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      showToast('Your message has been sent. We\u2019ll get back to you soon.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 900);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 grid md:grid-cols-5 gap-10">
      <div className="md:col-span-2">
        <h1 className="font-display text-3xl font-bold mb-3">Get in touch</h1>
        <p className="text-ink-500 dark:text-ink-400 mb-8">Questions about deploying Sam Campus Slot on your campus? Reach out.</p>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"><MapPin size={16} className="text-brand-600" /></div>
            Sam Institute of Technology, Tamil Nadu
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"><Mail size={16} className="text-brand-600" /></div>
            support@samcampusslot.edu
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"><Phone size={16} className="text-brand-600" /></div>
            +91 98765 43210
          </div>
        </div>
      </div>

      <Card className="md:col-span-3 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="Name" placeholder="Your full name" value={form.name} error={errors.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" placeholder="you@campus.edu" value={form.email} error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Input label="Subject" placeholder="What is this about?" value={form.subject} error={errors.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1.5">Message</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us a bit more..."
              className={`w-full rounded-xl border ${errors.message ? 'border-red-400' : 'border-ink-200 dark:border-ink-700'} bg-white dark:bg-ink-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300 transition-all`}
            />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
          </div>
          <Button type="submit" icon={Send} loading={sending} className="w-full sm:w-auto">Send Message</Button>
        </form>
      </Card>
    </div>
  );
}
