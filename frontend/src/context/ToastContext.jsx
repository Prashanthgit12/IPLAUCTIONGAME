import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => {
          let bg = 'rgba(15, 26, 48, 0.95)';
          let border = '1px solid rgba(255, 255, 255, 0.15)';
          let icon = 'bi-info-circle-fill text-info';

          if (t.type === 'success') {
            border = '1px solid rgba(0, 230, 118, 0.5)';
            icon = 'bi-check-circle-fill text-success';
          } else if (t.type === 'danger' || t.type === 'error') {
            border = '1px solid rgba(255, 23, 68, 0.5)';
            icon = 'bi-exclamation-octagon-fill text-danger';
          } else if (t.type === 'gold' || t.type === 'warning') {
            border = '1px solid rgba(255, 179, 0, 0.5)';
            icon = 'bi-trophy-fill text-warning';
          }

          return (
            <div
              key={t.id}
              className="fade-in-up"
              style={{
                background: bg,
                border,
                borderRadius: '12px',
                padding: '12px 18px',
                color: '#fff',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                pointerEvents: 'auto'
              }}
            >
              <i className={`bi ${icon} fs-5`}></i>
              <div style={{ flex: 1 }}>{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                <i className="bi bi-x fs-5"></i>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
