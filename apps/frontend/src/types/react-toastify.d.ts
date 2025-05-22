import * as React from 'react';
declare module 'react-toastify' {
  export interface ToastContainerProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    autoClose?: number | false;
    hideProgressBar?: boolean;
    newestOnTop?: boolean;
    closeOnClick?: boolean;
    rtl?: boolean;
    pauseOnFocusLoss?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
    className?: string;
    style?: React.CSSProperties;
    toastStyle?: React.CSSProperties;
  }

  export const ToastContainer: React.FC<ToastContainerProps>;
  export const toast: {
    success: Function;
    error: Function;
    info: Function;
    warning: Function;
    default: Function;
  };
}
