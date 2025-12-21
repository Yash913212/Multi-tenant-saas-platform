import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const icons = {
    success: <FiCheckCircle className="text-green-500" size={20} />,
    error: <FiAlertCircle className="text-red-500" size={20} />,
    warning: <FiAlertCircle className="text-yellow-500" size={20} />,
    info: <FiAlertCircle className="text-blue-500" size={20} />,
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${bgColors[type]} ${textColors[type]}`}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-75 transition-opacity">
        <FiX size={20} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-40">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
