/**
 * Top-level Application Routes with guards.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { UnauthorizedPage, NotFoundPage } from '../features/auth/UnauthorizedPage';
import { DashboardRouter } from '../features/dashboard/DashboardRouter';
import { StudentListPage } from '../features/students/StudentListPage';
import { StudentProfilePage } from '../features/students/StudentProfilePage';
import { StudentFormPage } from '../features/students/StudentFormPage';
import { AttendanceRegisterPage } from '../features/attendance/AttendanceRegisterPage';
import { AttendanceSummaryPage } from '../features/attendance/AttendanceSummaryPage';
import { ResultListPage } from '../features/results/ResultListPage';
import { ResultFormPage } from '../features/results/ResultFormPage';
import { SubjectListPage } from '../features/subjects/SubjectListPage';
import { SubjectFormPage } from '../features/subjects/SubjectFormPage';
import { TeacherListPage } from '../features/teachers/TeacherListPage';
import { TeacherFormPage } from '../features/teachers/TeacherFormPage';
import { ParentListPage } from '../features/parents/ParentListPage';
import { ParentFormPage } from '../features/parents/ParentFormPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Authenticated Protected Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* Students */}
        <Route path="/students" element={<StudentListPage />} />
        <Route
          path="/students/new"
          element={
            <ProtectedRoute requiredCapability="CREATE_STUDENT">
              <StudentFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="/students/:id" element={<StudentProfilePage />} />
        <Route
          path="/students/:id/edit"
          element={
            <ProtectedRoute requiredCapability="EDIT_STUDENT">
              <StudentFormPage />
            </ProtectedRoute>
          }
        />

        {/* Attendance */}
        <Route path="/attendance" element={<AttendanceRegisterPage />} />
        <Route path="/attendance/summary" element={<AttendanceSummaryPage />} />

        {/* Academic Results */}
        <Route path="/results" element={<ResultListPage />} />
        <Route
          path="/results/new"
          element={
            <ProtectedRoute requiredCapability="CREATE_RESULT">
              <ResultFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:id/edit"
          element={
            <ProtectedRoute requiredCapability="EDIT_RESULT">
              <ResultFormPage />
            </ProtectedRoute>
          }
        />

        {/* Subjects */}
        <Route
          path="/subjects"
          element={
            <ProtectedRoute requiredCapability="MANAGE_SUBJECTS">
              <SubjectListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/new"
          element={
            <ProtectedRoute requiredCapability="MANAGE_SUBJECTS">
              <SubjectFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:id/edit"
          element={
            <ProtectedRoute requiredCapability="MANAGE_SUBJECTS">
              <SubjectFormPage />
            </ProtectedRoute>
          }
        />

        {/* Teachers */}
        <Route
          path="/teachers"
          element={
            <ProtectedRoute requiredCapability="VIEW_TEACHERS">
              <TeacherListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/new"
          element={
            <ProtectedRoute requiredCapability="MANAGE_TEACHERS">
              <TeacherFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/:id/edit"
          element={
            <ProtectedRoute requiredCapability="MANAGE_TEACHERS">
              <TeacherFormPage />
            </ProtectedRoute>
          }
        />

        {/* Parents */}
        <Route
          path="/parents"
          element={
            <ProtectedRoute requiredCapability="MANAGE_PARENTS">
              <ParentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents/new"
          element={
            <ProtectedRoute requiredCapability="MANAGE_PARENTS">
              <ParentFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents/:id/edit"
          element={
            <ProtectedRoute requiredCapability="MANAGE_PARENTS">
              <ParentFormPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All within Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Global fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
