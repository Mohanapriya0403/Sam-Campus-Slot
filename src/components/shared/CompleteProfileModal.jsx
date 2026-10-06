import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { DEPARTMENTS } from '../../data/classrooms';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../context/ToastContext';

const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

/** Shown exactly once, right after a brand-new Google sign-in, since Google
 * only ever gives us a name + verified email — never department/year. Every
 * other page that needs those (timetable, venue booking, smart allocation)
 * assumes they're set, so this closes that gap before the person goes
 * anywhere else. */
export default function CompleteProfileModal({ open, onDone }) {
  const { completeProfile } = useAuth();
  const showToast = useToastContext();
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('III Year');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await completeProfile({ department, year });
    setSaving(false);
    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Profile set up — welcome aboard!', 'success');
    onDone?.();
  };

  return (
    <Modal open={open} onClose={() => {}} title="Just one more thing">
      <div className="space-y-5">
        <div className="flex items-start gap-3 text-sm text-ink-500 dark:text-ink-400">
          <GraduationCap size={18} className="text-brand-600 shrink-0 mt-0.5" />
          <p>Google didn't tell us your department or year — pick them now so your timetable and venues load correctly. You can change these later in Settings.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
        <Button className="w-full" loading={saving} onClick={handleSave}>Continue</Button>
      </div>
    </Modal>
  );
}
