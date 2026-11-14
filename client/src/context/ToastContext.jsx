import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, title, message) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, title, message, in: false }]);

        // Smooth slide-in trigger next frame
        requestAnimationFrame(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, in: true } : t))
            );
        });

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, in: false } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 350);
    }, []);

    const toast = {
        success: (title, message) => addToast('ok', title, message),
        error: (title, message) => addToast('bad', title, message),
        info: (title, message) => addToast('brand', title, message),
        warn: (title, message) => addToast('warn', title, message),
    };

    const getDotColor = (type) => {
        switch (type) {
            case 'ok': return 'var(--ok)';
            case 'bad': return 'var(--bad)';
            case 'brand': return 'var(--brand)';
            case 'warn': return 'var(--warn)';
            default: return 'var(--brand)';
        }
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* 6. Floating Toasts Container */}
            <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))] pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`toast pointer-events-auto flex gap-3 items-start bg-surface border border-line rounded-xl p-3 shadow-lg ${t.in ? 'in' : ''
                            }`}
                        role="status"
                    >
                        <i
                            className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: getDotColor(t.type) }}
                        />
                        <div className="flex-1 min-w-0">
                            <b className="font-medium text-ink text-sm block">{t.title}</b>
                            {t.message && <p className="text-sub text-xs mt-0.5">{t.message}</p>}
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            aria-label="Dismiss"
                            className="text-mute hover:text-ink text-sm px-1 cursor-pointer transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};