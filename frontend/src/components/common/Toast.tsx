import { useEffect } from 'react';
import { create } from 'zustand';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

const toastColors: Record<ToastType, string> = {
  success: '#0B8043',
  error: '#C62828',
  warning: '#E65100',
};

function ToastItemComponent({ toast }: { toast: ToastItem }) {
  const { removeToast } = useToastStore();

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '8px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderLeft: `4px solid ${toastColors[toast.type]}`,
        minWidth: '240px',
        maxWidth: '360px',
      }}
    >
      <span style={{ flex: 1, fontSize: '14px', color: 'var(--neutral-900)' }}>{toast.message}</span>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-500)', padding: '2px' }}
        aria-label="닫기"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Toast() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
