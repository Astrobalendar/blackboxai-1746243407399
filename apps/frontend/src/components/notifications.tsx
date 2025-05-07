import { toast } from 'react-toastify';

export interface NotificationOptions {
  title: string;
  message: string;
  details?: string;
}

export const createErrorNotification = ({ title, message, details }: NotificationOptions) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    title,
    body: details ? `${message}\n\nDetails: ${details}` : message,
  });
};
