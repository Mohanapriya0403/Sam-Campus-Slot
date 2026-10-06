import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', tone = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={tone} onClick={() => { onConfirm?.(); onClose?.(); }}>{confirmLabel}</Button>
      </>
    }>
      <div className="flex gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-300">{description}</p>
      </div>
    </Modal>
  );
}
