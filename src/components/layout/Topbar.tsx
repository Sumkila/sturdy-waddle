/**
 * Topbar layout component following the 3-zone contract.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, GraduationCap } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useAuth } from '../../auth/useAuth';
import { appConfig } from '../../config/appConfig';
import { cn } from '../../lib/utils';

export interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle, title }) => {
  const { role } = useAuth();
  const isPortalUser = role === 'PARENT' || role === 'STUDENT';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Left - Brand or Mobile toggle / Page Title */}
      <div className="flex items-center gap-3">
        {!isPortalUser ? (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-50 text-sky-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">
              {appConfig.appName} Portal
            </span>
          </div>
        )}

        {title && (
          <div className="hidden sm:block text-sm font-semibold text-slate-800 truncate">
            {title}
          </div>
        )}
      </div>

      {/* Zone 2: Center - Horizontal nav links for Parent / Student portals */}
      {isPortalUser && (
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                'hover:text-slate-900 transition-all duration-150 whitespace-nowrap py-1 px-1.5 rounded active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                isActive && 'text-sky-700 font-semibold border-b-2 border-sky-600'
              )
            }
          >
            Dashboard
          </NavLink>
          {role === 'PARENT' && (
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                cn(
                  'hover:text-slate-900 transition-all duration-150 whitespace-nowrap py-1 px-1.5 rounded active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                  isActive && 'text-sky-700 font-semibold border-b-2 border-sky-600'
                )
              }
            >
              Child Attendance
            </NavLink>
          )}
          <NavLink
            to="/results"
            className={({ isActive }) =>
              cn(
                'hover:text-slate-900 transition-all duration-150 whitespace-nowrap py-1 px-1.5 rounded active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                isActive && 'text-sky-700 font-semibold border-b-2 border-sky-600'
              )
            }
          >
            {role === 'PARENT' ? 'Child Results' : 'My Results'}
          </NavLink>
          {role === 'STUDENT' && (
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                cn(
                  'hover:text-slate-900 transition-all duration-150 whitespace-nowrap py-1 px-1.5 rounded active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                  isActive && 'text-sky-700 font-semibold border-b-2 border-sky-600'
                )
              }
            >
              My Attendance
            </NavLink>
          )}
        </nav>
      )}

      {/* Zone 3: Right - Account & User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        <UserMenu />
      </div>
    </header>
  );
};
