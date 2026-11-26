import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        showSuccess: (m) => addToast(m, 'success'),
        showError: (m) => addToast(m, 'error'),
        showInfo: (m) => addToast(m, 'info'),
      }}
    >
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '10px',
              background: t.type === 'error' ? '#fef2f2' : t.type === 'info' ? '#f0f9ff' : '#f0fdf4',
              border: `1.5px solid ${t.type === 'error' ? '#f87171' : t.type === 'info' ? '#38bdf8' : '#4ade80'}`,
              color: t.type === 'error' ? '#991b1b' : t.type === 'info' ? '#075985' : '#166534',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
              fontSize: '0.9rem',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {t.type === 'error' && <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />}
            {t.type === 'info' && <Info size={20} color="#0284c7" style={{ flexShrink: 0 }} />}
            {t.type === 'success' && <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                opacity: 0.7,
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showSuccess: (m) => console.log('Toast success:', m),
      showError: (m) => console.error('Toast error:', m),
      showInfo: (m) => console.info('Toast info:', m),
    };
  }
  return ctx;
}
