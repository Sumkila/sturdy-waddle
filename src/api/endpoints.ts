/**
 * Centralized API endpoint registry.
 *
 * All backend routes and URL builders are isolated here.
 * If endpoint paths or URL parameter structures change on a different backend,
 * update this mapping without modifying feature pages or UI components.
 */

export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },
  students: {
    list: '/students',
    create: '/students',
    byId: (id: string) => `/students/${encodeURIComponent(id)}`,
    profile: (id: string) => `/students/${encodeURIComponent(id)}/profile`,
    search: '/students/search',
    byClass: (className: string) => `/students/class/${encodeURIComponent(className)}`,
    byGrade: (grade: string) => `/students/grade/${encodeURIComponent(grade)}`,
    update: (id: string) => `/students/${encodeURIComponent(id)}`,
    updateStatus: (id: string) => `/students/${encodeURIComponent(id)}/status`,
    attendance: (studentId: string) => `/students/${encodeURIComponent(studentId)}/attendance`,
    attendanceSummary: '/students/attendance/summary',
    attendanceList: '/students/attendance',
    attendanceBulk: '/students/attendance/bulk',
  },
  results: {
    list: '/results',
    create: '/results',
    byId: (id: string) => `/results/${encodeURIComponent(id)}`,
    update: (id: string) => `/results/${encodeURIComponent(id)}`,
    delete: (id: string) => `/results/${encodeURIComponent(id)}`,
  },
  subjects: {
    list: '/subjects',
    create: '/subjects',
    byId: (id: string) => `/subjects/${encodeURIComponent(id)}`,
    update: (id: string) => `/subjects/${encodeURIComponent(id)}`,
    delete: (id: string) => `/subjects/${encodeURIComponent(id)}`,
  },
  teachers: {
    list: '/teachers',
    create: '/teachers',
    byId: (id: string) => `/teachers/${encodeURIComponent(id)}`,
    update: (id: string) => `/teachers/${encodeURIComponent(id)}`,
    delete: (id: string) => `/teachers/${encodeURIComponent(id)}`,
  },
  parents: {
    list: '/parents',
    create: '/parents',
    byId: (id: string) => `/parents/${encodeURIComponent(id)}`,
    byEmail: (email: string) => `/parents/email/${encodeURIComponent(email)}`,
    byPhone: (phone: string) => `/parents/phone/${encodeURIComponent(phone)}`,
    update: (id: string) => `/parents/${encodeURIComponent(id)}`,
    delete: (id: string) => `/parents/${encodeURIComponent(id)}`,
  },
} as const;

export type Endpoints = typeof endpoints;
