import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils/helpers';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const Icon = icons[toast.type];
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in-right',
        colors[toast.type]
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColors[toast.type])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{toast.title}</p>
        {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); onClose(toast.id); }}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Закрыть"
      >
        <X className="w-4 h-4 opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    if (toast.duration !== 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), toast.duration ?? 4000);
    }
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={hideToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Convenience hooks
export function useSuccessToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => 
    showToast({ type: 'success', title, message }), [showToast]);
}

export function useErrorToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => 
    showToast({ type: 'error', title, message }), [showToast]);
}

export function useWarningToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => 
    showToast({ type: 'warning', title, message }), [showToast]);
}

export function useInfoToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => 
    showToast({ type: 'info', title, message }), [showToast]);
}