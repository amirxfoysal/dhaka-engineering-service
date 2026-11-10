import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import './ToastContext.css';

export type ToastTone = 'info' | 'success' | 'danger';

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4200;

const DEDUPE_MS = 800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const lastToastRef = useRef<{ key: string; at: number } | null>(null);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const trimmed = message.trim();
      if (!trimmed) return;

      const key = `${tone}:${trimmed}`;
      const now = Date.now();
      const last = lastToastRef.current;
      if (last && last.key === key && now - last.at < DEDUPE_MS) return;
      lastToastRef.current = { key, at: now };

      const id = `toast-${now}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((list) => {
        const withoutSame = list.filter((toast) => `${toast.tone}:${toast.message}` !== key);
        return [...withoutSame.slice(-2), { id, message: trimmed, tone }];
      });
      const timer = window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="app-toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div key={toast.id} className={`app-toast app-toast--${toast.tone}`} role="status">
            <span className="app-toast__icon" aria-hidden>
              {toast.tone === 'danger' ? (
                <Info size={18} strokeWidth={2.2} />
              ) : (
                <CheckCircle2 size={18} strokeWidth={2.2} />
              )}
            </span>
            <p>{toast.message}</p>
            <button
              type="button"
              className="app-toast__close"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
