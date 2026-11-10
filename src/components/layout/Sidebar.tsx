/**
 * Sidebar Navigation component for staff roles (Admin, Principal, Teacher).
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  BookOpen,
  UserCheck,
  HeartHandshake,
  GraduationCap as SchoolIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { getVisibleNavigation } from '../../config/navigationConfig';
import { appConfig } from '../../config/appConfig';
import { cn } from '../../lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  BookOpen,
  UserCheck,
  HeartHandshake,
};

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const navGroups = getVisibleNavigation(role);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <SchoolIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-white tracking-tight text-base truncate">
              {appConfig.appName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {navGroups.map((group) => (
            <div key={group.category} className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                {group.category}
              </div>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]',
                          isActive
                            ? 'bg-sky-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/90 hover:translate-x-0.5'
                        )
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom environment badge */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-slate-400">API: {appConfig.apiUrl}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
