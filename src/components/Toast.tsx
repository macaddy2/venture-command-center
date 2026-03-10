import { createContext, useContext, useState, useCallback, type ReactNode, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: ReactElement }> = {
    success: {
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.3)',
        icon: <CheckCircle2 size={16} color="var(--color-success)" />,
    },
    error: {
        bg: 'rgba(239,68,68,0.12)',
        border: 'rgba(239,68,68,0.3)',
        icon: <XCircle size={16} color="var(--color-danger)" />,
    },
    info: {
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.3)',
        icon: <Info size={16} color="var(--color-info)" />,
    },
    warning: {
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.3)',
        icon: <AlertTriangle size={16} color="var(--color-warning)" />,
    },
};

let _toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(t => t.filter(x => x.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = String(++_toastId);
        setToasts(t => [...t, { id, message, type }]);
        setTimeout(() => dismiss(id), duration);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                pointerEvents: 'none',
            }}>
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => {
                        const s = TOAST_STYLES[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ x: 60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 60, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                style={{
                                    pointerEvents: 'auto',
                                    background: s.bg,
                                    border: `1px solid ${s.border}`,
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: 'var(--border-radius-md)',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    minWidth: 260,
                                    maxWidth: 380,
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
                                {s.icon}
                                <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                    {toast.message}
                                </span>
                                <button
                                    onClick={() => dismiss(toast.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', display: 'flex' }}
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
