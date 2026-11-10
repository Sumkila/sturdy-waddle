/**
 * Accessible UserMenu with animated dropdown transitions.
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../auth/useAuth';
import { UserRole } from '../../types/auth';

const ALL_ROLES: UserRole[] = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'];

export const UserMenu: React.FC = () => {
  const { user, role, logout, switchRoleForDev } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold uppercase shadow-xs">
          {user?.username?.[0] || 'U'}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 leading-tight">
            {user?.username || 'User'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            {role || 'STUDENT'}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50 text-xs origin-top-right"
          >
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="font-semibold text-slate-900">{user?.username}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Authenticated User'}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                Role: {role}
              </div>
            </div>

            {/* Quick role switcher for testing all backend roles */}
            <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3" />
              Switch Active Role
            </div>
            <div className="px-2 py-1 space-y-0.5 border-b border-slate-100">
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRoleForDev(r);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center justify-between cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    role === r
                      ? 'bg-sky-50 text-sky-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <span className="text-[10px] text-sky-600 font-bold">Active</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-all duration-150 text-left font-medium cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-b-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
