/**
 * LoadingOverlay component for full-container async action blocking.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Processing...' }) => {
  return (
    <div
      role="status"
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs rounded-xl"
    >
      <Loader2 className="w-6 h-6 animate-spin text-slate-800" />
      <p className="mt-2 text-xs font-medium text-slate-700">{message}</p>
    </div>
  );
};
