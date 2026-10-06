import { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import ToastStack from '../components/ui/ToastStack';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, showToast, dismissToast } = useToast();
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
