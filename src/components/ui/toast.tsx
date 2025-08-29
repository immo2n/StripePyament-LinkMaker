"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, X, Copy, Warning } from "@phosphor-icons/react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
  showCopyButton?: boolean;
  copyText?: string;
}

export function Toast({ 
  message, 
  type = "info", 
  duration = 4000, 
  onClose,
  showCopyButton = false,
  copyText = ""
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-emerald-600" weight="fill" />;
      case "error":
        return <Warning className="w-6 h-6 text-red-600" weight="fill" />;
      default:
        return <Copy className="w-6 h-6 text-blue-600" weight="fill" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${getColors()}
          border rounded-lg shadow-lg p-4 max-w-sm w-full
          transform transition-all duration-300 ease-in-out
          ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex space-x-2">
            {showCopyButton && (
              <button
                onClick={handleCopy}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Provider Context
interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info", options?: { showCopyButton?: boolean; copyText?: string }) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info";
    showCopyButton?: boolean;
    copyText?: string;
  }>>([]);

  const showToast = (
    message: string, 
    type: "success" | "error" | "info" = "info",
    options: { showCopyButton?: boolean; copyText?: string } = {}
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, ...options }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          showCopyButton={toast.showCopyButton}
          copyText={toast.copyText}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}