"use client";

import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-top-5 fade-in-0">
      <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg shadow-lg backdrop-blur-sm">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-destructive">Action Failed</h4>
          <p className="text-sm text-destructive/90 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-destructive/20 transition-colors"
        >
          <X className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}