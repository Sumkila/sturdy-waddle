/**
 * Route path constants and definitions.
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/dashboard',

  STUDENTS: '/students',
  STUDENT_NEW: '/students/new',
  STUDENT_DETAIL: (id: string) => `/students/${id}`,
  STUDENT_EDIT: (id: string) => `/students/${id}/edit`,

  ATTENDANCE: '/attendance',
  ATTENDANCE_SUMMARY: '/attendance/summary',

  RESULTS: '/results',
  RESULT_NEW: '/results/new',
  RESULT_EDIT: (id: string) => `/results/${id}/edit`,

  SUBJECTS: '/subjects',
  SUBJECT_NEW: '/subjects/new',
  SUBJECT_EDIT: (id: string) => `/subjects/${id}/edit`,

  TEACHERS: '/teachers',
  TEACHER_NEW: '/teachers/new',
  TEACHER_EDIT: (id: string) => `/teachers/${id}/edit`,

  PARENTS: '/parents',
  PARENT_NEW: '/parents/new',
  PARENT_EDIT: (id: string) => `/parents/${id}/edit`,
} as const;
