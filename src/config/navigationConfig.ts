/**
 * Centralized Navigation Configuration.
 *
 * Defines sidebar and topbar navigation links, permissions, icons, and categories.
 * All route access and UI visibility is configuration-driven.
 */

import { AppCapability, hasPermission } from './permissionsConfig';
import { UserRole } from '../types/auth';

export interface NavItem {
  name: string;
  href: string;
  iconName: string;
  capability?: AppCapability;
  allowedRoles?: UserRole[];
  badge?: string;
  description?: string;
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    category: 'Core',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        iconName: 'LayoutDashboard',
        capability: 'VIEW_DASHBOARD',
        description: 'System overview and metrics',
      },
    ],
  },
  {
    category: 'Academic Management',
    items: [
      {
        name: 'Students',
        href: '/students',
        iconName: 'Users',
        capability: 'VIEW_ALL_STUDENTS',
        description: 'Student directory and records',
      },
      {
        name: 'Attendance',
        href: '/attendance',
        iconName: 'CalendarCheck',
        capability: 'VIEW_ATTENDANCE',
        description: 'Daily registers and statistics',
      },
      {
        name: 'Results',
        href: '/results',
        iconName: 'GraduationCap',
        capability: 'VIEW_DASHBOARD', // available to all roles in various views
        description: 'Grades and report cards',
      },
      {
        name: 'Subjects',
        href: '/subjects',
        iconName: 'BookOpen',
        capability: 'MANAGE_SUBJECTS',
        description: 'Curriculum and courses',
      },
    ],
  },
  {
    category: 'Administration',
    items: [
      {
        name: 'Teachers',
        href: '/teachers',
        iconName: 'UserCheck',
        capability: 'VIEW_TEACHERS',
        description: 'Faculty directory',
      },
      {
        name: 'Parents',
        href: '/parents',
        iconName: 'HeartHandshake',
        capability: 'MANAGE_PARENTS',
        description: 'Guardians and contacts',
      },
    ],
  },
];

/**
 * Filter navigation items based on the active user role.
 */
export function getVisibleNavigation(role: UserRole | null | undefined): NavGroup[] {
  if (!role) return [];

  return navigationConfig
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (item.capability && !hasPermission(role, item.capability)) {
          return false;
        }
        if (item.allowedRoles && !item.allowedRoles.includes(role)) {
          return false;
        }
        return true;
      });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
}
