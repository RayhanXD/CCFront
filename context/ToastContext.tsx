import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Toast, { ToastType } from '@/components/toast/Toast';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
}

interface ToastItem extends ToastOptions {
  id: string;
  visible: boolean;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => string; // Returns toast ID
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

// Helper function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Clean up toasts that are no longer visible
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.visible));
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  const showToast = ({
    message,
    type = 'info',
    duration = 3000,
    position = 'top',
  }: ToastOptions): string => {
    const id = generateId();
    
    setToasts(currentToasts => [
      ...currentToasts,
      {
        id,
        visible: true,
        message,
        type,
        duration,
        position,
      }
    ]);
    
    return id;
  };

  const hideToast = (id: string) => {
    setToasts(currentToasts => 
      currentToasts.map(toast => 
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );
  };
  
  const hideAllToasts = () => {
    setToasts(currentToasts => 
      currentToasts.map(toast => ({ ...toast, visible: false }))
    );
  };

  // Group toasts by position
  const topToasts = toasts.filter(toast => toast.position === 'top' && toast.visible);
  const bottomToasts = toasts.filter(toast => toast.position === 'bottom' && toast.visible);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        hideAllToasts,
      }}
    >
      {children}
      
      {/* Render top toasts */}
      {topToasts.map((toast, index) => (
        <Toast
          key={toast.id}
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position="top"
          onClose={() => hideToast(toast.id)}
          style={{ top: 50 + index * 70 }} // Stack toasts with 70px spacing
        />
      ))}
      
      {/* Render bottom toasts */}
      {bottomToasts.map((toast, index) => (
        <Toast
          key={toast.id}
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position="bottom"
          onClose={() => hideToast(toast.id)}
          style={{ bottom: 50 + index * 70 }} // Stack toasts with 70px spacing
        />
      ))}
    </ToastContext.Provider>
  );
};
