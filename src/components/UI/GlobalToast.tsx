// ============================================================
// QuantumLearn AI — Global Toast Notification Banner
// Beautiful floating glassmorphic notification banner
// Handles route location state & global window events
// ============================================================

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function GlobalToast() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState<ToastData | null>(null);

  // 1. Listen for route navigation location state (e.g. from /auth redirect)
  useEffect(() => {
    const state = location.state as { toastMessage?: string; toastType?: 'success' | 'error' | 'info' } | null;
    if (state?.toastMessage) {
      setToast({
        id: Date.now().toString(),
        message: state.toastMessage,
        type: state.toastType || 'success',
      });

      // Clear state from location history so refresh won't re-trigger toast
      const newNextState = { ...location.state };
      delete newNextState.toastMessage;
      delete newNextState.toastType;
      navigate(location.pathname, { replace: true, state: newNextState });
    }
  }, [location, navigate]);

  // 2. Listen for custom window events: window.dispatchEvent(new CustomEvent('quantum_toast', { detail: { message, type } }))
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: 'success' | 'error' | 'info' }>;
      if (customEvent.detail?.message) {
        setToast({
          id: Date.now().toString(),
          message: customEvent.detail.message,
          type: customEvent.detail.type || 'success',
        });
      }
    };

    window.addEventListener('quantum_toast', handleCustomToast);
    return () => window.removeEventListener('quantum_toast', handleCustomToast);
  }, []);

  // 3. Auto dismiss after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-md w-full sm:w-auto animate-fade-in pointer-events-auto">
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#12172A]/95 light:bg-white/95 border border-[var(--signal-cyan)]/40 light:border-black/15 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(79,209,217,0.15)] backdrop-blur-2xl text-[var(--ink)] text-xs sm:text-sm font-medium transition-all">
        {toast.type === 'error' ? (
          <div className="w-7 h-7 rounded-xl bg-[var(--error)]/15 border border-[var(--error)]/30 text-[var(--error)] flex items-center justify-center shrink-0">
            <AlertCircle size={16} />
          </div>
        ) : toast.type === 'info' ? (
          <div className="w-7 h-7 rounded-xl bg-[var(--signal-cyan)]/15 border border-[var(--signal-cyan)]/30 text-[var(--signal-cyan)] flex items-center justify-center shrink-0">
            <Info size={16} />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-xl bg-[var(--success)]/15 border border-[var(--success)]/30 text-[var(--success)] flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
        )}

        <div className="flex-1 pr-2 leading-relaxed">
          <span className="text-[var(--ink)] font-semibold">{toast.message}</span>
        </div>

        <button
          onClick={() => setToast(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-[var(--ink)] hover:bg-white/10 light:hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// Global helper function to trigger toasts anywhere in code without hooks
export function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  window.dispatchEvent(
    new CustomEvent('quantum_toast', {
      detail: { message, type },
    })
  );
}
