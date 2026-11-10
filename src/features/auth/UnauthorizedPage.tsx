/**
 * Unauthorized (403) and Not Found (404) fallback views.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
      <p className="mt-2 text-xs text-slate-500 max-w-sm">
        Your current user role does not grant permission to view or manage this section.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/dashboard">
          <Button size="sm" leftIcon={<Home className="w-3.5 h-3.5" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">404</h1>
      <h2 className="text-base font-semibold text-slate-800 mt-2">Page Not Found</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The route you are looking for does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};
