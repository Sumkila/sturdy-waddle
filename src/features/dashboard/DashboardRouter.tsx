/**
 * Role-Based Dashboard Router.
 *
 * Dynamically renders the dashboard view suited to the active user's role.
 */

import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { AdminDashboard } from './AdminDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { ParentDashboard } from './ParentDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardRouter: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'ADMIN':
    case 'PRINCIPAL':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
};
